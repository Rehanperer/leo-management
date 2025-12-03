const fs = require('fs');
const PizZip = require('pizzip');
const path = require('path');

const templatePath = path.join(process.cwd(), 'templates', 'reports', 'activity-report-template.docx');
const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Replace simple placeholders
// Note: This is a simple string replacement. In a real docx, text might be split across <w:t> tags.
// We hope that the placeholders are contiguous.
const replacements = {
    '\\[Leo Club Name\\]': '{clubName}',
    '\\[Month\\]': '{month}',
    '\\[Year\\]': '{year}',
    '\\[Date\\]': '{date}',
    '\\[Name\\]': '{secretaryName}',
    'Leo \\[Name\\]': 'Leo {secretaryName}',
    'Leo Club of \\[Leo Club Name\\]': 'Leo Club of {clubName}'
};

for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    docXml = docXml.replace(regex, value);
}

// Append Projects Section
// We need to find the end of the document body and insert our loop.
// The end of the body is usually </w:body>.
// We will insert a page break and then the projects loop.

const projectsXml = `
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Project Details</w:t></w:r></w:p>
<w:p><w:r><w:t>{#projects}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>{name}</w:t></w:r></w:p>
<w:p><w:r><w:t>Date: {date}</w:t></w:r></w:p>
<w:p><w:r><w:t>Description: {description}</w:t></w:r></w:p>
<w:p><w:r><w:t>Images:</w:t></w:r></w:p>
<w:p><w:r><w:t>{#images}</w:t></w:r></w:p>
<w:p><w:r><w:t>{%image}</w:t></w:r></w:p>
<w:p><w:r><w:t>{/images}</w:t></w:r></w:p>
<w:p><w:r><w:t>{/projects}</w:t></w:r></w:p>
`;

// Insert before the last </w:body>
const bodyEndIndex = docXml.lastIndexOf('</w:body>');
if (bodyEndIndex !== -1) {
    docXml = docXml.slice(0, bodyEndIndex) + projectsXml + docXml.slice(bodyEndIndex);
}

zip.file('word/document.xml', docXml);

const buffer = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync(templatePath, buffer);

console.log('Template modified successfully');
