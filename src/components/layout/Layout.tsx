
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import SidebarWrapper from "./SidebarWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, ChevronLeft } from "lucide-react";
import { useSidebar } from "../../contexts/SidebarContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const Layout = () => {
  const { user, loading } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
        isCollapsed
          ? "md:grid-cols-[64px_1fr] lg:grid-cols-[80px_1fr]"
          : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
      )}
    >
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-[60px] items-center border-b px-4">
            <span className={cn("font-semibold", isCollapsed && "hidden")}>
              MyPortfolio
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto rounded-full"
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
          <SidebarWrapper>
            <Sidebar />
          </SidebarWrapper>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
