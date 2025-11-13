import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Utility function to simulate login and set role in local storage
const simulateLogin = (role: 'admin' | 'user', navigate: (path: string) => void) => {
  localStorage.setItem('userRole', role);
  if (role === 'admin') {
    navigate('/admin/dashboard');
  } else {
    navigate('/user/dashboard');
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = () => {
    if (adminPassword.trim() !== '') {
      simulateLogin('admin', navigate);
      toast.success("Admin login successful.");
    } else {
      toast.error("Please enter a password.");
    }
  };

  const handleUserLogin = () => {
    simulateLogin('user', navigate);
    toast.success("User login successful.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">NC/CAR System Login</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Select your role to proceed.</p>
        
        <div className="space-y-6">
          {/* Admin Login Section */}
          <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Access</h2>
            <div className="space-y-2 text-left">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <Button 
              className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              onClick={handleAdminLogin}
            >
              Login as Admin
            </Button>
          </div>

          {/* User Login Section */}
          <Button 
            variant="outline"
            className="w-full py-6 text-lg font-semibold border-gray-300 dark:border-gray-600"
            onClick={handleUserLogin}
          >
            Login as User
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Login;