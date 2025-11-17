import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, FileText } from 'lucide-react';
import { loadReports, NCARReport } from '@/lib/report-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = React.useState<NCARReport[]>([]);

  React.useEffect(() => {
    // Users only see reports that are Section1Locked (ready for their input), SubmittedForVerification, or Verified (for viewing).
    setReports(loadReports().filter(r => r.status !== 'Draft'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const getStatusBadge = (status: NCARReport['status']) => {
    switch (status) {
      case 'Section1Locked':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Action Required</span>;
      case 'SubmittedForVerification':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Submitted</span>;
      case 'Verified':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Verified</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
      
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Assigned Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Raised</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No reports assigned to you yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.name}</TableCell>
                                <TableCell>{getStatusBadge(report.status)}</TableCell>
                                <TableCell>{report.section1.dateRaised}</TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => navigate(`/user/report/${report.id}`)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" /> Open Report
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;