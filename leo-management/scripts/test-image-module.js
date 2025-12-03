const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const ImageModule = require('docxtemplater-image-module-free');

console.log('Testing Image Module...');

try {
    const content = fs.readFileSync(path.resolve(__dirname, '../templates/reports/Project Treasurer report template.docx'), 'binary');
    const zip = new PizZip(content);

    const imageOptions = {
        centered: false,
        getImage: (tagValue) => {
            return Buffer.from(tagValue, 'base64');
        },
        getSize: () => {
            return [100, 100];
        }
    };

    const imageModule = new ImageModule(imageOptions);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule]
    });

    console.log('Docxtemplater initialized successfully with ImageModule');
} catch (error) {
    console.error('Error initializing:', error);
}
