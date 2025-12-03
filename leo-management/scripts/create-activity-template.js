const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

// Create a simple document structure
const content = `
ACTIVITY REPORT

Club: {clubName}
Month: {month} {year}
Secretary: {secretaryName}
Date: {date}

--- CLUB ADMINISTRATION SUMMARY ---

MEMBERSHIP:
Previous Month: {membership.previous}
Inducted: {membership.inducted}
Dropped: {membership.dropped}
Present Month: {membership.present}
Board Members: {membership.board}

--- MEETINGS ---

GENERAL MEETING:
Date: {generalMeeting.date}
Time: {generalMeeting.time}
Venue: {generalMeeting.venue}
District/Multiple Officers Visited: {generalMeeting.officersVisited}
Leo Advisor Present: {generalMeeting.advisorPresent}

GUESTS:
Chief Guest: {generalMeeting.guests.chief.name}, {generalMeeting.guests.chief.designation}
Guest of Honor: {generalMeeting.guests.honor.name}, {generalMeeting.guests.honor.designation}
Special Guest: {generalMeeting.guests.special.name}, {generalMeeting.guests.special.designation}
Other Guests: {generalMeeting.guests.other.name}, {generalMeeting.guests.other.designation}

ATTENDANCE:
Leos: {generalMeeting.attendance.leos}
Present/Absent: {generalMeeting.attendance.leosPresentAbsent}
Leo Prospects: {generalMeeting.attendance.prospects}
Lions/Lionesses: {generalMeeting.attendance.lions}
Council Members: {generalMeeting.attendance.council}
Visiting Leos: {generalMeeting.attendance.visitingLeos}
Leo Parents: {generalMeeting.attendance.parents}
Guests: {generalMeeting.attendance.guests}
Staff Advisor: {generalMeeting.attendance.staffAdvisor}

BOARD MEETING:
Date: {boardMeeting.date}
Time: {boardMeeting.time}
Venue: {boardMeeting.venue}
Members Present: {boardMeeting.membersPresent}
Attendance %: {boardMeeting.attendancePercent}
Advisor Present: {boardMeeting.advisorPresent}

--- FINANCES ---

Total Surplus/Deficit: {finances.surplusDeficit}
Total Receivables: {finances.receivables}
Total Payables: {finances.payables}

--- PARTICIPATION ---

DISTRICT EVENTS:
{#participation.district}
Event: {event} | Date: {date} | Count: {count} | Names: {names}
{/participation.district}

MULTIPLE DISTRICT EVENTS:
{#participation.multipleDistrict}
Event: {event} | Date: {date} | Count: {count} | Names: {names}
{/participation.multipleDistrict}

LIONS CLUB/DISTRICT EVENTS:
{#participation.lions}
Event: {event} | Date: {date} | Count: {count} | Names: {names}
{/participation.lions}

OTHER CLUBS' EVENTS:
{#participation.otherClubs}
Event: {event} | Date: {date} | Count: {count} | Names: {names}
{/participation.otherClubs}

--- MONTHLY PROJECT SUMMARY ---

{#projectSummaries}
Date: {date} | Project: {name} | Category: {category}
{/projectSummaries}

--- DETAILED PROJECTS ---

{#projects}
PROJECT: {name}
Date: {date}
Description: {description}

Photos:
{#images}
[IMAGE]
{/images}

{/projects}
`;

// Create a minimal DOCX structure
const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

const zip = new PizZip();
zip.file('word/document.xml', xml);
zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

const buf = zip.generate({ type: 'nodebuffer' });

// Save the template
const outputPath = path.join(__dirname, '..', 'templates', 'reports', 'activity-report-template-BACKUP.docx');
const finalPath = path.join(__dirname, '..', 'templates', 'reports', 'activity-report-template.docx');

// Backup existing template
if (fs.existsSync(finalPath)) {
    fs.copyFileSync(finalPath, outputPath);
    console.log('✓ Backed up existing template to activity-report-template-BACKUP.docx');
}

fs.writeFileSync(finalPath, buf);
console.log('✓ Created new template at:', finalPath);
console.log('\nThe template has all the correct tags and should work now!');
console.log('Your old template was backed up.');
