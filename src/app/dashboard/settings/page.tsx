'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { User, ShieldAlert, Sliders, Database, ArrowDownToLine, Trash2, Check, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, isDemo, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);

    if (isDemo || !supabase) {
      // Demo update
      const mockUser = {
        ...user,
        name,
        email
      };
      localStorage.setItem('lifeos_demo_user', JSON.stringify(mockUser));
      setLoading(false);
      toast.success('Profile updated offline');
      return;
    }

    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ name })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile details updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      // Build full backup JSON
      const backup = {
        exported_at: new Date().toISOString(),
        profile: {
          name: user?.name,
          email: user?.email
        },
        goals: JSON.parse(localStorage.getItem('lifeos_goals') || '[]'),
        memories: JSON.parse(localStorage.getItem('lifeos_memories') || '[]'),
        learning_plans: JSON.parse(localStorage.getItem('lifeos_learning') || '[]'),
        journal_entries: JSON.parse(localStorage.getItem('lifeos_journal') || '[]'),
        chat_logs: JSON.parse(localStorage.getItem('lifeos_chat_logs') || '[]')
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `lifeos_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Ecosystem backup downloaded successfully!');
    } catch {
      toast.error('Failed to compile data backup');
    }
  };

  const handleWipeData = () => {
    if (confirm('Are you absolutely sure you want to delete all local data? This will clear goals, learning paths, journal reflections, and AI chat logs.')) {
      localStorage.removeItem('lifeos_goals');
      localStorage.removeItem('lifeos_memories');
      localStorage.removeItem('lifeos_learning');
      localStorage.removeItem('lifeos_journal');
      localStorage.removeItem('lifeos_chat_logs');
      
      toast.success('Ecosystem data cleared');
      setTimeout(() => {
        logout();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your personal details, visual appearances, and system configurations.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="glass-panel border-border/40 p-1 rounded-xl mb-6 flex gap-1 w-full max-w-md">
          <TabsTrigger value="profile" className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sliders className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="w-3.5 h-3.5" />
            <span>Data Vault</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile tab content */}
        <TabsContent value="profile" className="focus:outline-none">
          <Card className="glass-card border-border/40 shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your nickname is used by the AI coach in briefings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nick Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border/80 rounded-xl text-xs h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <Input
                    value={email}
                    disabled
                    className="bg-secondary/40 border-border/60 rounded-xl text-xs h-10 opacity-70 cursor-not-allowed"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs py-2.5 h-auto shadow-md"
                >
                  {loading ? 'Saving...' : 'Update Nickname'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab Content */}
        <TabsContent value="appearance" className="focus:outline-none">
          <Card className="glass-card border-border/40 shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Visual Theme Preferences</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Toggle between coffee-light cream and espresso-dark color ways.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl border border-border/85 bg-background/50">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-foreground">Toggle Light/Dark Theme</span>
                  <p className="text-[10px] text-muted-foreground">Currently using {theme} mode.</p>
                </div>
                
                <Button 
                  onClick={toggleTheme}
                  variant="outline" 
                  className="border-border/80 hover:bg-primary/10 rounded-xl text-xs flex items-center gap-1.5 h-auto py-2"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-accent" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>Switch Theme</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Vault Tab Content */}
        <TabsContent value="data" className="focus:outline-none">
          <Card className="glass-card border-border/40 shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">Data Backups & Privacy</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Export all configurations or completely wipe your local ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3.5 rounded-xl border border-border/80 bg-background/50">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <ArrowDownToLine className="w-4 h-4 text-primary" />
                    <span>Download JSON Backup</span>
                  </span>
                  <p className="text-[10px] text-muted-foreground">Includes goals list, study pathway timelines, journal reflections.</p>
                </div>
                
                <Button 
                  onClick={handleExportData}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs h-auto py-2 px-4 shadow"
                >
                  Export Data
                </Button>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 mt-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-destructive flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                    <span>Wipe Local Storage</span>
                  </span>
                  <p className="text-[10px] text-muted-foreground">Completely delete all records from this browser.</p>
                </div>
                
                <Button 
                  onClick={handleWipeData}
                  variant="destructive"
                  className="rounded-xl text-xs h-auto py-2 px-4 shadow"
                >
                  Wipe Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
