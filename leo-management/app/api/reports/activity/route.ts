import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
const ImageModule = require('docxtemplater-image-module-free');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Parse basic fields
        const clubName = formData.get('clubName') as string;
        const month = formData.get('month') as string;
        const year = formData.get('year') as string;
        const secretaryName = formData.get('secretaryName') as string;
        const membership = JSON.parse(formData.get('membership') as string);
        const generalMeeting = JSON.parse(formData.get('generalMeeting') as string);
        const boardMeeting = JSON.parse(formData.get('boardMeeting') as string);
        const finances = JSON.parse(formData.get('finances') as string);
        const participation = JSON.parse(formData.get('participation') as string);
        const projectSummaries = JSON.parse(formData.get('projectSummaries') as string);
        const projectsCount = formData.get('projectsCount') as string;

        // Process images
        const processImage = async (file: File | null): Promise<string | null> => {
            if (!file) return null;
            const buffer = Buffer.from(await file.arrayBuffer());
            return buffer.toString('base64');
        };

        const gmPhoto = await processImage(formData.get('gmPhoto') as File | null);
        const boardMeetingPhoto = await processImage(formData.get('boardMeetingPhoto') as File | null);

        // Process attendance lists
        const attendanceListCount = parseInt(formData.get('attendanceListCount') as string || '0');
        const attendanceLists = [];
        for (let i = 0; i < attendanceListCount; i++) {
            const file = formData.get(`attendanceList_${i}`) as File | null;
            const image = await processImage(file);
            if (image) attendanceLists.push({ image });
        }

        const myleoUpdate = await processImage(formData.get('myleoUpdate') as File | null);
        const mylciUpdate = await processImage(formData.get('mylciUpdate') as File | null);
        const newsletter = await processImage(formData.get('newsletter') as File | null);
        const blog = await processImage(formData.get('blog') as File | null);
        const website = await processImage(formData.get('website') as File | null);

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

        // Image options - 2R size: 3.5" x 2.5" at 96 DPI = 336 x 240 pixels
        const opts = {
            centered: false,
            getImage: function (tagValue: string) {
                return Buffer.from(tagValue, 'base64');
            },
            getSize: function () {
                return [336, 240]; // 3.5" x 2.5" at 96 DPI
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
            clubName: clubName || '',
            month: month || '',
            year: year || '',
            secretaryName: secretaryName || '',
            date: new Date().toLocaleDateString(),

            // Membership - flattened
            membershipPrevious: membership?.previous || '',
            membershipInducted: membership?.inducted || '',
            membershipDropped: membership?.dropped || '',
            membershipPresent: membership?.present || '',
            membershipBoard: membership?.board || '',

            // General Meeting - flattened
            generalMeetingDate: generalMeeting?.date || '',
            generalMeetingTime: generalMeeting?.time || '',
            generalMeetingVenue: generalMeeting?.venue || '',
            generalMeetingOfficersVisited: generalMeeting?.officersVisited || '',
            generalMeetingAdvisorPresent: generalMeeting?.advisorPresent || '',

            // General Meeting Guests - flattened
            chiefGuestName: generalMeeting?.guests?.chief?.name || '',
            chiefGuestDesignation: generalMeeting?.guests?.chief?.designation || '',
            guestOfHonorName: generalMeeting?.guests?.honor?.name || '',
            guestOfHonorDesignation: generalMeeting?.guests?.honor?.designation || '',
            specialGuestName: generalMeeting?.guests?.special?.name || '',
            specialGuestDesignation: generalMeeting?.guests?.special?.designation || '',
            otherGuestsName: generalMeeting?.guests?.other?.name || '',
            otherGuestsDesignation: generalMeeting?.guests?.other?.designation || '',

            // General Meeting Attendance - flattened
            attendanceLeos: generalMeeting?.attendance?.leos || '',
            attendanceLeosPresentAbsent: generalMeeting?.attendance?.leosPresentAbsent || '',
            attendanceProspects: generalMeeting?.attendance?.prospects || '',
            attendanceLions: generalMeeting?.attendance?.lions || '',
            attendanceCouncil: generalMeeting?.attendance?.council || '',
            attendanceVisitingLeos: generalMeeting?.attendance?.visitingLeos || '',
            attendanceParents: generalMeeting?.attendance?.parents || '',
            attendanceGuests: generalMeeting?.attendance?.guests || '',
            attendanceStaffAdvisor: generalMeeting?.attendance?.staffAdvisor || '',
            attendanceClubPresident: generalMeeting?.attendance?.clubPresident || '',
            attendanceClubVicePresident: generalMeeting?.attendance?.clubVicePresident || '',
            attendanceClubSecretary: generalMeeting?.attendance?.clubSecretary || '',
            attendanceClubTreasurer: generalMeeting?.attendance?.clubTreasurer || '',
            attendanceLeoAdvisor: generalMeeting?.attendance?.leoAdvisor || '',

            // Board Meeting - flattened
            boardMeetingDate: boardMeeting?.date || '',
            boardMeetingTime: boardMeeting?.time || '',
            boardMeetingVenue: boardMeeting?.venue || '',
            boardMeetingMembersPresent: boardMeeting?.membersPresent || '',
            boardMeetingAttendancePercent: boardMeeting?.attendancePercent || '',
            boardMeetingAdvisorPresent: boardMeeting?.advisorPresent || '',

            // Finances - flattened
            financesOpening: finances?.opening || '',
            financesIncome: finances?.income || '',
            financesExpenditure: finances?.expenditure || '',
            financesClosing: finances?.closing || '',
            financesSurplusDeficit: finances?.surplusDeficit || '',
            financesReceivables: finances?.receivables || '',
            financesPayables: finances?.payables || '',

            // Participation - keep as arrays for loops
            participationDistrict: participation?.district || [],
            participationMultipleDistrict: participation?.multipleDistrict || [],
            participationLions: participation?.lions || [],
            participationOtherClubs: participation?.otherClubs || [],

            // Project Summaries
            projectSummaries: projectSummaries || [],
            projectsCount: projectsCount || '',

            // Images
            gmPhoto: gmPhoto,
            boardMeetingPhoto: boardMeetingPhoto,
            attendanceLists: attendanceLists,
            myleoUpdate: myleoUpdate,
            mylciUpdate: mylciUpdate,
            newsletter: newsletter,
            blog: blog,
            website: website,
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
                'Content-Disposition': `attachment; filename="Activity_Report_${month}_${year}.docx"`,
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
