import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadReports, deleteReport, NCARReport, saveReport } from '@/lib/report-storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import NewReportForm from '@/components/NewReportForm';

const ReportRow: React.FC<{ report: NCARReport, onDelete: (id: string) => void, onUpdate: (report: NCARReport) => void }> = ({ report, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(report.name);

  const handleSaveName = () => {
    if (newName.trim() && newName !== report.name) {
      onUpdate({ ...report, name: newName.trim() });
      toast.success("Report name updated.");
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: NCARReport['status']) => {
    switch (status) {
      case 'Draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Draft</span>;
      case 'Section1Locked':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">In Progress</span>;
      case 'Verified':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Verified</span>;
      default:
        return null;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {isEditing ? (
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
          />
        ) : (
          <div className="flex items-center space-x-2">
            <span>{report.name}</span>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell>{getStatusBadge(report.status)}</TableCell>
      <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/admin/report/${report.id}`)}
        >
          <FileText className="mr-2 h-4 w-4" /> View/Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(report.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = React.useState<NCARReport[]>([]);

  const refreshReports = () => {
    // Sort by creation date descending
    setReports(loadReports().sort((a, b) => b.createdAt - a.createdAt));
  };

  React.useEffect(() => {
    refreshReports();
  }, []);

  const handleCreateReport = (reportData: {
    name: string;
    departmentId: string;
    clauseId: string;
    iqrNumberId: string;
    dateRaised: string;
    qmsClauseReference: string;
    associatedRisk: string;
    personResponsible: string;
  }) => {
    const now = Date.now();
    const newReport: NCARReport = {
      id: now.toString(),
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      
      // Identification fields from form
      name: reportData.name,
      departmentId: reportData.departmentId,
      clauseId: reportData.clauseId,
      iqrNumberId: reportData.iqrNumberId,
      dateRaised: reportData.dateRaised,
      qmsClauseReference: reportData.qmsClauseReference, 
      associatedRisk: reportData.associatedRisk,      
      personResponsible: reportData.personResponsible,   
      
      // Section 1 (only details and admin actions remain)
      section1: {
        nonConformityDetails: '',
        adminAcknowledged: false,
        adminSentMail: false,
      },
      collaborators: '',
      section2: { correction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section3: { correctiveAction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section4: { rootCauseAnalysis: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section5: { verificationDetails: '', dateVerified: '', reviewedBy: '', approvedBy: '' },
    };

    saveReport(newReport);
    refreshReports();
    toast.success(`Report '${newReport.name}' created successfully.`);
    navigate(`/admin/report/${newReport.id}`);
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    refreshReports();
    toast.success("Report deleted successfully.");
  };

  const handleUpdateReport = (updatedReport: NCARReport) => {
    saveReport(updatedReport);
    refreshReports();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Report Management</h1>
      </div>
      
      <NewReportForm onCreate={handleCreateReport} />

      <Card>
        <CardHeader>
          <CardTitle>Existing Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No reports created yet.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <ReportRow 
                    key={report.id} 
                    report={report} 
                    onDelete={handleDeleteReport} 
                    onUpdate={handleUpdateReport}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;