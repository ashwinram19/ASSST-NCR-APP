import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, saveReport, NCARReport, ReportStatus } from '@/lib/report-storage';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Download, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Section Imports
import Section1Details from '@/components/report/Section1Details';
import Section2Correction from '@/components/report/Section2Correction';
import Section3CorrectiveAction from '@/components/report/Section3CorrectiveAction';
import Section4RootCauseAnalysis from '@/components/report/Section4RootCauseAnalysis';
import Section5Verification from '@/components/report/Section5Verification';
import Section6Attachments from '@/components/report/Section6Attachments';
import NCARReportPdfDocument from '@/components/report/NCARReportPdfDocument';

// PDF Utility Imports (kept for setup data loading)
import { getDepartments, getClauseIDs, getIQRNumbers, SetupItem } from '@/lib/data-storage';

// Define all section keys for easy management
const ALL_SECTIONS = ['section-1', 'section-2', 'section-3', 'section-4', 'section-5', 'section-6'];

const NCARReportForm = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isUser } = useAuth();
  const [report, setReport] = React.useState<NCARReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>(['section-1']); // State to control accordion
  
  // Removed isPdfExporting state and reportRef

  // State for setup data (kept for Section1Details display)
  const [setupData, setSetupData] = React.useState<{
    departments: SetupItem[];
    clauseIDs: SetupItem[];
    iqrNumbers: SetupItem[];
  }>({ departments: [], clauseIDs: [], iqrNumbers: [], });

  React.useEffect(() => {
    // Load setup data
    setSetupData({
      departments: getDepartments(),
      clauseIDs: getClauseIDs(),
      iqrNumbers: getIQRNumbers(),
    });

    if (reportId) {
      const loadedReport = getReportById(reportId);
      if (loadedReport) {
        setReport(loadedReport);
        // If verified, open all sections by default for final viewing/printing
        if (loadedReport.status === 'Verified') {
            setOpenAccordionItems(ALL_SECTIONS);
        }
      } else {
        toast.error("Report not found.");
        navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
      }
    }
    setLoading(false);
  }, [reportId, navigate, isAdmin]);

  const handleUpdateReport = (updatedReport: NCARReport) => {
    setReport(updatedReport);
    saveReport(updatedReport);
  };

  const handleCollaboratorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!report) return;
    
    // Admin can edit unless Verified. User can edit only in Draft or Section1Locked status.
    const isFieldEditable = isAdmin 
      ? report.status !== 'Verified' 
      : (report.status === 'Draft' || report.status === 'Section1Locked');
    
    if (!isFieldEditable) return;
    
    handleUpdateReport({
      ...report,
      collaborators: e.target.value,
    });
  };

  const validateSections234 = (report: NCARReport) => {
    // Check if required fields in sections 2, 3, and 4 have content
    return (
      report.section2.correction &&
      report.section3.correctiveAction &&
      report.section4.rootCauseAnalysis
    );
  }

  const handleSubmitForVerification = () => {
    if (!report || !isUser || report.status !== 'Section1Locked') return;

    if (!validateSections234(report)) {
        toast.error("Please ensure all fields in Sections 2 through 4 are completed before submitting.");
        return;
    }

    const submittedReport = {
      ...report,
      status: 'SubmittedForVerification' as ReportStatus,
    };
    handleUpdateReport(submittedReport);
    toast.success(`Report ${report.name} submitted for Admin verification.`);
  };

  const handleVerifyAndClose = () => {
    if (!report || !isAdmin || report.status !== 'SubmittedForVerification') return;

    const now = new Date();
    
    // Format: 8:34am 18Nov25
    const timePart = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const year = now.getFullYear().toString().slice(-2);
    const formattedTimestamp = `${timePart} ${day}${month}${year}`;

    const verifiedReport = {
      ...report,
      status: 'Verified' as ReportStatus,
      section5: {
        ...report.section5,
        dateVerified: now.toISOString().split('T')[0], // Keep dateVerified for data consistency
        approvedBySignature: 'QMS Admin', // Auto-generated signature
        approvedByTimestamp: formattedTimestamp, // Auto-generated timestamp
      }
    };
    handleUpdateReport(verifiedReport);
    // When verified, ensure all sections are open for final view
    setOpenAccordionItems(ALL_SECTIONS);
    toast.success(`Report ${report.name} verified and closed. Sections 2-6 are now locked.`);
  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading Report...</div>;
  }

  if (!report) {
    return null; // Should be handled by useEffect navigation
  }

  // Permissions logic based on new requirements:
  
  const isReportVerified = report.status === 'Verified';
  const isSubmitted = report.status === 'SubmittedForVerification';
  
  // FIX: Define isDownloadable here
  const isDownloadable = isReportVerified || isSubmitted; 
  
  // Admin can edit all sections (1-6) unless the report is Verified.
  const isAdminFullyEditable = isAdmin && !isReportVerified;

  // 1. Section 1 (Data: section1): Admin only, editable until Verified.
  const isSection1Editable = isAdminFullyEditable; 

  // 2. Sections 2, 3, 4 (Data: section2, section3, section4): 
  //    Admin editable until Verified. User editable when Section1Locked.
  const isSections234Editable = isAdminFullyEditable || (isUser && report.status === 'Section1Locked');

  // 3. Section 5: Attachments (Data: section6): 
  //    Admin editable until Verified. User editable when Section1Locked.
  const isSection5AttachmentsEditable = isAdminFullyEditable || (isUser && report.status === 'Section1Locked');

  // 4. Section 6: Verification (Data: section5): 
  //    Admin only, editable when SubmittedForVerification (or if Admin is fully editable).
  const isSection6VerificationEditable = isAdminFullyEditable && report.status === 'SubmittedForVerification';
  
  
  const getLockIcon = (isEditable: boolean) => {
    if (isEditable || isReportVerified) return null;
    return <Lock className="ml-2 h-4 w-4 text-muted-foreground" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{report.name}</h1>
        {isReportVerified && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-500 text-white flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" /> Verified & Closed
            </span>
        )}
        {isSubmitted && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-500 text-white flex items-center">
                Submitted for Verification
            </span>
        )}
      </div>

      {/* Report Content Container (UI View) */}
      <div className="space-y-6">
        
        <Card className="mb-6">
          <CardHeader>
              <CardTitle>Report Status: {report.status}</CardTitle>
          </CardHeader>
          <CardContent>
              <Accordion 
                type="multiple" 
                value={openAccordionItems} 
                onValueChange={setOpenAccordionItems}
              >
                  {/* Section 1: Non-Conformity Details (Admin Only Edit in Draft) */}
                  <AccordionItem 
                    value="section-1"
                  >
                      <AccordionTrigger>Section 1: Non-Conformity Details</AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section1Details
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSection1Editable}
                                  isAdmin={isAdmin}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>

                  {/* Collaborators Field */}
                  <div className={cn("p-4 border-b")}>
                      <Label htmlFor="collaborators">Collaborators (Enter names separated by comma)</Label>
                      <Input
                          id="collaborators"
                          placeholder="e.g., John Doe, Jane Smith"
                          value={report.collaborators}
                          onChange={handleCollaboratorsChange}
                          readOnly={!isAdminFullyEditable && (isReportVerified || isSubmitted)} // Only read-only if not Admin and status is Submitted/Verified
                          className={(!isAdminFullyEditable && (isReportVerified || isSubmitted)) ? 'bg-muted/50 mt-2' : 'mt-2'}
                      />
                  </div>

                  {/* Section 2: Correction */}
                  <AccordionItem 
                    value="section-2"
                  >
                      <AccordionTrigger disabled={report.status === 'Draft' && !isAdminFullyEditable}>
                          Section 2: Correction
                          {getLockIcon(isSections234Editable)}
                      </AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section2Correction
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSections234Editable}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>

                  {/* Section 3: Corrective Action */}
                  <AccordionItem 
                    value="section-3"
                  >
                      <AccordionTrigger disabled={report.status === 'Draft' && !isAdminFullyEditable}>
                          Section 3: Corrective Action
                          {getLockIcon(isSections234Editable)}
                      </AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section3CorrectiveAction
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSections234Editable}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>

                  {/* Section 4: Root Cause Analysis */}
                  <AccordionItem 
                    value="section-4"
                  >
                      <AccordionTrigger disabled={report.status === 'Draft' && !isAdminFullyEditable}>
                          Section 4: Root Cause Analysis
                          {getLockIcon(isSections234Editable)}
                      </AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section4RootCauseAnalysis
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSections234Editable}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>
                  
                  {/* Section 5: Attachments / Verification Notes (Uses section-6 data) */}
                  <AccordionItem value="section-6">
                      <AccordionTrigger disabled={report.status === 'Draft' && !isAdminFullyEditable}>
                          Section 5: Attachments / Verification Notes
                          {getLockIcon(isSection5AttachmentsEditable)}
                      </AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section6Attachments
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSection5AttachmentsEditable}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>

                  {/* Section 6: Verification of Implementation and Effectiveness (Uses section-5 data) */}
                  <AccordionItem 
                    value="section-5"
                  >
                      <AccordionTrigger disabled={report.status !== 'SubmittedForVerification' && !isReportVerified && !isAdminFullyEditable}>
                          Section 6: Verification of Implementation and Effectiveness
                          {getLockIcon(isSection6VerificationEditable)}
                      </AccordionTrigger>
                      <AccordionContent>
                          <div>
                              <Section5Verification
                                  report={report}
                                  onUpdate={handleUpdateReport}
                                  isEditable={isSection6VerificationEditable}
                              />
                          </div>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </CardContent>
        </Card>
      </div>
      {/* End Report Content Container */}


      {/* Action Section */}
      <div className="flex justify-between items-center mt-8 p-4 border-t">
        
        {/* User Submission Button */}
        {isUser && report.status === 'Section1Locked' && (
          <Button 
            onClick={handleSubmitForVerification} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Submit for Verification
          </Button>
        )}

        {/* Admin Verification Button */}
        {isAdmin && report.status === 'SubmittedForVerification' && (
          <Button 
            onClick={handleVerifyAndClose} 
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Verify and Close Report
          </Button>
        )}

        {/* Download Section (Visible if Verified or Submitted) */}
        {isDownloadable && (
          <div className="space-x-4">
            <span className="text-lg font-semibold text-primary">Download Report:</span>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> Word
            </Button>
            
            {/* PDF Download Link using @react-pdf/renderer */}
            <PDFDownloadLink 
                document={<NCARReportPdfDocument report={report} />} 
                fileName={`${report.name}_Report.pdf`}
            >
                {({ loading }) => (
                    <Button variant="default" disabled={loading}>
                        <Download className="mr-2 h-4 w-4" /> {loading ? 'Generating PDF...' : 'PDF'}
                    </Button>
                )}
            </PDFDownloadLink>
          </div>
        )}
        
        {/* Back button for all users */}
        <Button variant="outline" onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard')}>
            Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NCARReportForm;