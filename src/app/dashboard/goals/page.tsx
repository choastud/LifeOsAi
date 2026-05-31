'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { Target, CheckCircle2, Circle, Calendar, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  tasks: Task[];
}

export default function GoalsPage() {
  const { user, isDemo } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [user, isDemo]);

  const fetchGoals = async () => {
    setLoading(true);
    if (isDemo || !supabase) {
      const local = localStorage.getItem('lifeos_goals');
      const parsed = local ? JSON.parse(local) : [];
      // Ensure tasks key exists
      const normalized = parsed.map((g: any) => ({
        ...g,
        tasks: g.tasks || [
          { id: 't1', task: 'Draft project outline', completed: g.progress > 30 },
          { id: 't2', task: 'Research tools and libraries', completed: g.progress > 60 },
          { id: 't3', task: 'Build first mock dashboard', completed: g.progress >= 80 }
        ]
      }));
      setGoals(normalized);
      setLoading(false);
      return;
    }

    try {
      // In Supabase mode, fetch goals and tasks
      const { data: goalsData, error: gError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (gError) throw gError;

      const formattedGoals: Goal[] = [];

      for (const g of goalsData || []) {
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('goal_id', g.id);

        formattedGoals.push({
          id: g.id,
          title: g.title,
          description: g.description || '',
          deadline: g.deadline || '',
          progress: g.progress || 0,
          status: g.status,
          tasks: tasksData || []
        });
      }

      setGoals(formattedGoals);
    } catch (err: any) {
      toast.error('Failed to load goals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setAddLoading(true);

    const presetTasks = milestonesInput
      .split('\n')
      .filter(line => line.trim())
      .map((t, idx) => ({
        id: `t-${idx}-${Date.now()}`,
        task: t.trim(),
        completed: false
      }));

    if (presetTasks.length === 0) {
      presetTasks.push(
        { id: `t-0-${Date.now()}`, task: 'Define project scope', completed: false },
        { id: `t-1-${Date.now()}`, task: 'Review initial roadmaps', completed: false }
      );
    }

    if (isDemo || !supabase) {
      const addedGoal: Goal = {
        id: Math.random().toString(),
        title,
        description,
        deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0,
        status: 'active',
        tasks: presetTasks
      };
      
      const existing = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
      const updated = [addedGoal, ...existing];
      localStorage.setItem('lifeos_goals', JSON.stringify(updated));
      setGoals(updated);
      setAddLoading(false);
      setOpen(false);
      resetForm();
      toast.success('Goal created successfully');
      return;
    }

    try {
      // Create Goal in Supabase
      const { data: newGoal, error: gError } = await supabase
        .from('goals')
        .insert({
          user_id: user?.id,
          title,
          description,
          deadline: deadline || null,
          progress: 0,
          status: 'active'
        })
        .select()
        .single();

      if (gError) throw gError;

      // Create tasks
      const tasksToInsert = presetTasks.map(t => ({
        goal_id: newGoal.id,
        task: t.task,
        completed: false
      }));

      const { data: insertedTasks } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      const createdGoal: Goal = {
        id: newGoal.id,
        title: newGoal.title,
        description: newGoal.description || '',
        deadline: newGoal.deadline || '',
        progress: 0,
        status: 'active',
        tasks: insertedTasks || []
      };

      setGoals(prev => [createdGoal, ...prev]);
      setOpen(false);
      resetForm();
      toast.success('Goal and tasks added');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setMilestonesInput('');
  };

  const handleToggleTask = async (goalId: string, taskId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedTasks = goal.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const nextProgress = Math.round((completedCount / updatedTasks.length) * 100);
    const nextStatus: 'active' | 'completed' = nextProgress === 100 ? 'completed' : 'active';

    if (isDemo || !supabase) {
      const updatedGoals = goals.map(g => g.id === goalId ? { ...g, tasks: updatedTasks, progress: nextProgress, status: nextStatus } : g);
      setGoals(updatedGoals);
      localStorage.setItem('lifeos_goals', JSON.stringify(updatedGoals));
      return;
    }

    try {
      // Update Task completed state in DB
      const targetTask = goal.tasks.find(t => t.id === taskId);
      if (targetTask) {
        await supabase!
          .from('tasks')
          .update({ completed: !targetTask.completed })
          .eq('id', taskId);
      }

      // Update Goal progress & status in DB
      await supabase!
        .from('goals')
        .update({ progress: nextProgress, status: nextStatus })
        .eq('id', goalId);

      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tasks: updatedTasks, progress: nextProgress, status: nextStatus } : g));
    } catch (err: any) {
      toast.error('Failed to update task: ' + err.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
      const updated = existing.filter((g: any) => g.id !== id);
      localStorage.setItem('lifeos_goals', JSON.stringify(updated));
      setGoals(updated);
      toast.success('Goal deleted');
      return;
    }

    try {
      const { error } = await supabase!
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal forgotten');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getAISuggestions = () => {
    if (!title) {
      toast.warning('Please enter a goal title first to get AI ideas');
      return;
    }
    
    // Simulate AI suggestion for milestones based on title
    let ideas = '';
    if (title.toLowerCase().includes('rust') || title.toLowerCase().includes('code')) {
      ideas = "Install Rust & configure VSCode\nRead chapter 1-4 of the book\nComplete 10 rustlings exercises\nBuild a CLI Calculator";
    } else if (title.toLowerCase().includes('product') || title.toLowerCase().includes('pm')) {
      ideas = "Conduct 3 sample user interviews\nRead 'Cracking the PM Interview'\nDraft wireframes for a navigation app\nWrite a PRD mockup";
    } else if (title.toLowerCase().includes('mindfulness') || title.toLowerCase().includes('meditate')) {
      ideas = "Meditate for 5 minutes daily\nRead 1 book on breathing exercises\nSet screen time shutdown at 10 PM";
    } else {
      ideas = "Define project scope and deliverables\nResearch core tools and materials\nDraft the initial prototype\nComplete final testing & review";
    }

    setMilestonesInput(ideas);
    toast.success('AI Suggested Tasks generated!', {
      icon: <Sparkles className="w-4 h-4 text-accent" />
    });
  };

  const filteredGoals = goals.filter(g => activeTab === 'active' ? g.status !== 'completed' : g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header / Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <p className="text-sm text-muted-foreground font-medium">
            Create high-level ambitions, set deadlines, and track milestones.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl h-auto py-2.5 text-xs shadow-md flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Define New Goal</span>
            </Button>
          } />
          <DialogContent className="glass-card border-border/40 max-w-sm rounded-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Target className="w-4 h-4 text-accent animate-pulse" />
                <span>Define New Priority Goal</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal Title</label>
                <Input
                  placeholder="e.g. Master Rust Concurrency"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-border/80 rounded-xl focus:border-primary text-xs h-10"
                  required
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <Input
                  placeholder="e.g. Build multi-threaded networking servers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border-border/80 rounded-xl focus:border-primary text-xs h-10"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline Date</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-background border-border/80 rounded-xl focus:border-primary text-xs h-10"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Milestones (One per line)</label>
                  <button
                    type="button"
                    onClick={getAISuggestions}
                    className="text-[10px] text-primary hover:text-accent font-extrabold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span>AI Suggest</span>
                  </button>
                </div>
                <textarea
                  placeholder="Review initial roadmaps&#10;Write first line of code"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary p-3 text-xs h-24 focus:outline-none transition-all resize-none"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={addLoading || !title.trim()} 
                  className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs w-full py-2.5 h-auto"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Goal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`text-xs font-bold pb-2 px-1 border-b-2 transition-all capitalize ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Goals
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`text-xs font-bold pb-2 px-1 border-b-2 transition-all capitalize ${
            activeTab === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed Goals
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Synchronizing goals...</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5 space-y-3">
          <Target className="w-10 h-10 text-muted-foreground mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-sm">No goals in this tab</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Define your first long-term target and let AI coaching build your milestones!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredGoals.map((g) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card border-border/40 p-6 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:border-primary/40 transition-all text-left"
              >
                <div className="space-y-4">
                  {/* Goal header info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className="text-base font-extrabold text-foreground leading-snug truncate">{g.title}</h3>
                      {g.description && <p className="text-xs text-muted-foreground font-medium leading-relaxed">{g.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground mt-0.5 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground">Milestones Progress</span>
                      <span className="text-primary">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>

                  <hr className="border-border/30" />

                  {/* Milestones checklist */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Milestones Checklist</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {g.tasks.map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => handleToggleTask(g.id, t.id)}
                          className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border/20 cursor-pointer select-none"
                        >
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span className={`text-xs font-semibold leading-relaxed ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {t.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="text-[10px] text-muted-foreground pt-4 border-t border-border/20 mt-5 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Due {g.deadline ? new Date(g.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
                  </span>
                  <span className={`capitalize px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    g.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {g.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
