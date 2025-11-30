import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
    console.log('Seeding mindmap templates...');

    const templates = [
        {
            id: 'tpl-project-planning',
            name: 'Project Planning',
            description: 'Comprehensive template for planning community service projects',
            category: 'project',
            content: `# Project Planning

## Planning Phase
- [ ] Budget Planning
- [ ] Volunteer Recruitment
- [ ] Venue Booking

## Execution Phase
- [ ] Logistics Setup
- [ ] Event Management
- [ ] Photo Documentation

## Post-Event
- [ ] Financial Reporting
- [ ] Impact Assessment`,
            isPublic: true,
        },
        {
            id: 'tpl-event-planning',
            name: 'Event Planning',
            description: 'Organize successful events with checklist',
            category: 'event',
            content: `# Event Planning

## Pre-Event
- [ ] Marketing & Promotion
- [ ] Registration Setup
- [ ] Speaker Coordination

## Day-of Execution
- [ ] Setup Checklist
- [ ] Registration Desk
- [ ] Technical Check

## Post-Event
- [ ] Thank You Notes
- [ ] Feedback Survey`,
            isPublic: true,
        },
        {
            id: 'tpl-meeting-agenda',
            name: 'Meeting Agenda',
            description: 'Structure productive meetings',
            category: 'meeting',
            content: `# Meeting Agenda

## Opening
- [ ] Call to Order
- [ ] Roll Call
- [ ] Approval of Minutes

## Business
- [ ] Financial Update
- [ ] Project Updates
- [ ] New Business

## Closing
- [ ] Announcements
- [ ] Next Meeting Date
- [ ] Adjournment`,
            isPublic: true,
        },
        {
            id: 'tpl-fundraising',
            name: 'Fundraising Campaign',
            description: 'Plan and execute fundraising campaigns',
            category: 'fundraising',
            content: `# Fundraising Campaign

## Strategy
- [ ] Set Target Amount
- [ ] Identify Donors
- [ ] Create Marketing Materials

## Execution
- [ ] Launch Campaign
- [ ] Social Media Push
- [ ] Donor Outreach

## Follow-up
- [ ] Thank You Letters
- [ ] Impact Report`,
            isPublic: true,
        },
    ];

    for (const template of templates) {
        await prisma.mindmapTemplate.upsert({
            where: { id: template.id },
            update: template,
            create: template,
        });
        console.log(`✓ Seeded template: ${template.name}`);
    }

    console.log('✅ All templates seeded successfully!');
}

seedTemplates()
    .catch((e) => {
        console.error('Error seeding templates:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
