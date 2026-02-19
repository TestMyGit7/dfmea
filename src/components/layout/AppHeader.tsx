import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Sun, Moon, Info, Settings, LogOut } from "lucide-react";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  path: string;
  role: UserRole;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Viewer", path: "/viewer", role: "viewer" },
  { label: "Engineer", path: "/engineer", role: "engineer" },
  { label: "Admin", path: "/admin", role: "admin" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const displayName = user?.name ?? "";
  return (
    <header
      className={cn(
        "h-[55px] flex items-center justify-between px-4 gap-4",
        theme === "light" && "shadow-[0px_4px_6px_0px_#ababab]",
      )}
    >
      <div className="flex items-center gap-3">
        <img
          src={
            theme === "dark" ? "/zebra-logo_white.svg" : "/zebra-logo_black.svg"
          }
          alt="Zebra Logo"
          className="h-6 w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/70 hover:text-black bg-black/50 "
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{displayName}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50">
              <Avatar className="h-7 w-7 border border-white/30 cursor-pointer hover:border-white/60 transition-colors">
                <AvatarFallback className="text-[11px] font-semibold bg-black/50 text-white hover:text-black hover:bg-white">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-44 rounded-xl shadow-lg border border-border bg-popover p-1"
          >
            <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Info</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-lg">
              <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
