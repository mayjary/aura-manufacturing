import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginAdmin from "./pages/LoginAdmin";
import LoginClient from "./pages/LoginClient";
import LoginWorker from "./pages/LoginWorker";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProduction from "./pages/admin/AdminProduction";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminQuality from "./pages/admin/AdminQuality";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import ClientDashboard from "./pages/ClientDashboard";
import ClientDeliveries from "./pages/client/ClientDeliveries";
import ClientHistory from "./pages/client/ClientHistory";
import ClientSettings from "./pages/client/ClientSettings";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerQCLogs from "./pages/worker/WorkerQCLogs";
import WorkerHistory from "./pages/worker/WorkerHistory";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerSettings from "./pages/worker/WorkerSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/admin" element={<LoginAdmin />} />
          <Route path="/login/client" element={<LoginClient />} />
          <Route path="/login/worker" element={<LoginWorker />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/production" element={<AdminProduction />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/quality" element={<AdminQuality />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/deliveries" element={<ClientDeliveries />} />
          <Route path="/client/history" element={<ClientHistory />} />
          <Route path="/client/settings" element={<ClientSettings />} />
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/qc-logs" element={<WorkerQCLogs />} />
          <Route path="/worker/history" element={<WorkerHistory />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/settings" element={<WorkerSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
