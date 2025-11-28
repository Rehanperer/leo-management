const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    try {
        const admin = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
            },
        });
        console.log('✅ Admin user created successfully');
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
