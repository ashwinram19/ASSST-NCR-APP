export type ReportStatus = 'Draft' | 'Section1Locked' | 'SubmittedForVerification' | 'Verified';

export type Attachment = {
  id: string;
  name: string;
  type: 'text' | 'image';
  content: string; // URL, Base64 string, or text description
};

export type NCARReport = {
  id: string;
  name: string;
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;
  
  // Section 1: Non-Conformity Details (Admin Only Edit in Draft)
  section1: {
    // Report Identification Fields (Minimal required for creation)
    departmentId: string;
    clauseId: string;
    iqrNumberId: string;
    // End Report Identification Fields

    nonConformityDetails: string;
    adminAcknowledged: boolean;
    adminSentMail: boolean;
    
    dateRaised: string;
    qmsClauseReference: string;
    associatedRisk: string;
    personResponsible: string;
  };

  // Collaborators (User input field after Section 1)
  collaborators: string;

  // Sections 2-5 (User/Admin editable after Section 1 lock, locked after verification)
  section2: {
    correction: string;
    dateCompleted: string;
    reviewedBy: string; // New field
    approvedBy: string; // New field
  };
  section3: {
    correctiveAction: string;
    dateCompleted: string;
    reviewedBy: string; // New field
    approvedBy: string; // New field
  };
  section4: {
    rootCauseAnalysis: string;
    dateCompleted: string;
    reviewedBy: string; // New field
    approvedBy: string; // New field
  };
  section5: {
    verificationDetails: string;
    dateVerified: string;
    reviewedBy: string; // New field
    approvedBy: string; // New field
  };

  // Section 6: Attachments (Admin Only Edit)
  section6: {
    attachments: Attachment[];
  };
};

const REPORT_STORAGE_KEY = 'nc_car_reports';

// Helper function to check if a string is a valid image URL or Base64 data URL
const isImageContent = (content: string): boolean => {
  return content.startsWith('http') || content.startsWith('data:image');
};

export const loadReports = (): NCARReport[] => {
  try {
    const data = localStorage.getItem(REPORT_STORAGE_KEY);
    const reports: NCARReport[] = data ? JSON.parse(data) : [];
    
    // Handle migration from old string notes to new Attachment array structure
    return reports.map(report => {
      let section6 = report.section6;
      
      // Check if section6 is in the old format (attachmentNotes: string)
      if (section6 && 'attachmentNotes' in section6) {
        const oldNotes = (section6 as any).attachmentNotes as string;
        const attachments: Attachment[] = oldNotes.split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(name => ({
            id: Date.now().toString() + Math.random(),
            name: name,
            type: 'text',
            content: name,
          }));
        
        section6 = { attachments };
      } else if (!section6 || !section6.attachments) {
        // Initialize if missing entirely
        section6 = { attachments: [] };
      }

      return {
        ...report,
        section6: section6 as NCARReport['section6'],
      };
    });
  } catch (e) {
    console.error('Error loading reports:', e);
    return [];
  }
};

export const saveReports = (reports: NCARReport[]) => {
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
};

export const getReportById = (id: string): NCARReport | undefined => {
  const reports = loadReports();
  return reports.find(report => report.id === id);
};

export const saveReport = (report: NCARReport): NCARReport => {
  const reports = loadReports();
  const existingIndex = reports.findIndex(r => r.id === report.id);

  const updatedReport = {
    ...report,
    updatedAt: Date.now(),
  };

  if (existingIndex > -1) {
    reports[existingIndex] = updatedReport;
  } else {
    reports.push(updatedReport);
  }

  saveReports(reports);
  return updatedReport;
};

export const deleteReport = (id: string) => {
  const reports = loadReports();
  const updatedReports = reports.filter(r => r.id !== id);
  saveReports(updatedReports);
};