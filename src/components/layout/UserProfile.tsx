
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const UserProfile = () => {
  const { user, profile, signOut } = useAuth();
  const { isCollapsed } = useSidebar();

  if (!user) return null;

  const displayName = profile?.name || user.email;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <DropdownMenu>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-10 flex items-center",
                isCollapsed ? "justify-center p-0" : "justify-start px-3"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className={cn("ml-2 truncate", isCollapsed && "hidden")}>
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={5}>
            {displayName}
          </TooltipContent>
        )}
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
