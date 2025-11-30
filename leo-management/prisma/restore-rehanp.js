const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Creating admin user RehanP...');

    // 1. Ensure a Club exists
    let club = await prisma.club.findFirst();

    if (!club) {
        console.log('⚠️ No club found. Creating default club...');
        club = await prisma.club.create({
            data: {
                name: 'Leo Club of Colombo',
                code: 'LEO-COL-001',
                active: true
            }
        });
        console.log(`✅ Created club: ${club.name} (${club.id})`);
    }

    // 2. Create or Update User "RehanP"
    const username = 'RehanP';
    const password = 'Rehan@2033';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { username },
        update: {
            password: hashedPassword,
            clubId: club.id,
            role: 'admin'
        },
        create: {
            username,
            password: hashedPassword,
            role: 'admin',
            clubId: club.id
        }
    });

    console.log('\n✅ User created successfully!');
    console.log('------------------------------------------------');
    console.log(`👤 Username: ${user.username}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`Role: ${user.role}`);
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Error creating user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
