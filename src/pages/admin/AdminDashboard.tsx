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
import { getDepartments, getClauseIDs, getIQRNumbers, SetupItem } from '@/lib/data-storage';

// Helper function to find name by ID
const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

const ReportRow: React.FC<{ 
  report: NCARReport, 
  onDelete: (id: string) => void, 
  onUpdate: (report: NCARReport) => void,
  departments: SetupItem[],
  clauseIDs: SetupItem[],
  iqrNumbers: SetupItem[],
}> = ({ report, onDelete, onUpdate, departments, clauseIDs, iqrNumbers }) => {
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
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">In Progress (User Action)</span>;
      case 'SubmittedForVerification':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Submitted (Admin Action)</span>;
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
      <TableCell>{findNameById(report.section1.departmentId, departments)}</TableCell>
      <TableCell>{findNameById(report.section1.clauseId, clauseIDs)}</TableCell>
      <TableCell>{findNameById(report.section1.iqrNumberId, iqrNumbers)}</TableCell>
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
  const [departments, setDepartments] = React.useState<SetupItem[]>([]);
  const [clauseIDs, setClauseIDs] = React.useState<SetupItem[]>([]);
  const [iqrNumbers, setIqrNumbers] = React.useState<SetupItem[]>([]);


  const loadSetupData = () => {
    setDepartments(getDepartments());
    setClauseIDs(getClauseIDs());
    setIqrNumbers(getIQRNumbers());
  };

  const refreshReports = () => {
    // Sort by creation date descending
    setReports(loadReports().sort((a, b) => b.createdAt - a.createdAt));
  };

  React.useEffect(() => {
    loadSetupData();
    refreshReports();
  }, []);

  const handleCreateReport = (reportData: {
    name: string;
    section1: {
      departmentId: string;
      clauseId: string;
      iqrNumberId: string;
    }
  }) => {
    const now = Date.now();
    const newReport: NCARReport = {
      id: now.toString(),
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      
      name: reportData.name,
      
      // Section 1: Non-Conformity Details (Admin Only)
      section1: {
        ...reportData.section1, // departmentId, clauseId, iqrNumberId (now empty strings)
        nonConformityDetails: '',
        adminAcknowledged: false,
        adminSentMail: false,
        
        // Initializing other fields
        dateRaised: new Date().toISOString().split('T')[0], // Default to today
        qmsClauseReference: '', 
        associatedRisk: '',      
        personResponsible: '',   
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Clause ID</TableHead>
                    <TableHead>IQR Number</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                        departments={departments}
                        clauseIDs={clauseIDs}
                        iqrNumbers={iqrNumbers}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;