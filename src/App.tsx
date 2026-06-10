import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import IndexV2 from "./pages/IndexV2.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Enquiries from "./pages/Enquiries.tsx";
import Approvals from "./pages/Approvals.tsx";
import Reports from "./pages/Reports.tsx";
import ReportsCustom from "./pages/ReportsCustom.tsx";
import ReportsScheduled from "./pages/ReportsScheduled.tsx";
import ReportView from "./pages/ReportView.tsx";
import AuditTrail from "./pages/AuditTrail.tsx";
import Users from "./pages/Users.tsx";
import UserGroups from "./pages/UserGroups.tsx";
import UserDetail from "./pages/UserDetail.tsx";
import Delegations from "./pages/Delegations.tsx";
import DelegationDetail from "./pages/DelegationDetail.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ActingProvider } from "./context/ActingContext.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ActingProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/v2" element={<IndexV2 />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/custom" element={<ReportsCustom />} />
            <Route path="/reports/scheduled" element={<ReportsScheduled />} />
            <Route path="/reports/view/:templateId" element={<ReportView />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/groups" element={<UserGroups />} />
            <Route path="/users/delegations" element={<Delegations />} />
            <Route path="/users/delegations/:id" element={<DelegationDetail />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ActingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
