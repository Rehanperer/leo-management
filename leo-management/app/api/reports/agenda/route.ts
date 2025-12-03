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
            ? 'gm agenda online.docx'
            : 'gm agenda physical.docx';

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
            startTime: data.startTime || '',
            venue: data.venue || '',
            meetingType: data.meetingType || 'Physical',

            // Guests
            chiefGuestName: data.guests?.chief?.name || '',
            chiefGuestDesignation: data.guests?.chief?.designation || '',
            chiefGuestClub: data.guests?.chief?.club || '',

            honorGuestName: data.guests?.honor?.name || '',
            honorGuestDesignation: data.guests?.honor?.designation || '',
            honorGuestClub: data.guests?.honor?.club || '',

            specialGuestName: data.guests?.special?.name || '',
            specialGuestDesignation: data.guests?.special?.designation || '',
            specialGuestClub: data.guests?.special?.club || '',

            // Agenda Loop
            agendaItems: data.agenda || []
        };

        console.log('Generating Agenda with data:', JSON.stringify(templateData, null, 2));

        doc.setData(templateData);
        doc.render();

        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        }) as Buffer;

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename=Agenda_${data.month}_${data.year}.docx`,
            },
        });

    } catch (error) {
        console.error('Error generating agenda:', error);
        return NextResponse.json(
            { error: 'Failed to generate agenda' },
            { status: 500 }
        );
    }
}
