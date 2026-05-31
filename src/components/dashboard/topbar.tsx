'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  Menu, 
  Sparkles, 
  Home, 
  Brain, 
  Target, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

export default function DashboardTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Initialize html class
    const saved = localStorage.getItem('lifeos-theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.state?.theme) {
        document.documentElement.classList.add(parsed.state.theme);
      }
    }
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/chat': return 'AI Chat';
      case '/dashboard/goals': return 'Goals Tracker';
      case '/dashboard/journal': return 'Journal reflections';
      case '/dashboard/learning': return 'Learning Hub';
      case '/dashboard/analytics': return 'Productivity Analytics';
      case '/dashboard/memories': return 'Memory Vault';
      case '/dashboard/settings': return 'Settings';
      default: return 'LifeOS AI';
    }
  };

  return (
    <header className="h-16 border-b border-border/40 px-6 flex items-center justify-between sticky top-0 bg-background/60 backdrop-blur-md z-10">
      {/* Title / Mobile Trigger */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          } />
          <SheetContent side="left" className="w-72 bg-sidebar p-0 border-r border-sidebar-border">
            <SheetHeader className="h-16 flex flex-row items-center justify-between px-4 border-b border-sidebar-border space-y-0">
              <SheetTitle className="text-left font-bold text-primary text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span>LifeOS AI</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="px-3 py-6 space-y-1">
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'text-sidebar-primary bg-sidebar-accent/80' 
                        : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-sidebar-foreground/60'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <hr className="border-sidebar-border my-4" />
              <Button 
                variant="ghost" 
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl justify-start gap-3 px-3 py-2.5 h-auto text-sm font-semibold"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        
        <h1 className="font-bold text-lg md:text-xl text-foreground capitalize tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search Mock */}
        <div className="relative hidden sm:block max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Type cmd+k to search..."
            className="pl-9 pr-4 py-1.5 bg-secondary/40 border border-border/80 rounded-full text-xs font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 transition-all"
          />
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}

        {/* Notifications Mock */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </Button>

        {/* User profile dropdown trigger mock */}
        <Avatar className="w-8 h-8 border border-border/85 hidden sm:block select-none cursor-pointer">
          <AvatarImage src={user?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
