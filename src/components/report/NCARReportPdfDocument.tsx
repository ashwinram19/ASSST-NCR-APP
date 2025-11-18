import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { NCARReport, VerificationStep } from '@/lib/report-storage';
import { getDepartments, getClauseIDs, getIQRNumbers, getNonConformityTypes, SetupItem } from '@/lib/data-storage';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: '1pt solid #ccc',
  },
  statusBadge: {
    fontSize: 10,
    textAlign: 'center',
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: '1pt solid #eee',
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  gridItemHalf: {
    width: '50%',
    paddingRight: 10,
    marginBottom: 5,
  },
  gridItemThird: {
    width: '33.33%',
    paddingRight: 10,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#555',
  },
  valueBox: {
    padding: 4,
    backgroundColor: '#f5f5f5',
    border: '1pt solid #ddd',
    minHeight: 15,
    whiteSpace: 'pre-wrap',
  },
  // Verification Table Styles
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottom: '1pt solid #eee',
  },
  tableColHeaderResult: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableColHeaderDetails: {
    width: '75%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableColResult: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#eee',
    padding: 5,
  },
  tableColDetails: {
    width: '75%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#eee',
    padding: 5,
  },
  attachmentItem: {
    marginLeft: 10,
    marginBottom: 2,
  }
});

interface PdfLabelValueProps {
  label: string;
  value: string;
  width?: 'full' | 'half' | 'third';
  multiline?: boolean;
}

const PdfLabelValue: React.FC<PdfLabelValueProps> = ({ label, value, width = 'full', multiline = false }) => {
  const itemStyle = width === 'half' ? styles.gridItemHalf : width === 'third' ? styles.gridItemThird : { width: '100%', marginBottom: 5 };
  
  return (
    <View style={itemStyle}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.valueBox, multiline ? { minHeight: 40 } : {}]}>
        <Text>{value || 'N/A'}</Text>
      </View>
    </View>
  );
};

interface NCARReportPdfDocumentProps {
  report: NCARReport;
}

