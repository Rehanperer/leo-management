import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { documentType, ...formData } = data;

        if (!documentType) {
            return NextResponse.json(
                { error: 'Document type is required' },
                { status: 400 }
            );
        }

        // Map document type to filename
        const templateMap: Record<string, string> = {
            'multiple-district': 'multiple-district-approval.docx',
            'inter-district': 'inter-district-approval.docx',
            'external-org': 'external-org-approval.docx',
        };

        const filename = templateMap[documentType];
        if (!filename) {
            return NextResponse.json(
                { error: 'Invalid document type' },
                { status: 400 }
            );
        }

        // Load the template
        const templatePath = path.join(process.cwd(), 'templates', 'reports', 'approval', filename);

        if (!fs.existsSync(templatePath)) {
            return NextResponse.json(
                { error: 'Template file not found' },
                { status: 404 }
            );
        }

        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Set the template variables
        // We pass all form data, so the template can use whatever it needs
        doc.setData({
            date: new Date().toLocaleDateString(),
            ...formData,
        });

        // Render the document
        doc.render();

        // Generate the output
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // Return the file
        return new NextResponse(new Uint8Array(buf), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${documentType}_approval_${formData.date || 'report'}.docx"`,
            },
        });
    } catch (error) {
        console.error('Error generating approval document:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // @ts-ignore
        const explanation = error.properties && error.properties.errors
            // @ts-ignore
            ? error.properties.errors.map(e => e.message).join(', ')
            : '';

        return NextResponse.json(
            { error: 'Failed to generate document', details: errorMessage, explanation },
            { status: 500 }
        );
    }
}
