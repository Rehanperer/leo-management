import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Load the template
        const templatePath = path.join(process.cwd(), 'templates', 'reports', 'treasurer-template.docx');
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Set the template variables
        doc.setData({
            clubName: data.clubName || '',
            month: data.month || '',
            year: data.year || '',
            date: data.date || '',
            treasurerName: data.treasurerName || '',

            // Basic Summary
            openingBalance: parseFloat(data.openingBalance || 0).toFixed(2),
            totalIncome: parseFloat(data.totalIncome || 0).toFixed(2),
            totalExpenses: parseFloat(data.totalExpenses || 0).toFixed(2),
            closingBalance: parseFloat(data.closingBalance || 0).toFixed(2),

            // Non-Current Assets
            nonCurrentAssetNote: parseFloat(data.nonCurrentAssetNote || 0).toFixed(2),
            fixedDeposits: parseFloat(data.fixedDeposits || 0).toFixed(2),
            totalNonCurrentAssets: parseFloat(data.totalNonCurrentAssets || 0).toFixed(2),

            // Current Assets
            accountReceivables: parseFloat(data.accountReceivables || 0).toFixed(2),
            cashInHand: parseFloat(data.cashInHand || 0).toFixed(2),
            bankBalance: parseFloat(data.bankBalance || 0).toFixed(2),
            totalCurrentAssets: parseFloat(data.totalCurrentAssets || 0).toFixed(2),
            totalAssets: parseFloat(data.totalAssets || 0).toFixed(2),

            // Accumulated Fund
            accumulatedFundStart: parseFloat(data.accumulatedFundStart || 0).toFixed(2),
            surplusDeficit: parseFloat(data.surplusDeficit || 0).toFixed(2),
            accumulatedFundEnd: parseFloat(data.accumulatedFundEnd || 0).toFixed(2),

            // Non-Current Liabilities
            loansCash: parseFloat(data.loansCash || 0).toFixed(2),
            loansBank: parseFloat(data.loansBank || 0).toFixed(2),

            // Current Liabilities
            bankOverDrafts: parseFloat(data.bankOverDrafts || 0).toFixed(2),
            creditorsPayables: parseFloat(data.creditorsPayables || 0).toFixed(2),
            totalCurrentLiabilities: parseFloat(data.totalCurrentLiabilities || 0).toFixed(2),
            totalLiabilities: parseFloat(data.totalLiabilities || 0).toFixed(2),

            // Details  
            incomeDetails: data.incomeDetails || '',
            expenseDetails: data.expenseDetails || '',
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
                'Content-Disposition': `attachment; filename="Treasurer_Report_${data.month}_${data.year}.docx"`,
            },
        });
    } catch (error) {
        console.error('Error generating treasurer report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