const NCARReportPdfDocument: React.FC<NCARReportPdfDocumentProps> = ({ report }) => {
  // Load setup data (must be done synchronously here as it's client-side storage)
  const departments = getDepartments();
  const clauseIDs = getClauseIDs();
  const iqrNumbers = getIQRNumbers();
  const nonConformityTypes = getNonConformityTypes();

  const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

  const getStatusText = (status: NCARReport['status']) => {
    switch (status) {
      case 'Draft': return 'Draft';
      case 'Section1Locked': return 'In Progress (User Action)';
      case 'SubmittedForVerification': return 'Submitted for Verification (Admin Action)';
      case 'Verified': return 'Verified & Closed';
      default: return 'Unknown';
    }
  };

  const renderSection1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Section 1: Non-Conformity Details</Text>
      
      <Text style={styles.subSectionTitle}>Report Identification</Text>
      <View style={styles.gridContainer}>
        <PdfLabelValue 
          label="Department" 
          value={findNameById(report.section1.departmentId, departments)} 
          width="third"
        />
        <PdfLabelValue 
          label="ISO Clause ID" 
          value={findNameById(report.section1.clauseId, clauseIDs)} 
          width="third"
        />
        <PdfLabelValue 
          label="IQR Number" 
          value={findNameById(report.section1.iqrNumberId, iqrNumbers)} 
          width="third"
        />
      </View>
      <View style={styles.gridContainer}>
        <PdfLabelValue 
          label="Type of Nonconformity" 
          value={findNameById(report.section1.nonConformityTypeId, nonConformityTypes)} 
          width="third"
        />
      </View>

      <Text style={styles.subSectionTitle}>Non-Conformity Details</Text>
      <View style={styles.gridContainer}>
        <PdfLabelValue 
          label="Date Raised" 
          value={report.section1.dateRaised} 
          width="half"
        />
        <PdfLabelValue 
          label="Person Responsible" 
          value={report.section1.personResponsible} 
          width="half"
        />
      </View>
      <View style={styles.gridContainer}>
        <PdfLabelValue 
          label="Associated Risk / Risk Type" 
          value={report.section1.associatedRisk} 
          width="full"
        />
      </View>
      <View style={styles.gridContainer}>
        <PdfLabelValue 
          label="Non-Conformity Details" 
          value={report.section1.nonConformityDetails} 
          width="full"
          multiline
        />
      </View>
    </View>
  );

  const renderSection234 = (sectionKey: 'section2' | 'section3' | 'section4', title: string) => {
    const section = report[sectionKey];
    const detailsLabel = sectionKey === 'section2' ? 'Correction Details' : 
                         sectionKey === 'section3' ? 'Corrective Action Details' : 
                         'Root Cause Analysis';
    
    return (
      <View break>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.gridContainer}>
          <PdfLabelValue 
            label={detailsLabel} 
            value={section.correction || section.correctiveAction || section.rootCauseAnalysis} 
            width="full"
            multiline
          />
        </View>
        <View style={styles.gridContainer}>
          <PdfLabelValue 
            label="Date Completed" 
            value={section.dateCompleted} 
            width="half"
          />
          <PdfLabelValue 
            label="Action Completed By" 
            value={section.reviewedBy} 
            width="half"
          />
        </View>
      </View>
    );
  };

  const renderSection5Verification = () => {
    const VERIFICATION_STEPS: Array<keyof NCARReport['section5']> = ['step1', 'step2'];
    
    return (
      <View break>
        <Text style={styles.sectionTitle}>Section 6: Verification of Implementation and Effectiveness</Text>
        
        <Text style={styles.subSectionTitle}>Verification Log</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow} fixed>
            <Text style={styles.tableColHeaderResult}>Verification Result</Text>
            <Text style={styles.tableColHeaderDetails}>Verification Details/Remarks</Text>
          </View>
          
          {/* Table Rows */}
          {VERIFICATION_STEPS.map((stepKey, index) => {
            const step: VerificationStep = report.section5[stepKey as 'step1' | 'step2'];
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableColResult}>{step.result || 'N/A'}</Text>
                <Text style={styles.tableColDetails}>{step.details || 'N/A'}</Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.gridContainer}>
          <PdfLabelValue 
            label="Verification Approval" 
            value={report.section5.approvedBy || 'Pending Verification Approval'} 
            width="full"
            multiline
          />
        </View>
      </View>
    );
  };

  const renderSection6Attachments = () => {
    const attachments = report.section6.attachmentNotes.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    
    return (
      <View break>
        <Text style={styles.sectionTitle}>Section 5: Attachments / Verification Notes</Text>
        
        <Text style={styles.subSectionTitle}>Attachment Notes</Text>
        <View style={[styles.valueBox, { minHeight: 40 }]}>
          {attachments.length === 0 ? (
            <Text>No attachments documented.</Text>
          ) : (
            attachments.map((attachment, index) => (
              <Text key={index} style={styles.attachmentItem}>
                • {attachment}
              </Text>
            ))
          )}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>NC/CAR Report: {report.name}</Text>
        
        <View style={styles.statusBadge}>
            <Text>Status: {getStatusText(report.status)}</Text>
        </View>

        {/* Collaborators */}
        <View style={styles.gridContainer}>
          <PdfLabelValue 
            label="Collaborators" 
            value={report.collaborators || 'N/A'} 
            width="full"
          />
        </View>

        {renderSection1()}
        
        {renderSection234('section2', 'Section 2: Correction')}
        
        {renderSection234('section3', 'Section 3: Corrective Action')}
        
        {renderSection234('section4', 'Section 4: Root Cause Analysis')}
        
        {/* Note: Section 5 in the UI is Attachments (using section6 data), Section 6 in the UI is Verification (using section5 data) */}
        {renderSection6Attachments()} 
        
        {renderSection5Verification()}
        
      </Page>
    </Document>
  );
};

export default NCARReportPdfDocument;