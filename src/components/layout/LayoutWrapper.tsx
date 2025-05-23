import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import SidebarWrapper from "./SidebarWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
const LayoutWrapper = () => {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="font-semibold">Carteira Lovable</span>
          </div>
          <SidebarWrapper>
            <Sidebar />
          </SidebarWrapper>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-zinc-100">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default LayoutWrapper;