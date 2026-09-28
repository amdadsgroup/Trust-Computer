import crypto from 'crypto';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export interface CreateResetTokenResult {
  success: boolean;
  exists: boolean;
  token?: string;
  email?: string;
  name?: string;
  userType?: 'CUSTOMER' | 'STAFF';
  error?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  error?: string;
  email?: string;
  name?: string;
  userType?: 'CUSTOMER' | 'STAFF';
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Computes a SHA-256 hash of a plaintext reset token.
 * Tokens are stored hashed in the database so that database read access
 * does not reveal actionable reset tokens.
 */
export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

/**
 * Creates a cryptographically secure password reset token for a customer or staff user.
 * Tokens expire after 60 minutes.
 */
export async function createPasswordResetToken(rawEmail: string): Promise<CreateResetTokenResult> {
  try {
    const email = rawEmail.trim().toLowerCase();

    // 1. Check if customer exists with this email
    let userType: 'CUSTOMER' | 'STAFF' = 'CUSTOMER';
    let userName = 'Valued Customer';
    let accountExists = false;

    const customer = await prisma.customerProfile.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    if (customer) {
      accountExists = true;
      userType = 'CUSTOMER';
      userName = customer.fullName || 'Valued Customer';
    } else {
      // 2. Fallback: check if admin / staff user exists with this email
      const staffUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, isActive: true },
      });

      if (staffUser && staffUser.isActive) {
        accountExists = true;
        userType = 'STAFF';
        userName = staffUser.name || 'Staff Member';
      }
    }

    // If account doesn't exist, return success: true, exists: false to mitigate email enumeration
    if (!accountExists) {
      return { success: true, exists: false };
    }

    // 3. Invalidate any existing unused reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // 4. Generate 32 bytes (64 hex characters) of high-entropy randomness
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);

    // 5. Expiration time: 1 hour (60 minutes)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 6. Save token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
        userType,
      },
    });

    return {
      success: true,
      exists: true,
      token: rawToken,
      email,
      name: userName,
      userType,
    };
  } catch (error: any) {
    console.error('createPasswordResetToken error:', error);
    return {
      success: false,
      exists: false,
      error: error.message || 'Failed to generate password reset token.',
    };
  }
}

/**
 * Verifies that a plaintext reset token is valid, unexpired, and unused.
 */
export async function verifyPasswordResetToken(rawToken: string): Promise<VerifyTokenResult> {
  try {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length < 20) {
      return {
        valid: false,
        error: 'Invalid password reset link. Please verify the link from your email.',
      };
    }

    const tokenHash = hashResetToken(rawToken);

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      return {
        valid: false,
        error: 'This password reset link is invalid or has already been used. Please request a new link.',
      };
    }

    if (tokenRecord.usedAt !== null) {
      return {
        valid: false,
        error: 'This password reset link has already been used. Please request a new link.',
      };
    }

    if (tokenRecord.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'This password reset link has expired. Password reset links are valid for 60 minutes.',
      };
    }

    // Resolve user name for personalized greeting
    let userName = 'User';
    if (tokenRecord.userType === 'CUSTOMER') {
      const customer = await prisma.customerProfile.findUnique({
        where: { email: tokenRecord.email },
        select: { fullName: true },
      });
      if (customer?.fullName) userName = customer.fullName;
    } else {
      const staff = await prisma.user.findUnique({
        where: { email: tokenRecord.email },
        select: { name: true },
      });
      if (staff?.name) userName = staff.name;
    }

    return {
      valid: true,
      email: tokenRecord.email,
      name: userName,
      userType: tokenRecord.userType as 'CUSTOMER' | 'STAFF',
    };
  } catch (error: any) {
    console.error('verifyPasswordResetToken error:', error);
    return {
      valid: false,
      error: 'An error occurred while verifying your reset link. Please try again.',
    };
  }
}

/**
 * Atomically updates user password and marks the token as used.
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  try {
    // 1. Verify token
    const verification = await verifyPasswordResetToken(rawToken);
    if (!verification.valid || !verification.email) {
      return {
        success: false,
        error: verification.error || 'Invalid or expired password reset link.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    const email = verification.email;
    const tokenHash = hashResetToken(rawToken);
    const passwordHash = await hashPassword(newPassword);

    // 2. Perform atomic update in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      });

      // Update password in appropriate table
      if (verification.userType === 'CUSTOMER') {
        await tx.customerProfile.update({
          where: { email },
          data: { passwordHash },
        });
      } else {
        await tx.user.update({
          where: { email },
          data: { passwordHash },
        });
      }

      // Cleanup any remaining older tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: { email, NOT: { tokenHash } },
      });
    });

    return {
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    };
  } catch (error: any) {
    console.error('resetPasswordWithToken error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update password. Please try again.',
    };
  }
}
