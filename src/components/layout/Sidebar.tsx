
import { NavLink } from "react-router-dom";
import { Home, PieChart, Bitcoin } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="space-y-1 py-2 px-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center py-2 px-3 rounded-md transition-colors ${
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Home className="h-4 w-4 mr-2" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/ativos"
        className={({ isActive }) =>
          `flex items-center py-2 px-3 rounded-md transition-colors ${
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          }`
        }
      >
        <PieChart className="h-4 w-4 mr-2" />
        <span>Ativos</span>
      </NavLink>
      <NavLink
        to="/cripto"
        className={({ isActive }) =>
          `flex items-center py-2 px-3 rounded-md transition-colors ${
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          }`
        }
      >
        <Bitcoin className="h-4 w-4 mr-2" />
        <span>Cripto</span>
      </NavLink>
    </div>
  );
};

export default Sidebar;
