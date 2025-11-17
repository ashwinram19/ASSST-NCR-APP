import { NCARReport } from '@/lib/report-storage';
import { SetupItem } from '@/lib/data-storage';
import { jsPDF } from 'jspdf';

// Helper to find name by ID
const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

const FONT_SIZE_TITLE = 16;
const FONT_SIZE_HEADER = 12;
const FONT_SIZE_NORMAL = 10;
const LINE_HEIGHT = 8;
const MARGIN = 10;

interface SetupData {
    departments: SetupItem[];
    clauseIDs: SetupItem[];
    iqrNumbers: SetupItem[];
}

export const generateNCARReportPdf = (report: NCARReport, setupData: SetupData) => {
    const doc = new jsPDF();
    let y = MARGIN;

    // --- Title and Metadata ---
    doc.setFontSize(FONT_SIZE_TITLE);
    doc.text(`NC/CAR Report: ${report.name}`, MARGIN, y);
    y += LINE_HEIGHT;

    doc.setFontSize(FONT_SIZE_NORMAL);
    doc.text(`Status: ${report.status}`, MARGIN, y);
    y += LINE_HEIGHT / 2;
    doc.text(`Created: ${new Date(report.createdAt).toLocaleDateString()}`, MARGIN, y);
    y += LINE_HEIGHT;
    
    // --- Section 1: Non-Conformity Details ---
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.text('Section 1: Non-Conformity Details', MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFontSize(FONT_SIZE_NORMAL);

    const section1Data = [
        ['Department:', findNameById(report.section1.departmentId, setupData.departments)],
        ['Clause ID:', findNameById(report.section1.clauseId, setupData.clauseIDs)],
        ['IQR Number:', findNameById(report.section1.iqrNumberId, setupData.iqrNumbers)],
        ['Date Raised:', report.section1.dateRaised],
        ['Person Responsible:', report.section1.personResponsible],
        ['QMS Clause Reference:', report.section1.qmsClauseReference],
        ['Associated Risk:', report.section1.associatedRisk],
    ];

    section1Data.forEach(([label, value]) => {
        doc.text(`${label} ${value}`, MARGIN, y);
        y += LINE_HEIGHT / 2;
    });
    y += LINE_HEIGHT / 2;

    // Non-Conformity Details (Multi-line text)
    doc.text('Non-Conformity Details:', MARGIN, y);
    y += LINE_HEIGHT / 2;
    const splitText1 = doc.splitTextToSize(report.section1.nonConformityDetails, 180);
    doc.text(splitText1, MARGIN + 5, y);
    y += splitText1.length * (LINE_HEIGHT / 2) + LINE_HEIGHT;

    // Collaborators
    doc.setFontSize(FONT_SIZE_NORMAL);
    doc.text(`Collaborators: ${report.collaborators}`, MARGIN, y);
    y += LINE_HEIGHT;

    // --- Helper function for standard sections (2, 3, 4, 5) ---
    const addStandardSection = (title: string, details: string, dateField: string, reviewedBy: string, approvedBy: string) => {
        if (y > 270) { // Check for page break
            doc.addPage();
            y = MARGIN;
        }
        
        doc.setFontSize(FONT_SIZE_HEADER);
        doc.text(title, MARGIN, y);
        y += LINE_HEIGHT;
        doc.setFontSize(FONT_SIZE_NORMAL);

        // Details (Multi-line text)
        doc.text('Details:', MARGIN, y);
        y += LINE_HEIGHT / 2;
        const splitDetails = doc.splitTextToSize(details, 180);
        doc.text(splitDetails, MARGIN + 5, y);
        y += splitDetails.length * (LINE_HEIGHT / 2) + LINE_HEIGHT;

        doc.text(`Date Completed: ${dateField}`, MARGIN, y);
        y += LINE_HEIGHT / 2;
        doc.text(`Reviewed By: ${reviewedBy}`, MARGIN, y);
        y += LINE_HEIGHT / 2;
        doc.text(`Approved By: ${approvedBy}`, MARGIN, y);
        y += LINE_HEIGHT;
    };

    // Section 2: Correction
    addStandardSection(
        'Section 2: Correction',
        report.section2.correction,
        report.section2.dateCompleted,
        report.section2.reviewedBy,
        report.section2.approvedBy
    );

    // Section 3: Corrective Action
    addStandardSection(
        'Section 3: Corrective Action',
        report.section3.correctiveAction,
        report.section3.dateCompleted,
        report.section3.reviewedBy,
        report.section3.approvedBy
    );

    // Section 4: Root Cause Analysis
    addStandardSection(
        'Section 4: Root Cause Analysis',
        report.section4.rootCauseAnalysis,
        report.section4.dateCompleted,
        report.section4.reviewedBy,
        report.section4.approvedBy
    );

    // Section 5: Verification
    addStandardSection(
        'Section 5: Verification of Implementation and Effectiveness',
        report.section5.verificationDetails,
        report.section5.dateVerified,
        report.section5.reviewedBy,
        report.section5.approvedBy
    );
    
    // Section 6: Attachments / Verification Notes
    if (y > 270) { 
        doc.addPage();
        y = MARGIN;
    }
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.text('Section 6: Attachments / Verification Notes', MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFontSize(FONT_SIZE_NORMAL);
    
    doc.text('Notes:', MARGIN, y);
    y += LINE_HEIGHT / 2;
    const splitNotes = doc.splitTextToSize(report.section6.attachmentNotes || 'No notes provided.', 180);
    doc.text(splitNotes, MARGIN + 5, y);
    y += splitNotes.length * (LINE_HEIGHT / 2) + LINE_HEIGHT;


    doc.save(`${report.name}_Report.pdf`);
};