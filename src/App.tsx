import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentsSetup from "./pages/admin/DepartmentsSetup";
import ClauseIDSetup from "./pages/admin/ClauseIDSetup";
import IQRNumberSetup from "./pages/admin/IQRNumberSetup";
import UserDashboard from "./pages/user/UserDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="setup/departments" element={<DepartmentsSetup />} />
            <Route path="setup/clause-id" element={<ClauseIDSetup />} />
            <Route path="setup/iqr-number" element={<IQRNumberSetup />} />
          </Route>

          {/* User Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;