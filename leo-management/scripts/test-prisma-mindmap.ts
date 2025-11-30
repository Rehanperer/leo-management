
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected.');

        // Find or create a club and user
        let club = await prisma.club.findFirst();
        if (!club) {
            console.log('Creating test club...');
            club = await prisma.club.create({
                data: {
                    name: 'Test Club',
                    code: 'TEST001',
                }
            });
        }

        let user = await prisma.user.findFirst();
        if (!user) {
            console.log('Creating test user...');
            user = await prisma.user.create({
                data: {
                    username: 'testuser',
                    password: 'hashed_password_placeholder', // In real app this should be hashed
                    role: 'ADMIN',
                    clubId: club.id,
                }
            });
        }

        console.log('Found/Created user:', user.id);

        const title = 'Standalone Test Mindmap';
        const content = '# Standalone Test\n\n## Works';

        console.log('Creating mindmap...');
        const mindmap = await prisma.mindmap.create({
            data: {
                clubId: user.clubId!,
                title,
                description: 'Created via standalone script',
                content,
                createdBy: user.id,
            },
        });

        console.log('Mindmap created successfully:', mindmap);
    } catch (error) {
        console.error('Error creating mindmap:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
