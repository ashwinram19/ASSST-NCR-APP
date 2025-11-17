export type ReportStatus = 'Draft' | 'Section1Locked' | 'SubmittedForVerification' | 'Verified';

export type VerificationItem = {
  id: string;
  result: string; // Verification Result (e.g., Pass, Fail, N/A)
  details: string; // Verification Details/Remarks
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
    nonConformityTypeId: string; // NEW FIELD

    // End Report Identification Fields

    nonConformityDetails: string;
    adminAcknowledged: boolean;
    adminSentMail: boolean;
    
    dateRaised: string;
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
    verificationItems: VerificationItem[]; // Dynamic rows
    dateVerified: string;
    approvedBy: string; // Removed reviewedBy
  };

  // Section 6: Attachments (Admin Only Edit)
  section6: {
    attachmentNotes: string;
  };
};

const REPORT_STORAGE_KEY = 'nc_car_reports';

export const loadReports = (): NCARReport[] => {
  try {
    const data = localStorage.getItem(REPORT_STORAGE_KEY);
    const reports: any[] = data ? JSON.parse(data) : [];
    return reports.map(report => {
      // Safely destructure and omit qmsClauseReference if it exists in old data
      const { qmsClauseReference, ...restSection1 } = report.section1 || {};
      
      // Migration for section5 structure
      let section5Data: NCARReport['section5'];
      
      // Check if verificationItems exists (new structure)
      if (report.section5 && Array.isArray(report.section5.verificationItems)) {
          section5Data = {
              verificationItems: report.section5.verificationItems,
              dateVerified: report.section5.dateVerified || '',
              approvedBy: report.section5.approvedBy || '',
          };
      } else {
          // Old structure migration (or initialization)
          const oldDetails = report.section5?.verificationDetails || '';
          
          section5Data = {
              verificationItems: oldDetails ? [{
                  id: Date.now().toString(), // Assign a unique ID for migration
                  result: 'N/A', 
                  details: oldDetails,
              }] : [],
              dateVerified: report.section5?.dateVerified || '',
              approvedBy: report.section5?.approvedBy || '',
          };
      }
      
      // Ensure sections are initialized correctly
      return {
        ...report,
        section6: report.section6 || { attachmentNotes: '' },
        section1: {
          ...restSection1,
          nonConformityTypeId: restSection1.nonConformityTypeId || '',
        },
        section2: report.section2 || { correction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
        section3: report.section3 || { correctiveAction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
        section4: report.section4 || { rootCauseAnalysis: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
        section5: section5Data,
      } as NCARReport;
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