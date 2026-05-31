'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Sparkles, 
  FileText, 
  Home,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/chat', label: 'AI Chat', icon: Brain },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/journal', label: 'Journal', icon: FileText },
  { href: '/dashboard/learning', label: 'Learning Hub', icon: BookOpen },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/memories', label: 'Memory Vault', icon: Sparkles },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-20",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Brand logo & collapse button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/" className={cn(
          "flex items-center gap-2 text-primary font-bold text-lg transition-opacity hover:opacity-80",
          collapsed && "opacity-0 w-0 overflow-hidden"
        )}>
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          <span>LifeOS AI</span>
        </Link>
        
        {collapsed && (
          <Sparkles className="w-6 h-6 text-accent animate-pulse mx-auto" />
        )}

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative block">
              <span className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                isActive && "text-sidebar-primary bg-sidebar-accent/70"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-105",
                  isActive ? "text-primary" : "text-sidebar-foreground/60"
                )} />
                <span className={cn("transition-opacity duration-200", collapsed && "opacity-0 w-0 overflow-hidden")}>
                  {item.label}
                </span>
                
                {/* Active Indicator bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-indicator"
                    className="absolute left-0 w-1 h-3/5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User profile footer info */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <Avatar className="w-9 h-9 border border-sidebar-border">
            <AvatarImage src={user?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className={cn("text-left overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0" : "flex-1")}>
            <div className="text-sm font-bold text-foreground truncate">{user?.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={logout}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl justify-start gap-3 px-3 py-2.5 h-auto text-sm font-semibold",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive shrink-0" />
          <span className={cn(collapsed && "opacity-0 w-0 overflow-hidden")}>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
