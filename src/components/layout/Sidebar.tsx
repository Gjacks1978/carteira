
import { NavLink } from "react-router-dom";
import { Home, BarChart3, Coins } from "lucide-react";

interface SidebarProps {
  closeMobileMenu?: () => void;
}

const Sidebar = ({ closeMobileMenu }: SidebarProps) => {
  const handleNavClick = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/ativos", label: "Ativos", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/cripto", label: "Criptomoedas", icon: <Coins className="w-5 h-5" /> },
  ];

  return (
    <div className="h-full w-64 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800 shadow-sm flex flex-col transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary dark:text-white flex items-center gap-2">
          <Coins className="h-6 w-6" />
          <span>InvestControl</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 pb-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:bg-gray-800/50"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          InvestControl v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
