'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { BookOpen, Sparkles, CheckCircle2, Circle, Plus, Trash2, Loader2, ArrowRight, Link as LinkIcon, BookOpenCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Topic {
  id: string;
  title: string;
  completed: boolean;
  week: number;
}

interface Resource {
  name: string;
  url: string;
}

interface LearningPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
  resources: Resource[];
  created_at: string;
}

export default function LearningPage() {
  const { user, isDemo } = useAuth();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);

  // Dialog States
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState<Topic[]>([]);
  const [generatedResources, setGeneratedResources] = useState<Resource[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [user, isDemo]);

  const fetchPlans = async () => {
    setLoading(true);
    if (isDemo || !supabase) {
      const local = localStorage.getItem('lifeos_learning');
      const parsed = local ? JSON.parse(local) : [];
      // Normalize schema details for demo mode
      const normalized = parsed.map((p: any) => ({
        ...p,
        description: p.description || 'Custom studies roadmap',
        topics: p.topics || [
          { id: 't1', title: 'Week 1: Fundamentals and setup', completed: p.progress > 20, week: 1 },
          { id: 't2', title: 'Week 2: Advanced structures and core tools', completed: p.progress > 45, week: 2 },
          { id: 't3', title: 'Week 3: Practical projects and APIs', completed: p.progress >= 75, week: 3 }
        ],
        resources: p.resources || [{ name: 'Official Guides & Docs', url: 'https://google.com' }]
      }));
      setPlans(normalized);
      if (normalized.length > 0) setActivePlan(normalized[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/learning?userId=${user?.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPlans(data);
      if (data.length > 0) setActivePlan(data[0]);
    } catch (err: any) {
      toast.error('Failed to load learning plans: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    if (!title.trim()) {
      toast.warning('Please enter a topic title first');
      return;
    }

    setGenLoading(true);
    // Simulate AI Curriculum outline generation
    setTimeout(() => {
      let topics: Topic[] = [];
      let resources: Resource[] = [];

      if (title.toLowerCase().includes('rust')) {
        topics = [
          { id: 'r1', title: 'Rustup, Cargo, & Basic Syntax', completed: false, week: 1 },
          { id: 'r2', title: 'Ownership & Borrowing Lifetimes', completed: false, week: 2 },
          { id: 'r3', title: 'Structs, Enums, & Pattern Matching', completed: false, week: 3 },
          { id: 'r4', title: 'Concurrencies & Multi-threading', completed: false, week: 4 }
        ];
        resources = [
          { name: 'The Rust Book (Official)', url: 'https://doc.rust-lang.org/book/' },
          { name: 'Rustlings exercises', url: 'https://github.com/rust-lang/rustlings' }
        ];
      } else if (title.toLowerCase().includes('product') || title.toLowerCase().includes('pm')) {
        topics = [
          { id: 'pm1', title: 'Market Research & User Interviews', completed: false, week: 1 },
          { id: 'pm2', title: 'Figma Wireframing & Prototyping', completed: false, week: 2 },
          { id: 'pm3', title: 'Writing Product Requirement Docs (PRDs)', completed: false, week: 3 },
          { id: 'pm4', title: 'Mock Interview Case Studies Prep', completed: false, week: 4 }
        ];
        resources = [
          { name: 'Cracking the PM Interview (Book)', url: 'https://google.com' },
          { name: 'Product School Resources', url: 'https://productschool.com' }
        ];
      } else {
        topics = [
          { id: 'g1', title: 'Module 1: Core Fundamentals & Setup', completed: false, week: 1 },
          { id: 'g2', title: 'Module 2: Practical Exercises & Mockups', completed: false, week: 2 },
          { id: 'g3', title: 'Module 3: Project Architecture & Connections', completed: false, week: 3 },
          { id: 'g4', title: 'Module 4: Final Testing & Optimization', completed: false, week: 4 }
        ];
        resources = [
          { name: 'MDN Web Docs / Guides', url: 'https://developer.mozilla.org' }
        ];
      }

      setGeneratedTopics(topics);
      setGeneratedResources(resources);
      setGenLoading(false);
      toast.success('Curriculum outline generated by AI!', {
        icon: <Sparkles className="w-4 h-4 text-accent" />
      });
    }, 1200);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setAddLoading(true);

    const finalTopics = generatedTopics.length > 0 ? generatedTopics : [
      { id: Math.random().toString(), title: 'Core basics overview', completed: false, week: 1 },
      { id: Math.random().toString(), title: 'First practical exercises', completed: false, week: 2 }
    ];

    const finalResources = generatedResources.length > 0 ? generatedResources : [
      { name: 'Core Documentation', url: 'https://google.com' }
    ];

    if (isDemo || !supabase) {
      const addedPlan: LearningPlan = {
        id: Math.random().toString(),
        title,
        description: description || 'Custom AI Study Path',
        progress: 0,
        topics: finalTopics,
        resources: finalResources,
        created_at: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('lifeos_learning') || '[]');
      const updated = [addedPlan, ...existing];
      localStorage.setItem('lifeos_learning', JSON.stringify(updated));
      setPlans(updated);
      setActivePlan(addedPlan);
      
      resetDialog();
      setAddLoading(false);
      setOpen(false);
      toast.success('Learning Plan created offline');
      return;
    }

    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          title,
          description: description || 'Custom AI Study Path',
          topics: finalTopics,
          resources: finalResources
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setPlans(prev => [data, ...prev]);
      setActivePlan(data);
      resetDialog();
      setOpen(false);
      toast.success('Learning Plan created successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const resetDialog = () => {
    setTitle('');
    setDescription('');
    setGeneratedTopics([]);
    setGeneratedResources([]);
  };

  const handleToggleTopic = async (planId: string, topicId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const updatedTopics = plan.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t);
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const nextProgress = Math.round((completedCount / updatedTopics.length) * 100);

    if (isDemo || !supabase) {
      const updatedPlans = plans.map(p => p.id === planId ? { ...p, topics: updatedTopics, progress: nextProgress } : p);
      setPlans(updatedPlans);
      localStorage.setItem('lifeos_learning', JSON.stringify(updatedPlans));
      const active = updatedPlans.find(p => p.id === planId);
      if (active) setActivePlan(active);
      return;
    }

    try {
      // Update topics in Supabase
      const { error } = await supabase!
        .from('learning_plans')
        .update({ topics: updatedTopics, progress: nextProgress })
        .eq('id', planId);

      if (error) throw error;
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, topics: updatedTopics, progress: nextProgress } : p));
      setActivePlan(prev => prev?.id === planId ? { ...prev, topics: updatedTopics, progress: nextProgress } : prev);
    } catch (err: any) {
      toast.error('Failed to update progress: ' + err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_learning') || '[]');
      const updated = existing.filter((p: any) => p.id !== id);
      localStorage.setItem('lifeos_learning', JSON.stringify(updated));
      setPlans(updated);
      if (activePlan?.id === id) setActivePlan(updated[0] || null);
      toast.success('Learning Plan deleted');
      return;
    }

    try {
      const { error } = await supabase!
        .from('learning_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      if (activePlan?.id === id) {
        setActivePlan(prev => {
          const rem = plans.filter(p => p.id !== id);
          return rem[0] || null;
        });
      }
      toast.success('Learning Plan deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left side: Curriculum list */}
      <div className="lg:col-span-4 space-y-4 text-left">
        <Card className="glass-card border-border/40 p-4 space-y-4 flex flex-col h-[calc(100vh-8.5rem)]">
          <div className="flex justify-between items-center border-b border-border/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Learning Plans</span>
              </h3>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl w-8 h-8 p-0 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              } />
              <DialogContent className="glass-card border-border/40 max-w-sm rounded-2xl">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                    <BookOpenCheck className="w-4.5 h-4.5 text-accent animate-pulse" />
                    <span>Create Learning Plan</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSavePlan} className="space-y-4 pt-2">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject / Title</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Systems Architecture"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background border-border/80 rounded-xl focus:border-primary text-xs h-10 flex-1"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRoadmap}
                        disabled={genLoading || !title}
                        className="bg-primary/10 border border-primary/20 hover:bg-primary/25 rounded-xl px-3 text-xs font-extrabold text-primary flex items-center justify-center gap-0.5 transition-all"
                      >
                        {genLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-accent" />}
                        <span className="hidden sm:inline">AI Outline</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                    <Input
                      placeholder="e.g. Master system designs concepts"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-background border-border/80 rounded-xl focus:border-primary text-xs h-10"
                    />
                  </div>

                  {generatedTopics.length > 0 && (
                    <div className="space-y-1.5 text-left bg-secondary/35 border border-border/30 rounded-xl p-3 max-h-36 overflow-y-auto">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">Generated Modules</span>
                      {generatedTopics.map((t, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-xs font-semibold text-foreground/80 py-1 last:border-0 border-b border-border/10">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <DialogFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={addLoading}
                      className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs w-full py-2.5 h-auto"
                    >
                      {addLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Learning Plan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="py-20 flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-[10px]">Loading curriculums...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
              <BookOpen className="w-8 h-8 text-border mb-2" />
              <span className="text-xs font-semibold">No curriculums generated yet</span>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
              <AnimatePresence>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActivePlan(p)}
                    className={`p-4 rounded-xl border transition-all text-left cursor-pointer group flex flex-col gap-3 ${
                      activePlan?.id === p.id
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                        : 'border-border/80 bg-background/50 hover:bg-secondary/40 text-muted-foreground'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-foreground leading-normal truncate">{p.title}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{p.description}</p>
                      </div>
                      
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          handleDeletePlan(p.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span>Modules Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>

      {/* Right side: Roadmap view & Resources checklist */}
      <div className="lg:col-span-8 space-y-6">
        {activePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activePlan.id}
            className="space-y-6"
          >
            {/* Roadmap Timeline */}
            <Card className="glass-card border-border/40 shadow-sm text-left">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  <span>AI Study Pathway: {activePlan.title}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Check off modules as you complete reading chapters or exercises.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Roadmap modules lists */}
                <div className="relative border-l-2 border-border/60 pl-6 ml-3 space-y-6">
                  {activePlan.topics.map((t, idx) => (
                    <div key={t.id} className="relative">
                      {/* Timeline dot */}
                      <div 
                        onClick={() => handleToggleTopic(activePlan.id, t.id)}
                        className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center cursor-pointer transition-all shadow-sm ${
                          t.completed 
                            ? 'border-accent bg-accent/15 text-accent' 
                            : 'border-border text-muted-foreground hover:border-primary'
                        }`}
                      >
                        {t.completed ? <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> : <Circle className="w-3.5 h-3.5" />}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-extrabold tracking-wide text-accent">Week {t.week || idx + 1}</span>
                        <h4 className={`text-xs font-bold ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {t.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resources list */}
            <Card className="glass-card border-border/40 shadow-sm text-left">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Recommended Resource References</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
                {activePlan.resources && activePlan.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-border/80 rounded-xl bg-background/50 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-between text-xs font-semibold group"
                  >
                    <span className="truncate pr-4 text-foreground/80 group-hover:text-primary transition-colors">{r.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border/60 rounded-3xl bg-secondary/5 flex flex-col justify-center items-center h-[280px]">
            <BookOpen className="w-8 h-8 text-muted-foreground animate-bounce mb-2" />
            <span className="text-xs text-muted-foreground font-semibold">Select a learning plan to display the timeline</span>
          </div>
        )}
      </div>
    </div>
  );
}
