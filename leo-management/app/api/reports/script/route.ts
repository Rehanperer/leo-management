import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Select template based on meeting type
        const templateName = data.meetingType === 'Online'
            ? 'gm Script Online.docx'
            : 'gm script physical.docx';

        const templatePath = path.join(process.cwd(), 'templates', 'reports', templateName);

        if (!fs.existsSync(templatePath)) {
            console.error('Template not found at:', templatePath);
            return NextResponse.json({ error: 'Template not found' }, { status: 500 });
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Prepare data for template
        const templateData = {
            clubName: data.clubName || '',
            month: data.month || '',
            year: data.year || '',
            date: data.date || '',
            meetingType: data.meetingType || 'Physical',

            // Physical-only fields - transform to objects for safer templating
            frontRowGuests: (data.frontRowGuests || []).map((name: string) => ({ name })),
            headTableGuests: (data.headTableGuests || []).map((name: string) => ({ name })),
            introHeadTable: data.introHeadTable || '',

            // Common fields
            pledgeAllegiance: data.pledgeAllegiance || '',
            leoPledge: data.leoPledge || '',
            environmentalPledge: data.environmentalPledge || '',
            welcomeAddress: data.welcomeAddress || '',
            presentMinutes: data.presentMinutes || '',
            firstMinutes: data.firstMinutes || '',
            secondMinutes: data.secondMinutes || '',
            presentFinancial: data.presentFinancial || '',
            secondFinancial: data.secondFinancial || '',
            presidentAddress: data.presidentAddress || '',
            introChiefGuest: data.introChiefGuest || '',
            speechChiefGuest: data.speechChiefGuest || '',
            introGuestHonor: data.introGuestHonor || '',
            speechGuestHonor: data.speechGuestHonor || '',
            introSpecialGuest: data.introSpecialGuest || '',
            speechSpecialGuest: data.speechSpecialGuest || '',
            closingRemarks: data.closingRemarks || '',
            voteOfThanks: data.voteOfThanks || ''
        };

        console.log('Generating Script with data:', JSON.stringify(templateData, null, 2));

        doc.setData(templateData);
        doc.render();

        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        }) as Buffer;

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename=Script_${data.month}_${data.year}.docx`,
            },
        });

    } catch (error: any) {
        console.error('Error generating script:', error);
        if (error.properties && error.properties.errors) {
            const errorMessages = error.properties.errors.map((e: any) => e.properties.explanation).join('\n');
            console.error('Docxtemplater errors:', errorMessages);
        }
        return NextResponse.json(
            { error: 'Failed to generate script', details: error.message },
            { status: 500 }
        );
    }
}
