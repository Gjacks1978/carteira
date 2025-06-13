import UserProfile from "./UserProfile";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "../../contexts/SidebarContext";
import { cn } from "../../lib/utils";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow">
        {children}
      </div>
      <div className={cn("mt-auto p-4 border-t border-muted/20", isCollapsed && "p-2")}>
        <div className={cn("flex", isCollapsed ? "flex-col items-center gap-y-2" : "items-center justify-between")}>
          <UserProfile />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default SidebarWrapper;
