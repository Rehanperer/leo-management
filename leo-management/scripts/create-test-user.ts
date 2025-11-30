
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();

        // Create Club
        let club = await prisma.club.findFirst({ where: { code: 'TEST001' } });
        if (!club) {
            console.log('Creating test club...');
            club = await prisma.club.create({
                data: {
                    name: 'Test Club',
                    code: 'TEST001',
                    district: 'D1',
                    region: 'R1',
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create/Update User
        let user = await prisma.user.findFirst({ where: { username: 'testuser' } });
        if (user) {
            console.log('Updating existing user password...');
            user = await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        } else {
            console.log('Creating new test user...');
            user = await prisma.user.create({
                data: {
                    username: 'testuser',
                    password: hashedPassword,
                    role: 'ADMIN',
                    clubId: club.id,
                }
            });
        }

        console.log('User ready:');
        console.log('Username: testuser');
        console.log('Password: password123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
