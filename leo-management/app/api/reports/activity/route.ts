import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import ImageModule from 'docxtemplater-image-module-free';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('Received Activity Report Data:', JSON.stringify(data, null, 2));

        // Load the template
        const templatePath = path.join(process.cwd(), 'templates', 'reports', 'activity-report-template.docx');

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);

        // Image options
        const opts = {
            centered: false,
            fileType: "docx",
            getImage: function (tagValue: string) {
                // tagValue is the base64 string
                const base64Data = tagValue.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                return Buffer.from(base64Data, "base64");
            },
            getSize: function () {
                // 2R size: 2.5 x 3.5 inches
                // At 96 DPI: 240 x 336 pixels
                return [240, 336];
            }
        };

        const imageModule = new ImageModule(opts);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: [imageModule],
        });

        // Prepare data for template
        // We need to ensure the template has the correct tags.
        // Since we are using a generic template, we might need to adjust the data structure
        // or assume the template has specific tags.

        // For now, we pass the data as is, but we might need to transform 'projects' 
        // if the template expects a flat list or specific structure.

        // Transform projects to have 'images' as an array of objects if needed by the loop
        // But docxtemplater-image-module usually expects a single tag for an image, 
        // or a loop for multiple images.

        // Let's assume the template will have a loop {#projects} ... {/projects}
        // and inside it {#images} {%image} {/images}

        // Flatten data structure to avoid dots in template tags (Word formatting issue)
        const templateData = {
            clubName: data.clubName || '',
            month: data.month || '',
            year: data.year || '',
            secretaryName: data.secretaryName || '',
            date: new Date().toLocaleDateString(),

            // Membership - flattened
            membershipPrevious: data.membership?.previous || '',
            membershipInducted: data.membership?.inducted || '',
            membershipDropped: data.membership?.dropped || '',
            membershipPresent: data.membership?.present || '',
            membershipBoard: data.membership?.board || '',

            // General Meeting - flattened
            generalMeetingDate: data.generalMeeting?.date || '',
            generalMeetingTime: data.generalMeeting?.time || '',
            generalMeetingVenue: data.generalMeeting?.venue || '',
            generalMeetingOfficersVisited: data.generalMeeting?.officersVisited || '',
            generalMeetingAdvisorPresent: data.generalMeeting?.advisorPresent || '',

            // General Meeting Guests - flattened
            chiefGuestName: data.generalMeeting?.guests?.chief?.name || '',
            chiefGuestDesignation: data.generalMeeting?.guests?.chief?.designation || '',
            honorGuestName: data.generalMeeting?.guests?.honor?.name || '',
            honorGuestDesignation: data.generalMeeting?.guests?.honor?.designation || '',
            specialGuestName: data.generalMeeting?.guests?.special?.name || '',
            specialGuestDesignation: data.generalMeeting?.guests?.special?.designation || '',
            otherGuestName: data.generalMeeting?.guests?.other?.name || '',
            otherGuestDesignation: data.generalMeeting?.guests?.other?.designation || '',

            // General Meeting Attendance - flattened
            attendanceLeos: data.generalMeeting?.attendance?.leos || '',
            attendanceLeosPresentAbsent: data.generalMeeting?.attendance?.leosPresentAbsent || '',
            attendanceProspects: data.generalMeeting?.attendance?.prospects || '',
            attendanceLions: data.generalMeeting?.attendance?.lions || '',
            attendanceCouncil: data.generalMeeting?.attendance?.council || '',
            attendanceVisitingLeos: data.generalMeeting?.attendance?.visitingLeos || '',
            attendanceParents: data.generalMeeting?.attendance?.parents || '',
            attendanceGuests: data.generalMeeting?.attendance?.guests || '',
            attendanceStaffAdvisor: data.generalMeeting?.attendance?.staffAdvisor || '',
            attendanceClubPresident: data.generalMeeting?.attendance?.clubPresident || '',
            attendanceClubVicePresident: data.generalMeeting?.attendance?.clubVicePresident || '',
            attendanceClubSecretary: data.generalMeeting?.attendance?.clubSecretary || '',
            attendanceClubTreasurer: data.generalMeeting?.attendance?.clubTreasurer || '',
            attendanceLeoAdvisor: data.generalMeeting?.attendance?.leoAdvisor || '',

            // Board Meeting - flattened
            boardMeetingDate: data.boardMeeting?.date || '',
            boardMeetingTime: data.boardMeeting?.time || '',
            boardMeetingVenue: data.boardMeeting?.venue || '',
            boardMeetingMembersPresent: data.boardMeeting?.membersPresent || '',
            boardMeetingAttendancePercent: data.boardMeeting?.attendancePercent || '',
            boardMeetingAdvisorPresent: data.boardMeeting?.advisorPresent || '',

            // Finances - flattened
            financesSurplusDeficit: data.finances?.surplusDeficit || '',
            financesReceivables: data.finances?.receivables || '',
            financesPayables: data.finances?.payables || '',

            // Participation - keep as arrays for loops
            participationDistrict: data.participation?.district || [],
            participationMultipleDistrict: data.participation?.multipleDistrict || [],
            participationLions: data.participation?.lions || [],
            participationOtherClubs: data.participation?.otherClubs || [],

            // Project Summaries
            projectSummaries: data.projectSummaries || [],
            projectsCount: data.projectsCount || ''
        };

        console.log('Template Data (with defaults):', JSON.stringify(templateData, null, 2));

        doc.setData(templateData);

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
                'Content-Disposition': `attachment; filename="Activity_Report_${data.month}_${data.year}.docx"`,
            },
        });
    } catch (error) {
        console.error('Error generating activity report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
