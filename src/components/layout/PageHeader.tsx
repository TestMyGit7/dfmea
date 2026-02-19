import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface PageHeaderProps {
  title: string;
  userName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, userName }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const displayName = userName ?? user?.name ?? "";
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
      <div className="flex items-center gap-3">
        <img
          src={
            theme === "dark" ? "/zebra-logo_white.svg" : "/zebra-logo_black.svg"
          }
          alt="Zebra Logo"
          className="h-6 w-auto"
        />
      </div>
      <h1 className="text-sm font-bold text-destructive tracking-wide">
        {title}
      </h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{displayName}</span>
      </div>
    </div>
  );
};
