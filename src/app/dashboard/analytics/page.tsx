'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Smile, 
  Target, 
  Brain, 
  BookOpen,
  Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for graphs
const MOOD_DATA = [
  { day: 'Mon', score: 3 }, // calm
  { day: 'Tue', score: 4 }, // productive
  { day: 'Wed', score: 5 }, // energetic
  { day: 'Thu', score: 2 }, // tired
  { day: 'Fri', score: 4 }, // productive
  { day: 'Sat', score: 4 }, // productive
  { day: 'Sun', score: 5 }  // energetic
];

const WEEKLY_ACTIVITY = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 4.2 },
  { day: 'Wed', hours: 5.0 },
  { day: 'Thu', hours: 1.8 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 4.5 }
];

const LEARNING_PROGRESS = [
  { subject: 'Rust', completed: 25, pending: 75 },
  { subject: 'Next.js', completed: 80, pending: 20 },
  { subject: 'Psychology', completed: 40, pending: 60 }
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="py-20 text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs text-muted-foreground font-semibold">Preparing analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Description header */}
      <div>
        <p className="text-sm text-muted-foreground font-medium">
          Visual insights of your goals completion, learning milestones, emotional mood vectors, and habit consistency.
        </p>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border/40 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Productivity Vector</span>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">84%</div>
            <span className="text-[10px] text-emerald-500 font-bold">▲ 4% this week</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        
        <Card className="glass-card border-border/40 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Goal Autopilot hits</span>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">18 logs</div>
            <span className="text-[10px] text-indigo-500 font-bold">▲ 10 updates</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
        </Card>

        <Card className="glass-card border-border/40 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Mood Rating</span>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">Productive (4.1)</div>
            <span className="text-[10px] text-accent font-bold">★ High emotional regulation</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent-foreground flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity Hours Area Chart */}
        <Card className="glass-card border-border/40 shadow-sm">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Weekly Work Blocks Hours</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
              Hours spent inside deep concentration blocks per day
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_ACTIVITY}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--color-card)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'inherit'
                  }} 
                />
                <Area type="monotone" dataKey="hours" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Vector Line Chart */}
        <Card className="glass-card border-border/40 shadow-sm">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-accent" />
              <span>Cognitive Mood Trends</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
              Emotional logs ratings (1 = stressed/tired, 5 = energetic/productive)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOOD_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.2} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={[1, 5]} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--color-card)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'inherit'
                  }} 
                />
                <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning Hub subjects completions bar chart */}
        <Card className="glass-card border-border/40 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Subject Curriculum Completions</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
              Progression comparisons of active study templates
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LEARNING_PROGRESS} layout="vertical">
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis dataKey="subject" type="category" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--color-card)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'inherit'
                  }} 
                />
                <Bar dataKey="completed" stackId="a" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="pending" stackId="a" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
