'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, Pin, Trash2, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Memory {
  id: string;
  memory: string;
  category: string;
  pinned: boolean;
  created_at: string;
}

const CATEGORIES = ['all', 'general', 'career', 'preferences', 'interests', 'goals', 'learning'];

export default function MemoriesPage() {
  const { user, isDemo } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Create Dialog states
  const [open, setOpen] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [user, isDemo]);

  const fetchMemories = async () => {
    setLoading(true);
    if (isDemo || !supabase) {
      const local = localStorage.getItem('lifeos_memories');
      setMemories(local ? JSON.parse(local) : []);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/memories?userId=${user?.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMemories(data);
    } catch (err: any) {
      toast.error('Failed to load memories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    setAddLoading(true);
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_memories') || '[]');
      const addedItem: Memory = {
        id: Math.random().toString(),
        memory: newMemory,
        category: newCategory,
        pinned: false,
        created_at: new Date().toISOString()
      };
      const updated = [addedItem, ...existing];
      localStorage.setItem('lifeos_memories', JSON.stringify(updated));
      setMemories(updated);
      setAddLoading(false);
      setOpen(false);
      setNewMemory('');
      toast.success('Memory created offline');
      return;
    }

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          memory: newMemory,
          category: newCategory
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setMemories(prev => [data, ...prev]);
      setOpen(false);
      setNewMemory('');
      toast.success('Memory node logged to vault');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_memories') || '[]');
      const updated = existing.filter((m: any) => m.id !== id);
      localStorage.setItem('lifeos_memories', JSON.stringify(updated));
      setMemories(updated);
      toast.success('Memory deleted locally');
      return;
    }

    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMemories(prev => prev.filter(m => m.id !== id));
      toast.success('Memory node forgotten');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTogglePin = async (memory: Memory) => {
    const nextPinnedState = !memory.pinned;
    
    if (isDemo || !supabase) {
      const existing = JSON.parse(localStorage.getItem('lifeos_memories') || '[]');
      const updated = existing.map((m: any) => m.id === memory.id ? { ...m, pinned: nextPinnedState } : m);
      // Sort pinned to top
      updated.sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      localStorage.setItem('lifeos_memories', JSON.stringify(updated));
      setMemories(updated);
      return;
    }

    try {
      // Direct updates can be handled via query updates
      const { error } = await supabase!
        .from('memories')
        .update({ pinned: nextPinnedState })
        .eq('id', memory.id);

      if (error) throw error;
      setMemories(prev => prev.map(m => m.id === memory.id ? { ...m, pinned: nextPinnedState } : m)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      );
      toast.success(nextPinnedState ? 'Memory pinned to top' : 'Memory unpinned');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter memories
  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.memory.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <p className="text-sm text-muted-foreground font-medium">
            AI-extracted facts and preferences that shape your life coach's context.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl h-auto py-2.5 text-xs shadow-md flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Log Memory Node</span>
            </Button>
          } />
          <DialogContent className="glass-card border-border/40 max-w-sm rounded-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                <span>Log New Memory Node</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMemory} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insight / Statement</label>
                <textarea
                  placeholder="e.g. User works best in deep focus blocks from 9 AM to 11:30 AM."
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary p-3 text-xs h-24 focus:outline-none transition-all resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                <Select value={newCategory} onValueChange={(val) => setNewCategory(val || 'general')}>
                  <SelectTrigger className="w-full bg-background border-border/80 rounded-xl text-xs h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border/40 rounded-xl">
                    <SelectItem value="general" className="text-xs">General</SelectItem>
                    <SelectItem value="career" className="text-xs">Career</SelectItem>
                    <SelectItem value="preferences" className="text-xs">Preferences</SelectItem>
                    <SelectItem value="interests" className="text-xs">Interests</SelectItem>
                    <SelectItem value="goals" className="text-xs">Goals</SelectItem>
                    <SelectItem value="learning" className="text-xs">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={addLoading || !newMemory.trim()} 
                  className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs w-full py-2.5 h-auto"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log Node'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50 border-border/80 rounded-xl focus:border-primary py-5 shadow-sm text-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all shrink-0 capitalize ${
                activeCategory === c
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-secondary border-border/80 text-muted-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid Layout */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Reading memory vault...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5 space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-sm">Vault is Empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              When you talk to the AI Coach or journal, it automatically extracts preferences and stores them here!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredMemories.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`glass-card border-border/40 p-5 rounded-2xl text-left flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/45 transition-colors ${
                  m.pinned ? 'ring-1 ring-accent/30 bg-accent/5' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded">
                      {m.category}
                    </span>
                    
                    <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleTogglePin(m)}
                        className={`p-1 rounded-md hover:bg-secondary hover:text-accent transition-colors ${m.pinned ? 'text-accent opacity-100' : 'text-muted-foreground'}`}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMemory(m.id)}
                        className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-foreground font-semibold">“{m.memory}”</p>
                </div>
                
                <div className="text-[9px] text-muted-foreground pt-4 border-t border-border/20 mt-4 flex items-center justify-between font-medium">
                  <span>Learned {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {m.pinned && <span className="text-accent flex items-center gap-0.5"><Pin className="w-2.5 h-2.5 fill-current" /> Pinned</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
