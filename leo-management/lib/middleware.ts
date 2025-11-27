import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export interface AuthContext {
    userId: string;
    role: string;
    clubId?: string;
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
    request: NextRequest,
    handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const auth: AuthContext = {
            userId: payload.userId,
            role: payload.role,
            clubId: payload.clubId,
        };

        return await handler(request, auth);
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Check if user is admin
 */
export function requireAdmin(auth: AuthContext): boolean {
    return auth.role === 'admin';
}

/**
 * Check if resource belongs to user's club
 */
export function checkClubAccess(auth: AuthContext, resourceClubId: string): boolean {
    if (auth.role === 'admin') return true;
    return auth.clubId === resourceClubId;
}
