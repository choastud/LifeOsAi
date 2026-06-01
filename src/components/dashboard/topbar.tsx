'use client';

import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  Mic,
  MicOff
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          toast.info('Listening for command... (e.g., "go to goals", "toggle theme")', {
            id: 'voice-command-status',
            duration: 5000
          });
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access blocked. Please allow mic permissions in your browser.', { id: 'voice-command-status' });
          } else if (event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
            toast.error('Voice input error: ' + event.error, { id: 'voice-command-status' });
          }
        };

        rec.onresult = (event: any) => {
          const rawText = event.results[0][0].transcript;
          const text = rawText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
          console.log('Voice Command received:', text);
          
          handleVoiceCommand(text);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    const speakFeedback = (msg: string) => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    };

    // 1. Navigation Commands
    if (command.includes('go to goals') || command.includes('open goals') || command.includes('navigate to goals')) {
      toast.success('Navigating to Goals Tracker', { id: 'voice-command-status' });
      speakFeedback('Navigating to Goals Tracker');
      router.push('/dashboard/goals');
    } else if (command.includes('go to journal') || command.includes('open journal') || command.includes('navigate to journal') || command.includes('go to reflections')) {
      toast.success('Navigating to Journal reflections', { id: 'voice-command-status' });
      speakFeedback('Navigating to Journal reflections');
      router.push('/dashboard/journal');
    } else if (command.includes('go to learning') || command.includes('open learning') || command.includes('navigate to learning') || command.includes('go to learning hub') || command.includes('learning plans')) {
      toast.success('Navigating to Learning Hub', { id: 'voice-command-status' });
      speakFeedback('Navigating to Learning Hub');
      router.push('/dashboard/learning');
    } else if (command.includes('go to memories') || command.includes('open memories') || command.includes('navigate to memories') || command.includes('go to memory vault') || command.includes('memory vault')) {
      toast.success('Navigating to Memory Vault', { id: 'voice-command-status' });
      speakFeedback('Navigating to Memory Vault');
      router.push('/dashboard/memories');
    } else if (command.includes('go to settings') || command.includes('open settings') || command.includes('navigate to settings') || command.includes('go to profile')) {
      toast.success('Navigating to Settings', { id: 'voice-command-status' });
      speakFeedback('Navigating to Settings');
      router.push('/dashboard/settings');
    } else if (command.includes('go to analytics') || command.includes('open analytics') || command.includes('navigate to analytics') || command.includes('productivity analytics') || command.includes('productivity score')) {
      toast.success('Navigating to Productivity Analytics', { id: 'voice-command-status' });
      speakFeedback('Navigating to Productivity Analytics');
      router.push('/dashboard/analytics');
    } else if (command.includes('go to chat') || command.includes('open chat') || command.includes('talk to coach') || command.includes('talk to mentor') || command.includes('navigate to chat') || command.includes('ai chat')) {
      toast.success('Navigating to AI Chat', { id: 'voice-command-status' });
      speakFeedback('Navigating to AI Chat');
      router.push('/dashboard/chat');
    } else if (command.includes('go to dashboard') || command.includes('open dashboard') || command.includes('navigate to dashboard') || command.includes('go to home') || command.includes('open home') || command.includes('dashboard home')) {
      toast.success('Navigating to Dashboard Home', { id: 'voice-command-status' });
      speakFeedback('Navigating to Dashboard Home');
      router.push('/dashboard');
    } 
    // 2. Theme Action
    else if (command.includes('toggle theme') || command.includes('switch theme') || command.includes('change theme') || command.includes('dark mode') || command.includes('light mode')) {
      toast.success('Toggling theme', { id: 'voice-command-status' });
      speakFeedback('Toggling theme');
      toggleTheme();
    }
    // 3. Logout Action
    else if (command.includes('logout') || command.includes('log out') || command.includes('sign out')) {
      toast.success('Logging out', { id: 'voice-command-status' });
      speakFeedback('Logging out');
      logout();
    }
    // 4. Help
    else if (command.includes('help') || command.includes('show commands') || command.includes('commands')) {
      toast.info('Try saying: "go to goals", "go to chat", "toggle theme", or "logout"', { id: 'voice-command-status', duration: 6000 });
      speakFeedback('Try saying: go to goals, go to chat, toggle theme, or log out.');
    }
    // 5. Unrecognized
    else {
      toast.error(`Command not recognized: "${command}". Say "help" for a list of commands.`, { id: 'voice-command-status' });
      speakFeedback(`Command ${command} not recognized.`);
    }
  };

  const toggleVoiceCommands = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

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

        {/* Voice Command Toggle */}
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleVoiceCommands}
            className={cn(
              "rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-all duration-300",
              isListening && "bg-accent/15 text-accent hover:bg-accent/25 hover:text-accent"
            )}
            title="Voice Commands"
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 animate-bounce text-accent" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
              </>
            ) : (
              <Mic className="w-4 h-4" />
            )}
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
