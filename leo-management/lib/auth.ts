import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
    userId: string;
    role: string;
    clubId?: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return await compare(password, hashedPassword);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
    return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        return verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Verify authentication from request header
 */
export async function verifyAuth(request: Request): Promise<TokenPayload | null> {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

/**
 * Authenticate user and return user data with token
 */
export async function authenticateUser(username: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: { club: true },
    });

    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        return null;
    }

    const token = generateToken({
        userId: user.id,
        role: user.role,
        clubId: user.clubId || undefined,
    });

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            clubId: user.clubId,
            clubName: user.club?.name,
            logo: user.club?.logo,
        },
    };
}

/**
 * Generate random password for new club accounts
 */
export function generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
