"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg border border-border/50 bg-background/80 hover:bg-muted/50 hover:text-foreground"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-40 rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm p-1.5 shadow-lg"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium focus:bg-muted/50 focus:text-accent-foreground"
        >
          <Sun className="mr-2 h-3.5 w-3.5" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium focus:bg-muted/50 focus:text-accent-foreground"
        >
          <Moon className="mr-2 h-3.5 w-3.5" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium focus:bg-muted/50 focus:text-accent-foreground"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2 h-3.5 w-3.5"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <circle cx="8" cy="21" r="1" />
            <circle cx="16" cy="21" r="1" />
            <path d="M12 17v.01" />
          </svg>
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
