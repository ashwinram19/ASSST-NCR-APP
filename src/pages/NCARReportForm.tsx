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

// Section Imports
import Section1Details from '@/components/report/Section1Details';
import Section2Correction from '@/components/report/Section2Correction';
import Section3CorrectiveAction from '@/components/report/Section3CorrectiveAction';
import Section4RootCauseAnalysis from '@/components/report/Section4RootCauseAnalysis';
import Section5Verification from '@/components/report/Section5Verification';
import Section6Attachments from '@/components/report/Section6Attachments';

const NCARReportForm = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isUser } = useAuth();
  const [report, setReport] = React.useState<NCARReport | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (reportId) {
      const loadedReport = getReportById(reportId);
      if (loadedReport) {
        setReport(loadedReport);
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
    if (!report || report.status === 'Verified' || report.status === 'SubmittedForVerification') return;
    handleUpdateReport({
      ...report,
      collaborators: e.target.value,
    });
  };

  const validateSections2to5 = (report: NCARReport) => {
    // Check if required fields in sections 2-5 have content
    return (
      report.section2.correction &&
      report.section3.correctiveAction &&
      report.section4.rootCauseAnalysis &&
      report.section5.verificationDetails
    );
  }

  const handleSubmitForVerification = () => {
    if (!report || !isUser || report.status !== 'Section1Locked') return;

    if (!validateSections2to5(report)) {
        toast.error("Please ensure all fields in Sections 2 through 5 are completed before submitting.");
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

    const verifiedReport = {
      ...report,
      status: 'Verified' as ReportStatus,
      section5: {
        ...report.section5,
        dateVerified: new Date().toISOString().split('T')[0],
      }
    };
    handleUpdateReport(verifiedReport);
    toast.success(`Report ${report.name} verified and closed. Sections 2-5 are now locked.`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Report...</div>;
  }

  if (!report) {
    return null; // Should be handled by useEffect navigation
  }

  // Permissions logic
  const isSection1Editable = isAdmin && report.status === 'Draft';
  const isSections2to5Editable = (isAdmin || isUser) && report.status === 'Section1Locked';
  const isSection6Editable = isAdmin && (report.status === 'Draft' || report.status === 'SubmittedForVerification');
  const isReportVerified = report.status === 'Verified';
  const isSubmitted = report.status === 'SubmittedForVerification';
  
  const getSectionStatusIcon = (sectionName: string) => {
    if (report.status === 'Draft' && sectionName !== 'Section 1') {
        return <Lock className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return null;
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

      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Report Status: {report.status}</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['section-1']}>
                {/* Section 1: Non-Conformity Details (Admin Only Edit) */}
                <AccordionItem value="section-1">
                    <AccordionTrigger>Section 1: Non-Conformity Details</AccordionTrigger>
                    <AccordionContent>
                        <Section1Details
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSection1Editable}
                            isAdmin={isAdmin}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Collaborators Field */}
                <div className="p-4 border-b">
                    <Label htmlFor="collaborators">Collaborators (Enter names separated by comma)</Label>
                    <Input
                        id="collaborators"
                        placeholder="e.g., John Doe, Jane Smith"
                        value={report.collaborators}
                        onChange={handleCollaboratorsChange}
                        readOnly={isReportVerified || isSubmitted}
                        className={isReportVerified || isSubmitted ? 'bg-muted/50 mt-2' : 'mt-2'}
                    />
                </div>

                {/* Section 2: Correction */}
                <AccordionItem value="section-2">
                    <AccordionTrigger disabled={report.status === 'Draft'}>
                        Section 2: Correction
                        {getSectionStatusIcon('Section 2')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Section2Correction
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSections2to5Editable}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Section 3: Corrective Action */}
                <AccordionItem value="section-3">
                    <AccordionTrigger disabled={report.status === 'Draft'}>
                        Section 3: Corrective Action
                        {getSectionStatusIcon('Section 3')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Section3CorrectiveAction
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSections2to5Editable}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Section 4: Root Cause Analysis */}
                <AccordionItem value="section-4">
                    <AccordionTrigger disabled={report.status === 'Draft'}>
                        Section 4: Root Cause Analysis
                        {getSectionStatusIcon('Section 4')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Section4RootCauseAnalysis
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSections2to5Editable}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Section 5: Verification */}
                <AccordionItem value="section-5">
                    <AccordionTrigger disabled={report.status === 'Draft'}>
                        Section 5: Verification of Implementation and Effectiveness
                        {getSectionStatusIcon('Section 5')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Section5Verification
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSections2to5Editable}
                        />
                    </AccordionContent>
                </AccordionItem>
                
                {/* Section 6: Attachments (Admin Only) */}
                <AccordionItem value="section-6">
                    <AccordionTrigger>
                        Section 6: Attachments / Verification Notes
                        {isReportVerified ? null : <Lock className="ml-2 h-4 w-4 text-muted-foreground" />}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Section6Attachments
                            report={report}
                            onUpdate={handleUpdateReport}
                            isEditable={isSection6Editable}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>

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

        {/* Download Section (Visible if Verified) */}
        {isReportVerified && (
          <div className="space-x-4">
            <span className="text-lg font-semibold text-primary">Download Report:</span>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> Word
            </Button>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
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