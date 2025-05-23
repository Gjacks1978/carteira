
// This file is read-only, so I'll create a SidebarWrapper component to include the UserProfile

import UserProfile from "./UserProfile";

// This wrapper component will be imported in the Layout.tsx file
const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
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
