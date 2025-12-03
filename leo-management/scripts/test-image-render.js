const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const ImageModule = require('docxtemplater-image-module-free');

console.log('Testing Image Rendering...');

try {
    // Load template
    const templatePath = path.resolve(__dirname, '../templates/reports/Project Treasurer report template.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    // Create a dummy 1x1 pixel PNG buffer
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

    const imageOptions = {
        centered: false,
        getImage: (tagValue, tagName) => {
            console.log('getImage called for', tagName);
            if (Buffer.isBuffer(tagValue)) return tagValue;
            return Buffer.from(tagValue, 'base64');
        },
        getSize: (img, tagValue, tagName) => {
            console.log('getSize called for', tagName);
            return [100, 100];
        }
    };

    const imageModule = new ImageModule(imageOptions);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule]
    });

    const data = {
        projectName: 'Test Project',
        incomeReceipts: [
            {
                description: 'Test Receipt',
                image: imageBuffer.toString('base64') // Pass as string
            }
        ],
        hasIncomeReceipts: true
    };

    console.log('Setting data...');
    doc.setData(data);

    console.log('Rendering...');
    doc.render();

    console.log('Generating buffer...');
    const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    fs.writeFileSync(path.resolve(__dirname, 'test-output.docx'), buffer);
    console.log('Success! Output written to scripts/test-output.docx');

} catch (error) {
    console.error('Error rendering:', error);
    if (error.properties && error.properties.errors) {
        const errorMessages = error.properties.errors.map(e => e.properties.explanation).join('\n');
        console.error('Docxtemplater errors:', errorMessages);
    }
}
