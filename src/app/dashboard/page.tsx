'use client';

import { useAuth } from '@/hooks/use-auth';
import StatsCard from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Brain, 
  Target, 
  BookOpen, 
  HeartPulse, 
  ArrowRight, 
  PlusCircle, 
  Calendar, 
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Mock initial data if storage is empty
const DEFAULT_GOALS = [
  { id: '1', title: 'Prepare for Product Manager Interviews', progress: 65, deadline: '2026-06-30', status: 'active' },
  { id: '2', title: 'Build Fullstack Web App with Next.js', progress: 80, deadline: '2026-06-15', status: 'active' },
  { id: '3', title: 'Read 5 Books on Cognitive Psychology', progress: 40, deadline: '2026-07-31', status: 'active' }
];

const DEFAULT_MEMORIES = [
  { id: '1', memory: 'Prefers coding in typescript and next.js', category: 'preferences', created_at: '2026-05-30' },
  { id: '2', memory: 'Main target is transitioning to PM by Q3', category: 'career', created_at: '2026-05-29' },
  { id: '3', memory: 'Struggles with sleep consistency (late-night screen time)', category: 'general', created_at: '2026-05-28' }
];

export default function DashboardHome() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Welcome back');
  const [goalsCount, setGoalsCount] = useState(0);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);

  useEffect(() => {
    // 1. Calculate time-of-day greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // 2. Initialize localStorage tables if empty
    if (!localStorage.getItem('lifeos_goals')) {
      localStorage.setItem('lifeos_goals', JSON.stringify(DEFAULT_GOALS));
    }
    if (!localStorage.getItem('lifeos_memories')) {
      localStorage.setItem('lifeos_memories', JSON.stringify(DEFAULT_MEMORIES));
    }
    if (!localStorage.getItem('lifeos_learning')) {
      localStorage.setItem('lifeos_learning', JSON.stringify([
        { id: '1', title: 'Rust Systems Programming', progress: 25 },
        { id: '2', title: 'Financial Modeling 101', progress: 50 }
      ]));
    }
    if (!localStorage.getItem('lifeos_journal')) {
      localStorage.setItem('lifeos_journal', JSON.stringify([
        { id: '1', content: 'Today was super productive. Finished the Next.js auth setup.', mood: 'productive', created_at: '2026-05-30' },
        { id: '2', content: 'Felt a bit tired. Need to step away from screens earlier.', mood: 'tired', created_at: '2026-05-29' }
      ]));
    }

    // 3. Load stats and items
    const loadedGoals = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
    const loadedMemories = JSON.parse(localStorage.getItem('lifeos_memories') || '[]');
    const loadedLearning = JSON.parse(localStorage.getItem('lifeos_learning') || '[]');
    const loadedJournal = JSON.parse(localStorage.getItem('lifeos_journal') || '[]');

    setActiveGoals(loadedGoals.slice(0, 3));
    setRecentMemories(loadedMemories.slice(0, 3));

    setGoalsCount(loadedGoals.filter((g: any) => g.status === 'active').length);
    setMemoriesCount(loadedMemories.length);
    setLearningCount(loadedLearning.length);
    setJournalCount(loadedJournal.length);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5"
      >
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {greeting}, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Here is what your AI assistant has prepared for your day.
          </p>
        </div>

        <div className="flex gap-2">
          <Button render={<Link href="/dashboard/chat" className="flex items-center gap-1.5" />} className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl h-auto py-2.5 text-xs shadow-md">
            <Brain className="w-3.5 h-3.5" />
            <span>Talk to Mentor</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Goals"
          value={goalsCount}
          icon={<Target className="w-5 h-5 text-amber-500" />}
          description="Aligned long-term ambitions"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="AI Memory Nodes"
          value={memoriesCount}
          icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
          description="Extracted preferences & facts"
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Learning Plans"
          value={learningCount}
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
          description="Skill building roadmaps"
        />
        <StatsCard
          title="Journal Entries"
          value={journalCount}
          icon={<HeartPulse className="w-5 h-5 text-rose-500" />}
          description="Emotional logs & mood tracker"
        />
      </div>

      {/* AI Daily Briefing Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-border/40 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="text-left">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent animate-pulse" />
                <span>AI Daily Executive Briefing</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Proactive coaching summary based on your goals and memory vault
              </CardDescription>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
              Grok 3 Autopilot
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground text-left font-medium">
              “Alex, today's primary focus should be finishing the <strong>Next.js Fullstack Web App</strong>. You're currently at 80% progress with a deadline approaching in 15 days. Based on your memory vault, you study best in focused morning blocks. I suggest reserving 9:00 AM - 11:30 AM today for coding. Also, remember to step away from screens by 10:30 PM tonight to improve sleep consistency, which you noted as a concern in your recent journal logs.”
            </p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
              <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">⚡ Action: Code Next.js layout (2h)</span>
              <span className="text-[11px] font-semibold bg-accent/10 text-accent-foreground px-2.5 py-1 rounded-full">🧘 Goal: Screen-free after 10:30 PM</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Goals & Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-card border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="text-left">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span>Your Main Priorities</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Currently active goals with visual progress bars
                </CardDescription>
              </div>
              <Button render={<Link href="/dashboard/goals" className="flex items-center gap-1" />} variant="ghost" size="sm" className="text-primary hover:text-accent font-bold text-xs h-auto p-0">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {activeGoals.map((g) => (
                <div key={g.id} className="space-y-2 border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground truncate max-w-[70%]">{g.title}</span>
                    <span className="font-bold text-accent">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${g.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {new Date(g.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </span>
                    <span className="capitalize">{g.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Memory Vault Overview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="text-left">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Memory Vault Snippets</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Recent preferences learned from your chat behavior
                </CardDescription>
              </div>
              <Button render={<Link href="/dashboard/memories" className="flex items-center gap-1" />} variant="ghost" size="sm" className="text-primary hover:text-accent font-bold text-xs h-auto p-0">
                <span>Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-1">
              {recentMemories.map((m) => (
                <div key={m.id} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-background/50 border border-border/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 animate-pulse" />
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs text-foreground font-semibold leading-relaxed">“{m.memory}”</p>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/70 px-1.5 py-0.5 rounded">
                      {m.category}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Button render={<Link href="/dashboard/chat" />} variant="outline" className="border-border/80 hover:bg-primary/5 hover:text-primary rounded-xl py-5 h-auto text-xs font-bold gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Consult Life Coach</span>
        </Button>
        <Button render={<Link href="/dashboard/journal" />} variant="outline" className="border-border/80 hover:bg-primary/5 hover:text-primary rounded-xl py-5 h-auto text-xs font-bold gap-2">
          <ListTodo className="w-4 h-4" />
          <span>Reflect in Journal</span>
        </Button>
        <Button render={<Link href="/dashboard/goals" />} variant="outline" className="border-border/80 hover:bg-primary/5 hover:text-primary rounded-xl py-5 h-auto text-xs font-bold gap-2 col-span-2 sm:col-span-1">
          <PlusCircle className="w-4 h-4" />
          <span>Create New Goal</span>
        </Button>
      </div>
    </div>
  );
}
