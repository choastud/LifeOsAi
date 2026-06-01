'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { HeartPulse, Sparkles, Smile, Trash2, Calendar, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  ai_insights: string;
  created_at: string;
}

const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'productive', label: 'Productive', emoji: '⚡' },
  { value: 'calm', label: 'Calm', emoji: '🧘' },
  { value: 'tired', label: 'Tired', emoji: '🥱' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'stressed', label: 'Stressed', emoji: '🤯' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'energetic', label: 'Energetic', emoji: '🚀' }
];

export default function JournalPage() {
  const { user, isDemo } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('calm');
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [user, isDemo]);

  const fetchEntries = async () => {
    setLoading(true);
    if (isDemo || !supabase) {
      const local = localStorage.getItem('lifeos_journal');
      const parsed = local ? JSON.parse(local) : [];
      setEntries(parsed);
      if (parsed.length > 0) setActiveEntry(parsed[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/journal?userId=${user?.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEntries(data);
      if (data.length > 0) setActiveEntry(data[0]);
    } catch (err: any) {
      toast.error('Failed to load journals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedMood) return;

    setAddLoading(true);

    if (isDemo || !supabase) {
      // Simulate AI insights offline
      const ai_insights = mockInsights(content, selectedMood);
      const addedEntry: JournalEntry = {
        id: Math.random().toString(),
        content,
        mood: selectedMood,
        ai_insights,
        created_at: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('lifeos_journal') || '[]');
      const updated = [addedEntry, ...existing];
      localStorage.setItem('lifeos_journal', JSON.stringify(updated));
      setEntries(updated);
      setActiveEntry(addedEntry);
      
      setContent('');
      setAddLoading(false);
      toast.success('Reflection logged offline');
      return;
    }

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          content,
          mood: selectedMood
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setEntries(prev => [data, ...prev]);
      setActiveEntry(data);
      setContent('');
      toast.success('Daily reflection saved');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_journal') || '[]');
      const updated = existing.filter((e: any) => e.id !== id);
      localStorage.setItem('lifeos_journal', JSON.stringify(updated));
      setEntries(updated);
      if (activeEntry?.id === id) setActiveEntry(updated[0] || null);
      toast.success('Log deleted');
      return;
    }

    try {
      const { error } = await supabase!
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
      if (activeEntry?.id === id) {
        setActiveEntry(prev => {
          const rem = entries.filter(e => e.id !== id);
          return rem[0] || null;
        });
      }
      toast.success('Reflection log forgotten');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const mockInsights = (text: string, mood: string) => {
    const textLower = text.toLowerCase();
    if (mood === 'stressed' || textLower.includes('stress')) {
      return 'Stressed state logged. Your work-load is high today. We suggest turning off notifications after 7 PM and writing down a 3-item simplified checklist.';
    }
    if (mood === 'tired' || textLower.includes('sleep')) {
      return 'Sleep deficit detected. I have updated your daily coach instructions. Try avoiding screens for 1 hour before sleeping.';
    }
    return 'Productive and positive. Capitalize on this mental state to review your long-term goals and PM roadmap today.';
  };

  const getMoodBadge = (mood: string) => {
    const found = MOODS.find(m => m.value === mood);
    return found ? `${found.emoji} ${found.label}` : mood;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left side: Editor & AI Insights */}
      <div className="lg:col-span-8 space-y-6">
        {/* Editor Form */}
        <Card className="glass-card border-border/40 shadow-sm">
          <CardHeader className="text-left">
            <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Log Daily Reflection</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Write your thoughts and receive instant coaching insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Journal Content</label>
                <textarea
                  placeholder="How was your day? What did you focus on, and how did it go?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary p-4 text-xs h-36 focus:outline-none transition-all resize-none font-semibold text-foreground/90 leading-relaxed shadow-inner"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={addLoading || !content.trim()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs py-2.5 h-auto w-full sm:w-auto shadow-md"
              >
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log Reflection'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Insight Box for the active entry */}
        {activeEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeEntry.id}
          >
            <Card className="glass-card border-border/40 overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-primary/5 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between pb-3 text-left">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                    <span>AI Reflection Analysis & Advice</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                    Coaching feedback for log on {new Date(activeEntry.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>

              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-foreground text-left font-medium">
                {activeEntry.ai_insights || 'AI is calculating reflections... Ask the coach to generate advice.'}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Right side: Past Reflections Timeline */}
      <div className="lg:col-span-4 h-[calc(100vh-8.5rem)] overflow-y-auto pr-1">
        <Card className="glass-card border-border/40 h-full p-4 flex flex-col">
          <div className="space-y-1 text-left pb-3 border-b border-border/30 mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Past Reflections</span>
            </h3>
            <p className="text-[10px] text-muted-foreground">Select logs to review coaching insights.</p>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-[10px] text-muted-foreground">Reading journal entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Info className="w-8 h-8 text-border mb-2" />
              <span className="text-xs font-semibold">No entries logged yet</span>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
              <AnimatePresence>
                {entries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => setActiveEntry(e)}
                    className={`p-3 rounded-xl border transition-all text-left cursor-pointer group flex flex-col justify-between gap-2.5 ${
                      activeEntry?.id === e.id
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                        : 'border-border/80 bg-background/50 hover:bg-secondary/40 text-muted-foreground'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>{new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <button
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleDeleteEntry(e.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive p-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2 font-semibold text-foreground/80">“{e.content}”</p>
                    </div>


                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
