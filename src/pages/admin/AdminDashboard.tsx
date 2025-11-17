import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadReports, deleteReport, NCARReport, saveReport } from '@/lib/report-storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import NewReportForm from '@/components/NewReportForm';
import { getDepartments, getClauseIDs, getIQRNumbers, getNonConformityTypes, SetupItem } from '@/lib/data-storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Define SortConfig type
type SortKey = 'name' | 'departmentId' | 'clauseId' | 'iqrNumberId' | 'createdAt';
type SortConfig = {
  key: SortKey;
  direction: 'ascending' | 'descending';
};

// Define FilterState type
type ReportStatusFilter = NCARReport['status'] | 'all';

interface FilterState {
  status: ReportStatusFilter;
  departmentId: string | 'all';
  clauseId: string | 'all';
  iqrNumberId: string | 'all';
  nonConformityTypeId: string | 'all';
}

// Helper function to find name by ID
const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

const ReportRow: React.FC<{ 
  report: NCARReport, 
  onDelete: (id: string) => void, 
  onUpdate: (report: NCARReport) => void,
  departments: SetupItem[],
  clauseIDs: SetupItem[],
  iqrNumbers: SetupItem[],
  nonConformityTypes: SetupItem[],
}> = ({ report, onDelete, onUpdate, departments, clauseIDs, iqrNumbers, nonConformityTypes }) => {
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
      <TableCell>{findNameById(report.section1.nonConformityTypeId, nonConformityTypes)}</TableCell>
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
  const [nonConformityTypes, setNonConformityTypes] = React.useState<SetupItem[]>([]);
  
  // Initialize sorting state, default to sorting by creation date descending
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

  // Initialize filtering state
  const [filters, setFilters] = React.useState<FilterState>({
    status: 'all',
    departmentId: 'all',
    clauseId: 'all',
    iqrNumberId: 'all',
    nonConformityTypeId: 'all',
  });


  const loadSetupData = () => {
    setDepartments(getDepartments());
    setClauseIDs(getClauseIDs());
    setIqrNumbers(getIQRNumbers());
    setNonConformityTypes(getNonConformityTypes());
  };

  const refreshReports = () => {
    setReports(loadReports());
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
        nonConformityTypeId: '', // Initialize new field
        nonConformityDetails: '',
        adminAcknowledged: false,
        adminSentMail: false,
        
        // Initializing other fields
        dateRaised: new Date().toISOString().split('T')[0], // Default to today
        associatedRisk: '',      
        personResponsible: '',   
      },
      collaborators: '',
      section2: { correction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section3: { correctiveAction: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section4: { rootCauseAnalysis: '', dateCompleted: '', reviewedBy: '', approvedBy: '' },
      section5: { 
        step1: { result: '', details: '' },
        step2: { result: '', details: '' },
        step3: { result: '', details: '' },
        dateVerified: '', 
        approvedBy: '' 
      }, // Updated initialization to fixed 3 steps
      section6: { attachmentNotes: '' }, // Initialize new section
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
  
  // Handle filter change
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // --- Sorting Logic ---
  const requestSort = (key: SortKey) => {
    let direction: SortConfig['direction'] = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredReports = React.useMemo(() => {
    let filteredReports = reports;

    // 1. Filtering Logic
    if (filters.status !== 'all') {
      filteredReports = filteredReports.filter(r => r.status === filters.status);
    }
    if (filters.departmentId !== 'all') {
      filteredReports = filteredReports.filter(r => r.section1.departmentId === filters.departmentId);
    }
    if (filters.clauseId !== 'all') {
      filteredReports = filteredReports.filter(r => r.section1.clauseId === filters.clauseId);
    }
    if (filters.iqrNumberId !== 'all') {
      filteredReports = filteredReports.filter(r => r.section1.iqrNumberId === filters.iqrNumberId);
    }
    if (filters.nonConformityTypeId !== 'all') {
      filteredReports = filteredReports.filter(r => r.section1.nonConformityTypeId === filters.nonConformityTypeId);
    }
    
    // 2. Sorting Logic
    let sortableReports = [...filteredReports];
    if (sortConfig !== null) {
        sortableReports.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortConfig.key === 'name') {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            } else if (sortConfig.key === 'createdAt') {
                aValue = a.createdAt;
                bValue = b.createdAt;
            } else {
                // Lookup fields (departmentId, clauseId, iqrNumberId)
                const lookupData = 
                    sortConfig.key === 'departmentId' ? departments :
                    sortConfig.key === 'clauseId' ? clauseIDs :
                    sortConfig.key === 'iqrNumberId' ? iqrNumbers :
                    []; 

                const aId = a.section1[sortConfig.key as 'departmentId' | 'clauseId' | 'iqrNumberId'] || '';
                const bId = b.section1[sortConfig.key as 'departmentId' | 'clauseId' | 'iqrNumberId'] || '';

                aValue = findNameById(aId, lookupData).toLowerCase();
                bValue = findNameById(bId, lookupData).toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    
    return sortableReports;
  }, [reports, filters, sortConfig, departments, clauseIDs, iqrNumbers, nonConformityTypes]);

  // Helper for rendering sortable headers
  const renderSortableHeader = (key: SortKey, label: string) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => requestSort(key)}
    >
      <div className="flex items-center">
        {label}
        <ArrowUpDown className={
            `ml-2 h-4 w-4 ${sortConfig.key === key ? 'opacity-100' : 'opacity-40'}`
        } />
      </div>
    </TableHead>
  );
  // --- End Sorting Logic ---

  // New component/function to render a filter select
  const renderSelectFilter = (
    key: keyof FilterState, 
    label: string, 
    options: SetupItem[] | { id: ReportStatusFilter, name: string }[]
  ) => (
    <div className="flex flex-col space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select
        value={filters[key] as string}
        onValueChange={(value) => handleFilterChange(key, value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={`Filter by ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}s</SelectItem>
          {options.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Define status options
  const statusOptions: { id: ReportStatusFilter, name: string }[] = [
    { id: 'Draft', name: 'Draft' },
    { id: 'Section1Locked', name: 'In Progress (User Action)' },
    { id: 'SubmittedForVerification', name: 'Submitted (Admin Action)' },
    { id: 'Verified', name: 'Verified' },
  ];


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Report Management</h1>
      </div>
      
      <NewReportForm onCreate={handleCreateReport} />

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {renderSelectFilter('status', 'Status', statusOptions)}
            {renderSelectFilter('departmentId', 'Department', departments)}
            {renderSelectFilter('clauseId', 'ISO Clause ID', clauseIDs)}
            {renderSelectFilter('iqrNumberId', 'IQR Number', iqrNumbers)}
            {renderSelectFilter('nonConformityTypeId', 'Nonconformity Type', nonConformityTypes)}
            
            {/* Reset Button */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: 'all', departmentId: 'all', clauseId: 'all', iqrNumberId: 'all', nonConformityTypeId: 'all' })}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Reports ({sortedAndFilteredReports.length})</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader('name', 'Report Name')}
                    <TableHead>Status</TableHead>
                    {renderSortableHeader('departmentId', 'Department')}
                    {renderSortableHeader('clauseId', 'ISO Clause ID')}
                    {renderSortableHeader('iqrNumberId', 'IQR Number')}
                    <TableHead>Nonconformity Type</TableHead>
                    {renderSortableHeader('createdAt', 'Created Date')}
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No reports match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAndFilteredReports.map((report) => (
                      <ReportRow 
                        key={report.id} 
                        report={report} 
                        onDelete={handleDeleteReport} 
                        onUpdate={handleUpdateReport}
                        departments={departments}
                        clauseIDs={clauseIDs}
                        iqrNumbers={iqrNumbers}
                        nonConformityTypes={nonConformityTypes}
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