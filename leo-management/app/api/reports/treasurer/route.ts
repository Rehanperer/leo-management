import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
// @ts-ignore
const ImageModule = require('docxtemplater-image-module-free');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Basic Info
        const projectName = formData.get('projectName') as string || '';
        const month = formData.get('month') as string || '';
        const year = formData.get('year') as string || '';
        const date = formData.get('date') as string || '';
        const clubName = formData.get('clubName') as string || '';
        const treasurerName = formData.get('treasurerName') as string || '';
        const totalIncome = formData.get('totalIncome') as string || '0.00';
        const totalExpense = formData.get('totalExpense') as string || '0.00';
        const surplusDeficit = formData.get('surplusDeficit') as string || '0.00';

        const incomeCount = parseInt(formData.get('incomeCount') as string || '0');
        const expenseCount = parseInt(formData.get('expenseCount') as string || '0');

        // Process Incomes
        const incomeItems = [];
        const incomeReceipts = [];

        for (let i = 0; i < incomeCount; i++) {
            const description = formData.get(`income_${i}_description`) as string || '';
            const billNo = formData.get(`income_${i}_billNo`) as string || '';
            const amount = formData.get(`income_${i}_amount`) as string || '';
            const receiptFile = formData.get(`income_${i}_receipt`) as File | null;

            incomeItems.push({
                description,
                billNo,
                amount
            });

            if (receiptFile && receiptFile.size > 0) {
                const buffer = Buffer.from(await receiptFile.arrayBuffer());
                incomeReceipts.push({
                    description,
                    image: buffer.toString('base64')
                });
            }
        }

        // Process Expenses
        const expenseItems = [];
        const expenseReceipts = [];

        for (let i = 0; i < expenseCount; i++) {
            const description = formData.get(`expense_${i}_description`) as string || '';
            const billNo = formData.get(`expense_${i}_billNo`) as string || '';
            const amount = formData.get(`expense_${i}_amount`) as string || '';
            const receiptFile = formData.get(`expense_${i}_receipt`) as File | null;

            expenseItems.push({
                description,
                billNo,
                amount
            });

            if (receiptFile && receiptFile.size > 0) {
                const buffer = Buffer.from(await receiptFile.arrayBuffer());
                expenseReceipts.push({
                    description,
                    image: buffer.toString('base64')
                });
            }
        }

        // Load Template
        const templatePath = path.join(process.cwd(), 'templates', 'reports', 'Project Treasurer report template.docx');
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json({ error: 'Template not found' }, { status: 500 });
        }

        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);

        // Configure Image Module
        const imageOptions = {
            centered: false,
            getImage: (tagValue: any) => {
                return Buffer.from(tagValue, 'base64');
            },
            getSize: () => {
                return [400, 300]; // Standard size for receipts
            }
        };

        const imageModule = new ImageModule(imageOptions);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: [imageModule]
        });

        // Prepare Data
        const data = {
            projectName,
            month,
            year,
            date,
            clubName,
            treasurerName,
            totalIncome,
            totalExpense,
            surplusDeficit,
            incomeItems,
            expenseItems,
            incomeReceipts,
            expenseReceipts,
            hasIncomeReceipts: incomeReceipts.length > 0,
            hasExpenseReceipts: expenseReceipts.length > 0
        };

        console.log('Generating Treasurer Report for:', projectName);

        doc.setData(data);
        doc.render();

        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        }) as Buffer;

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename=Treasurer_Report_${projectName}.docx`,
            },
        });

    } catch (error: any) {
        console.error('Error generating report:', error);
        if (error.properties && error.properties.errors) {
            const errorMessages = error.properties.errors.map((e: any) => e.properties.explanation).join('\n');
            console.error('Docxtemplater errors:', errorMessages);
        }
        return NextResponse.json(
            { error: 'Failed to generate report', details: error.message },
            { status: 500 }
        );
    }
}
