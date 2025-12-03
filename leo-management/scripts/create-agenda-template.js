const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, BorderStyle } = require('docx');

// Physical Meeting Template
const physicalDoc = new Document({
    sections: [{
        properties: {},
        children: [
            // Title
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "GENERAL MEETING FOR THE MONTH OF {month}",
                        bold: true,
                        size: 28,
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "LEO CLUB OF {clubName}",
                        bold: true,
                        size: 28,
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Leo District 306 D2",
                        size: 24,
                    }),
                ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Agenda",
                        bold: true,
                        size: 32,
                    }),
                ],
            }),
            new Paragraph({ text: "" }),

            // Meeting Details Table
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Date: {date}" })],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Venue:" })],
                                width: { size: 34, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Time {startTime} Onwards" })],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    }),
                ],
            }),

            // Guests Section
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [new TextRun({ text: "Guests", bold: true })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Chief Guest - {chiefGuestName} | {chiefGuestDesignation} | {chiefGuestClub}" })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Guest of Honor - {honorGuestName} | {honorGuestDesignation} | {honorGuestClub}" })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Special Guest - {specialGuestName} | {specialGuestDesignation} | {specialGuestClub}" })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),

            new Paragraph({ text: "" }),

            // Agenda Items Table
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "Time", bold: true })]
                                })],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "Item", bold: true })]
                                })],
                                width: { size: 70, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    }),
                    // Loop Row
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "{#agendaItems}{time}" })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{item}{/agendaItems}" })],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    }],
});

// Online Meeting Template
const onlineDoc = new Document({
    sections: [{
        properties: {},
        children: [
            // Title
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "GENERAL MEETING FOR THE MONTH OF {month}",
                        bold: true,
                        size: 28,
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "LEO CLUB OF {clubName}",
                        bold: true,
                        size: 28,
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Leo District 306 D2",
                        size: 24,
                    }),
                ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Agenda",
                        bold: true,
                        size: 32,
                    }),
                ],
            }),
            new Paragraph({ text: "" }),

            // Meeting Details Table
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "Date: {date}" })],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Venue: Google meet or zoom" })],
                                width: { size: 34, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Time {startTime} Onwards" })],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    }),
                ],
            }),

            // Guests Section
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [new TextRun({ text: "Guests", bold: true })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Chief Guest - {chiefGuestName} | {chiefGuestDesignation} | {chiefGuestClub}" })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Guest of Honor - {honorGuestName} | {honorGuestDesignation} | {honorGuestClub}" })],
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: "• Special Guest - {specialGuestName} | {specialGuestDesignation} | {specialGuestClub}" })],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),

            new Paragraph({ text: "" }),

            // Agenda Items Table (without "Calling Dignitaries to the Head Table")
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "Time", bold: true })]
                                })],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "Item", bold: true })]
                                })],
                                width: { size: 70, type: WidthType.PERCENTAGE },
                            }),
                        ],
                    }),
                    // Loop Row
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "{#agendaItems}{time}" })],
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "{item}{/agendaItems}" })],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    }],
});

// Ensure directory exists
const dir = path.join(__dirname, '../templates/reports');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Save both templates
Promise.all([
    Packer.toBuffer(physicalDoc).then((buffer) => {
        fs.writeFileSync(path.join(dir, "agenda-template-physical.docx"), buffer);
        console.log("Physical agenda template created successfully!");
    }),
    Packer.toBuffer(onlineDoc).then((buffer) => {
        fs.writeFileSync(path.join(dir, "agenda-template-online.docx"), buffer);
        console.log("Online agenda template created successfully!");
    })
]);
