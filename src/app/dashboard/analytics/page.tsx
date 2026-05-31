'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
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
  Loader2,
  Calendar,
  Grid
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock range datasets
const WEEK_ACTIVITY = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 4.2 },
  { day: 'Wed', hours: 5.0 },
  { day: 'Thu', hours: 1.8 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 4.5 }
];

const MONTH_ACTIVITY = [
  { day: 'Wk 1', hours: 18.2 },
  { day: 'Wk 2', hours: 24.5 },
  { day: 'Wk 3', hours: 15.0 },
  { day: 'Wk 4', hours: 28.3 }
];

const WEEK_MOOD_FALLBACK = [
  { day: 'Mon', score: 3 },
  { day: 'Tue', score: 4 },
  { day: 'Wed', score: 5 },
  { day: 'Thu', score: 2 },
  { day: 'Fri', score: 4 },
  { day: 'Sat', score: 4 },
  { day: 'Sun', score: 5 }
];

const MONTH_MOOD_FALLBACK = [
  { day: 'Wk 1', score: 3.8 },
  { day: 'Wk 2', score: 4.2 },
  { day: 'Wk 3', score: 3.5 },
  { day: 'Wk 4', score: 4.5 }
];

const LEARNING_PROGRESS = [
  { subject: 'Rust', completed: 25, pending: 75 },
  { subject: 'Next.js', completed: 80, pending: 20 },
  { subject: 'Psychology', completed: 40, pending: 60 }
];

const MOOD_MAPPING: Record<string, number> = {
  happy: 5,
  energetic: 5,
  productive: 4,
  calm: 3,
  tired: 2,
  anxious: 2,
  sad: 1,
  stressed: 1
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Interactive filters
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [chartStyle, setChartStyle] = useState<'area' | 'line' | 'bar'>('area');
  
  // Dyn data states
  const [activityData, setActivityData] = useState<any[]>(WEEK_ACTIVITY);
  const [moodData, setMoodData] = useState<any[]>(WEEK_MOOD_FALLBACK);
  const [avgMoodText, setAvgMoodText] = useState('Productive (4.1)');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync and generate statistics from live Supabase / localStorage logs
  useEffect(() => {
    if (!mounted) return;

    const computeLogs = async () => {
      // 1. Set activity range datasets
      setActivityData(timeRange === 'week' ? WEEK_ACTIVITY : MONTH_ACTIVITY);

      let rawLogs: any[] = [];

      if (isSupabaseConfigured && supabase && user) {
        try {
          const { data } = await supabase
            .from('journal_entries')
            .select('mood, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          
          if (data && data.length > 0) {
            rawLogs = data;
          }
        } catch (e) {
          console.error("DB journal fetch failed in analytics", e);
        }
      }

      // If DB empty or unconfigured, try localStorage
      if (rawLogs.length === 0) {
        const local = localStorage.getItem('lifeos_journal');
        if (local) {
          rawLogs = JSON.parse(local);
        }
      }

      // 2. Parse mood logs into coordinates
      if (rawLogs.length > 0) {
        if (timeRange === 'week') {
          // Map to weekdays
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const mappedDays = daysOfWeek.map(d => ({ day: d, score: 0, count: 0 }));
          
          rawLogs.forEach(entry => {
            const date = new Date(entry.created_at || new Date());
            const dayName = daysOfWeek[date.getDay()];
            const score = MOOD_MAPPING[entry.mood?.toLowerCase()] || 3;
            
            const target = mappedDays.find(m => m.day === dayName);
            if (target) {
              target.score += score;
              target.count += 1;
            }
          });

          // Compute weekday averages or fill fallback if zero entries for a day
          const finalWeekData = mappedDays.map((d, index) => {
            if (d.count > 0) {
              return { day: d.day, score: Math.round((d.score / d.count) * 10) / 10 };
            }
            // Fallback default coordinates
            return { day: d.day, score: WEEK_MOOD_FALLBACK[index]?.score || 3 };
          });

          // Order week Mon-Sun
          const orderedWeek = [
            finalWeekData.find(d => d.day === 'Mon'),
            finalWeekData.find(d => d.day === 'Tue'),
            finalWeekData.find(d => d.day === 'Wed'),
            finalWeekData.find(d => d.day === 'Thu'),
            finalWeekData.find(d => d.day === 'Fri'),
            finalWeekData.find(d => d.day === 'Sat'),
            finalWeekData.find(d => d.day === 'Sun')
          ].filter(Boolean);

          setMoodData(orderedWeek);
        } else {
          // Monthly view
          setMoodData(MONTH_MOOD_FALLBACK);
        }

        // Calculate Average Mood Text
        const sum = rawLogs.reduce((acc, curr) => acc + (MOOD_MAPPING[curr.mood?.toLowerCase()] || 3), 0);
        const avg = Math.round((sum / rawLogs.length) * 10) / 10;
        
        let label = 'Calm';
        if (avg >= 4.5) label = 'Energetic';
        else if (avg >= 4.0) label = 'Productive';
        else if (avg >= 3.0) label = 'Calm';
        else if (avg >= 2.0) label = 'Tired';
        else label = 'Stressed';

        setAvgMoodText(`${label} (${avg})`);
      } else {
        setMoodData(timeRange === 'week' ? WEEK_MOOD_FALLBACK : MONTH_MOOD_FALLBACK);
        setAvgMoodText('Productive (4.1)');
      }
    };

    computeLogs();
  }, [timeRange, mounted, user]);

  if (!mounted) {
    return (
      <div className="py-20 text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs text-muted-foreground font-semibold">Preparing analytics dashboard...</p>
      </div>
    );
  }

  // Dynamic Chart Renderer
  const renderChart = (data: any[], dataKey: string, color: string, idGrad: string, yDomain?: [number, number]) => {
    const tooltipStyle = {
      background: 'var(--color-card)', 
      border: '1px solid var(--color-border)', 
      borderRadius: '12px',
      fontSize: '11px',
      fontFamily: 'inherit'
    };

    if (chartStyle === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={idGrad} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={yDomain} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#${idGrad})`} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartStyle === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={yDomain} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} barSize={25} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Default Line
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.2} />
          <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={yDomain} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dynamic Filters Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Interactive Insights</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Visualize your activity completion, emotional moods, and study blue-prints.
          </p>
        </div>

        {/* Range and Style controls */}
        <div className="flex flex-wrap gap-2.5">
          {/* Time range switcher */}
          <div className="flex bg-secondary/80 border border-border/60 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => setTimeRange('week')}
              className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Weekly</span>
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Monthly</span>
            </button>
          </div>

          {/* Chart format switcher */}
          <div className="flex bg-secondary/80 border border-border/60 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => setChartStyle('area')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                chartStyle === 'area' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartStyle('line')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                chartStyle === 'line' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartStyle('bar')}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                chartStyle === 'bar' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
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
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Mood Rating</span>
            <div className="text-xl font-extrabold tracking-tight text-foreground truncate max-w-[180px]">{avgMoodText}</div>
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
              Hours spent inside deep concentration blocks per day ({timeRange === 'week' ? '7 days' : '4 weeks'})
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {renderChart(activityData, 'hours', 'var(--color-primary)', 'colorHours')}
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
              Emotional logs ratings (1 = stressed/sad, 5 = energetic/happy)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {renderChart(moodData, 'score', 'var(--color-accent)', 'colorMood', [1, 5])}
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
