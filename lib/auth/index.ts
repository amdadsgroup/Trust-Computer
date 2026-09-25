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
  const salt = await bcrypt.genSalt(12);
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
    await prisma.adminAuditLog.create({
      data: {
        userId: params.userId,
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
