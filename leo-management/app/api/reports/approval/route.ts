import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

import ImageModule from 'docxtemplater-image-module-free';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { documentType, joiningClubs, districtPresidents, ...formData } = data;

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
            'district-behalf': 'district-behalf-approval.docx',
        };
        // Load the template
        // We assume the template name matches the document type with -approval suffix
        const templatePath = path.join(process.cwd(), 'templates', 'reports', 'approval', `${documentType}-approval.docx`);

        // Verify template exists
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found for document type: ${documentType}`);
        }

        const content = fs.readFileSync(templatePath, 'binary');

        const imageOptions = {
            centered: false,
            getImage: function (tagValue: string, tagName: string) {
                if (!tagValue) return null;
                // Remove header if present
                const base64 = tagValue.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                return Buffer.from(base64, "base64");
            },
            getSize: function (img: Buffer, tagValue: string, tagName: string) {
                // Fixed size for signatures
                return [150, 75];
            }
        };

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: [new ImageModule(imageOptions)],
        });

        // Process arrays to add indices and filter empty entries
        const processedJoiningClubs = Array.isArray(joiningClubs)
            ? joiningClubs
                .filter((club: any) => club.name && club.name.trim() !== '')
                .map((club: any, index: number) => ({ ...club, index: index + 1 }))
            : [];

        const processedDistrictPresidents = Array.isArray(districtPresidents)
            ? districtPresidents
                .filter((president: any) => president.name && president.name.trim() !== '')
                .map((president: any, index: number) => ({ ...president, index: index + 1 }))
            : [];

        // Set the template variables
        // We pass all form data, so the template can use whatever it needs
        doc.setData({
            date: new Date().toLocaleDateString(),
            ...formData,
            joiningClubs: processedJoiningClubs,
            districtPresidents: processedDistrictPresidents,
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
