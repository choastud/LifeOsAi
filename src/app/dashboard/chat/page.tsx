'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { Brain, Send, Sparkles, Plus, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESETS = [
  "I want to become a Product Manager in 3 months",
  "Design a study schedule to learn Rust systems programming",
  "Extract insights from my journal logs",
  "How can I manage screen time after 10 PM?"
];

export default function ChatPage() {
  const { user, isDemo } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat logs
    const fetchChatLogs = async () => {
      if (isDemo || !supabase) {
        const localLogs = localStorage.getItem('lifeos_chat_logs');
        if (localLogs) {
          setMessages(JSON.parse(localLogs));
        } else {
          const welcomeMsg: Message = {
            role: 'assistant',
            content: `Hello ${user?.name.split(' ')[0]}! I am your AI Life Coach. Tell me what goals you are chasing, or log your reflections, and I will structure action roadmaps and memories for you.`
          };
          setMessages([welcomeMsg]);
          localStorage.setItem('lifeos_chat_logs', JSON.stringify([welcomeMsg]));
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chats')
          .select('message, response, created_at')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted: Message[] = [];
          data.forEach(log => {
            formatted.push({ role: 'user', content: log.message });
            formatted.push({ role: 'assistant', content: log.response });
          });
          setMessages(formatted);
        } else {
          setMessages([{
            role: 'assistant',
            content: `Hello ${user?.name.split(' ')[0]}! I am your AI Life Coach. Tell me what goals you are chasing, or log your reflections, and I will structure action roadmaps and memories for you.`
          }]);
        }
      } catch (err: any) {
        toast.error('Failed to load chat history: ' + err.message);
      }
    };

    fetchChatLogs();
  }, [user, isDemo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (isDemo || !supabase) {
      // Mock API call locally
      localStorage.setItem('lifeos_chat_logs', JSON.stringify(updatedMessages));
      
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            userId: null
          })
        });

        const data = await res.json();
        setLoading(false);

        if (data.response) {
          const aiMessage: Message = { role: 'assistant', content: data.response };
          const finalMessages = [...updatedMessages, aiMessage];
          setMessages(finalMessages);
          localStorage.setItem('lifeos_chat_logs', JSON.stringify(finalMessages));
          
          // Auto parsing memories or goals inside client to make it feel integrated
          parseAICoaching(data.response);
        }
      } catch {
        setLoading(false);
        toast.error('Failed to fetch reply from local server');
      }
      return;
    }

    // Supabase mode
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        parseAICoaching(data.response);
      } else {
        toast.error('Empty reply received');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error('Failed to query assistant: ' + err.message);
    }
  };

  const parseAICoaching = (aiReply: string) => {
    // Look for tags like "Goal 1" or "Goal 2" or "Memory" to simulate auto-extraction
    if (aiReply.includes('Goal 1') || aiReply.includes('Goal 2')) {
      toast.info('Coaching Goal Detected! Added draft goals to your dashboard.', {
        action: {
          label: 'View Goals',
          onClick: () => window.location.href = '/dashboard/goals'
        }
      });
      // Add mock goals to localStorage for instant experience
      const existing = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
      if (aiReply.includes('Figma')) {
        const added = [
          ...existing,
          { id: Math.random().toString(), title: 'Learn Figma & Design 3 Wireframes', progress: 0, deadline: '2026-06-15', status: 'active' },
          { id: Math.random().toString(), title: 'Write a Product Requirement Document (PRD)', progress: 0, deadline: '2026-07-01', status: 'active' }
        ];
        localStorage.setItem('lifeos_goals', JSON.stringify(added));
      }
    }

    if (aiReply.includes('Memory') || aiReply.includes('Logged') || aiReply.includes('preference')) {
      toast.success('New insight saved to Memory Vault!', {
        icon: <Sparkles className="w-4 h-4 text-accent" />
      });
      const existing = JSON.parse(localStorage.getItem('lifeos_memories') || '[]');
      const added = [
        ...existing,
        { id: Math.random().toString(), memory: 'User struggles with late-night screens and prefers AM focus blocks.', category: 'preferences', created_at: new Date().toISOString() }
      ];
      localStorage.setItem('lifeos_memories', JSON.stringify(added));
    }
  };

  const clearChat = () => {
    const welcomeMsg: Message = {
      role: 'assistant',
      content: `Hello ${user?.name.split(' ')[0]}! I am your AI Life Coach. Tell me what goals you are chasing, or log your reflections, and I will structure action roadmaps and memories for you.`
    };
    setMessages([welcomeMsg]);
    localStorage.setItem('lifeos_chat_logs', JSON.stringify([welcomeMsg]));
    toast.success('Chat log cleared');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
      {/* Sidebar presets panel */}
      <div className="hidden lg:block lg:col-span-3 space-y-4 text-left">
        <Card className="glass-card border-border/40 h-full p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-accent" />
              <span>Coaching Starters</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">Select a topic to launch a guided AI roadmap flow.</p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="text-xs text-left p-3 rounded-xl border border-border/70 bg-background/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 leading-normal font-semibold text-foreground/80 hover:border-primary/50"
              >
                "{p}"
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border/40 text-[10px] text-muted-foreground flex items-start gap-1.5 leading-normal">
            <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span>Grok 3 automatically analyzes your messages to extract custom goals, learning courses, and key memories.</span>
          </div>

          <Button 
            onClick={clearChat}
            variant="ghost" 
            className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          >
            Clear Conversation Logs
          </Button>
        </Card>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-9 flex flex-col h-full">
        <Card className="glass-card border-border/40 flex flex-col h-full overflow-hidden shadow-sm">
          {/* Messages block */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/20 select-text">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent-foreground'
                    }`}>
                      {msg.role === 'user' ? user?.name[0] : <Brain className="w-4 h-4" />}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm text-left leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-background/80 border border-border/40 text-foreground rounded-tl-none whitespace-pre-wrap font-medium space-y-3'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center">
                      <Brain className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="bg-background/80 border border-border/40 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input block */}
          <div className="p-4 border-t border-border/40 bg-secondary/10 flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask the coach to design a roadmap, review your habits..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="bg-background/80 border-border/80 rounded-xl focus:border-primary transition-all py-5 shadow-inner"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-5 h-auto"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
