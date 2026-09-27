import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: unknown;
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'trust_computer_fallback_secret_at_least_32_characters_long';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'trust_admin_session';
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);

export async function hashPassword(plainText: string): Promise<string> {
  // 10 rounds = ~100ms on serverless (secure & fast). 12 rounds = ~400ms (too slow for Vercel).
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function signSessionToken(payload: AuthSessionPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: AuthSessionPayload): Promise<string> {
  const token = await signSessionToken(payload);
  const cookieStore = cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AuthSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSessionPayload | null> {
  return getSession();
}

export async function requireAuth(): Promise<AuthSessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: Admin authentication required.');
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthSessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`);
  }
  return session;
}

export async function recordAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const validUserId = await getValidAdminUserId(params.userId);

    await prisma.adminAuditLog.create({
      data: {
        userId: validUserId || undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        detailsJson: params.details ? JSON.stringify(params.details) : undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit log recording failed:', error);
  }
}

/**
 * Safely resolves an admin user ID for database foreign keys.
 * If the provided userId is not a valid UUID (e.g. 'master-owner-root'), or does not
 * exist in the `users` table, it resolves the primary OWNER from the DB.
 * If neither exists, returns null (since all relation foreign keys are nullable).
 * This completely prevents Foreign Key Constraint violations across the application.
 */
export async function getValidAdminUserId(userId?: string | null): Promise<string | null> {
  if (!userId) return null;

  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  if (isValidUuid) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (user) return user.id;
    } catch {
      // ignore db error, continue to fallback
    }
  }

  // Fallback: Find the active OWNER in the users table
  try {
    const owner = await prisma.user.findFirst({
      where: { role: 'OWNER' },
      select: { id: true },
    });
    if (owner) return owner.id;
  } catch {
    // ignore
  }

  return null;
}

