
import UserProfile from "./UserProfile";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-grow">
        {children}
      </div>
      <div className="mt-4 pt-4 border-t">
        <UserProfile />
      </div>
    </div>
  );
};

export default SidebarWrapper;
