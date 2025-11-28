const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Rehan@2033', 12);

    try {
        const admin = await prisma.user.upsert({
            where: { username: 'RehanP' },
            update: {
                password: hashedPassword,
            },
            create: {
                username: 'RehanP',
                password: hashedPassword,
                role: 'admin',
            },
        });
        console.log('✅ Admin user created/updated successfully');
        console.log('   Username: RehanP');
        console.log('   Password: Rehan@2033');
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
