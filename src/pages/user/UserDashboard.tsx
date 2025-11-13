import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Assigned Reports</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Reports assigned to you for completing Sections 2-5 will appear here.
        </p>
        {/* Report list for users will go here */}
      </div>
    </div>
  );
};

export default UserDashboard;