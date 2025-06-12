import UserProfile from "./UserProfile";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow">
        {children}
      </div>
      <div className="mt-4 pt-4 border-t border-muted/20 px-3 flex items-center justify-between">
        <UserProfile />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default SidebarWrapper;
