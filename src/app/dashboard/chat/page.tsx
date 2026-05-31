'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Plus, 
  Loader2, 
  Info, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
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

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Voice Bot states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition & Preload voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please click the lock icon in your browser address bar and allow microphone permissions.');
          } else if (event.error === 'network') {
            toast.warning('Voice recognition network timeout. Please verify your internet connection, or type your message directly.');
          } else if (event.error === 'no-speech') {
            // Silently handle if user just pauses and doesn't speak immediately
            console.log('Voice session ended: No speech detected.');
          } else {
            toast.error('Voice input error: ' + event.error);
          }
        };
        setRecognition(rec);
      }

      // Preload SpeechSynthesis voices to fix Chrome/Safari lag
      if (window.speechSynthesis) {
        const loadVoices = () => {
          window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }, []);

  // Speak Text aloud using SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // cancel any active speech
      
      // Clean up string thoroughly for natural dialogue and remove annoying characters
      let cleaned = text
        .replace(/[#*`_\[\]]/g, '')       // strip markdown symbols
        .replace(/-\s+/g, ' ')            // remove list bullet dashes
        .replace(/\d+\.\s+/g, ' ')        // remove numbers like "1. ", "2. "
        .replace(/([A-Z]{2,})/g, ' ')     // replace multiple upper case tags
        .replace(/:\s+/g, ', ')           // turn colons into natural comma pauses
        .replace(/\n+/g, ' ')             // strip newline returns
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      
      // Select best voice profile
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = 
        voices.find(v => v.name.includes('Google US English') || v.name.includes('Google UK English Female')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.includes('Zira') || v.name.includes('David')) ||
        voices.find(v => v.lang.startsWith('en')) || 
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.0; 
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle speech output
  const toggleVoiceFeedback = () => {
    if (voiceEnabled) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setVoiceEnabled(false);
      setIsSpeaking(false);
      toast.info('Voice feedback disabled');
    } else {
      setVoiceEnabled(true);
      toast.success('Voice feedback enabled! AI will read aloud replies.');
      speakText("Voice feedback enabled.");
    }
  };

  // Handle Speech Recognition microphone click
  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      // Cancel speech synthesis if active before starting to listen
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        handleSend(text);
      };
      recognition.start();
    }
  };

  // Load chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (isDemo || !supabase) {
        const local = localStorage.getItem('lifeos_chat_sessions');
        if (local) {
          const parsed = JSON.parse(local);
          setSessions(parsed);
          if (parsed.length > 0) {
            setActiveSessionId(parsed[0].id);
          }
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
        if (data && data.length > 0) {
          setActiveSessionId(data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load chat sessions:', err.message);
      }
    };

    fetchSessions();
  }, [isDemo, user]);

  // Load messages for active session
  useEffect(() => {
    if (!activeSessionId) {
      const welcome: Message = {
        role: 'assistant',
        content: `Hello ${user?.name?.split(' ')[0] || 'User'}! I am your AI Life Coach. Tell me what goals you are chasing, or log your reflections, and I will structure action roadmaps and memories for you.`
      };
      setMessages([welcome]);
      return;
    }

    const fetchSessionMessages = async () => {
      setLoading(true);
      if (isDemo || !supabase) {
        const localLogs = localStorage.getItem(`lifeos_chat_logs_${activeSessionId}`);
        if (localLogs) {
          setMessages(JSON.parse(localLogs));
        } else {
          setMessages([]);
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chats')
          .select('message, response, created_at')
          .eq('session_id', activeSessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted: Message[] = [];
        if (data && data.length > 0) {
          data.forEach(log => {
            formatted.push({ role: 'user', content: log.message });
            formatted.push({ role: 'assistant', content: log.response });
          });
        }
        setMessages(formatted);
      } catch (err: any) {
        toast.error('Failed to load messages: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionMessages();
  }, [activeSessionId, isDemo, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send Message
  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    let currentSessionId = activeSessionId;

    // 1. Automatically create a session if none is active
    if (!currentSessionId) {
      const title = text.length > 25 ? text.slice(0, 25) + '...' : text;
      const uuid = 'local_' + Math.random().toString(36).substring(2, 9);
      
      if (isDemo || !supabase) {
        const newSess: ChatSession = {
          id: uuid,
          title,
          created_at: new Date().toISOString()
        };
        const updated = [newSess, ...sessions];
        localStorage.setItem('lifeos_chat_sessions', JSON.stringify(updated));
        setSessions(updated);
        currentSessionId = uuid;
        setActiveSessionId(uuid);
      } else {
        try {
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ user_id: user?.id, title })
            .select()
            .single();

          if (error) throw error;
          setSessions(prev => [data, ...prev]);
          currentSessionId = data.id;
          setActiveSessionId(data.id);
        } catch (err: any) {
          toast.error('Failed to start chat session: ' + err.message);
          return;
        }
      }
    }

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages.filter(m => m.content), userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Save user message immediately in local mode
    if (isDemo || !supabase) {
      localStorage.setItem(`lifeos_chat_logs_${currentSessionId}`, JSON.stringify(updatedMessages));
      
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            userId: null,
            sessionId: null
          })
        });

        const data = await res.json();
        setLoading(false);

        if (data.response) {
          const aiMessage: Message = { role: 'assistant', content: data.response };
          const finalMessages = [...updatedMessages, aiMessage];
          setMessages(finalMessages);
          localStorage.setItem(`lifeos_chat_logs_${currentSessionId}`, JSON.stringify(finalMessages));
          
          if (voiceEnabled) {
            speakText(data.response);
          }
          parseAICoaching(data.response);
        }
      } catch {
        setLoading(false);
        toast.error('Failed to get response.');
      }
      return;
    }

    // Live Supabase mode
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
          sessionId: currentSessionId
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (voiceEnabled) {
          speakText(data.response);
        }
        parseAICoaching(data.response);
      } else {
        toast.error('Empty response');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error('Error connecting to coach: ' + err.message);
    }
  };

  // Helper coaching tag parsing
  const parseAICoaching = (aiReply: string) => {
    if (aiReply.includes('Goal 1') || aiReply.includes('Goal 2')) {
      toast.info('Coaching Goal Detected! Added draft goals to your dashboard.', {
        action: {
          label: 'View Goals',
          onClick: () => window.location.href = '/dashboard/goals'
        }
      });
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

  // Start new empty session
  const startNewChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSessionId(null);
    setMessages([]);
  };

  // Rename Session
  const renameSession = async (id: string, title: string) => {
    if (!title.trim()) return;

    if (isDemo || !supabase) {
      const updated = sessions.map(s => s.id === id ? { ...s, title } : s);
      localStorage.setItem('lifeos_chat_sessions', JSON.stringify(updated));
      setSessions(updated);
    } else {
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .update({ title })
          .eq('id', id);

        if (error) throw error;
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
      } catch (err: any) {
        toast.error('Failed to rename session: ' + err.message);
      }
    }
    setEditingSessionId(null);
  };

  // Delete Session
  const deleteSession = async (id: string) => {
    if (isDemo || !supabase) {
      const updated = sessions.filter(s => s.id !== id);
      localStorage.setItem('lifeos_chat_sessions', JSON.stringify(updated));
      localStorage.removeItem(`lifeos_chat_logs_${id}`);
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null);
      }
      toast.success('Conversation thread deleted');
    } else {
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        if (activeSessionId === id) {
          setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        }
        toast.success('Conversation thread deleted');
      } catch (err: any) {
        toast.error('Failed to delete conversation: ' + err.message);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
      {/* Sidebar Chat Sessions List */}
      <div className="hidden lg:block lg:col-span-3 h-full">
        <Card className="glass-card border-border/40 h-full p-4 flex flex-col justify-between">
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            {/* New Chat Trigger */}
            <Button
              onClick={startNewChat}
              variant="outline"
              className="w-full justify-start gap-2 border-dashed border-primary/40 hover:border-primary rounded-xl py-5 font-semibold text-xs transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-accent" />
              <span>New Conversation</span>
            </Button>

            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous Chats</h3>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 select-none">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground font-medium">No previous logs found.</p>
                </div>
              ) : (
                sessions.map(s => {
                  const isActive = activeSessionId === s.id;
                  const isEditing = editingSessionId === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'border-primary/50 bg-primary/5 text-primary shadow-sm'
                          : 'border-transparent bg-background/30 text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (!isEditing) setActiveSessionId(s.id);
                        }}
                        className="flex items-center gap-2 text-xs font-semibold text-left truncate flex-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-accent/70" />
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') renameSession(s.id, editingTitle);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            className="bg-transparent border-none outline-none font-bold text-foreground w-full p-0 h-4"
                          />
                        ) : (
                          <span className="truncate">{s.title}</span>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <button onClick={() => renameSession(s.id, editingTitle)} className="p-0.5 hover:bg-primary/20 rounded">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </button>
                            <button onClick={() => setEditingSessionId(null)} className="p-0.5 hover:bg-primary/20 rounded">
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingSessionId(s.id);
                                setEditingTitle(s.title);
                              }}
                              className="p-1 hover:bg-secondary rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteSession(s.id)} className="p-1 hover:bg-secondary rounded hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Voice Controls Panel at bottom */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Voice Assistant</span>
              <Button
                onClick={toggleVoiceFeedback}
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-lg transition-all ${voiceEnabled ? 'text-accent bg-accent/10 scale-105' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground leading-normal flex items-start gap-1">
              <Info className="w-3 h-3 text-accent shrink-0 mt-0.5" />
              <span>SpeechSynthesis speaks responses when enabled.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-9 flex flex-col h-full">
        <Card className="glass-card border-border/40 flex flex-col h-full overflow-hidden shadow-sm">
          {/* Glowing Status Header & AI Orb */}
          <div className="px-5 py-3 border-b border-border/40 bg-secondary/15 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              {/* Pulse Glowing AI Orb */}
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* Glow backdrop layer */}
                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.45, 1] : isSpeaking ? [1, 1.3, 1] : loading ? [1, 1.2, 1] : [1, 1.1, 1],
                    opacity: isListening || isSpeaking || loading ? [0.4, 0.85, 0.4] : [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: isListening ? 1.0 : isSpeaking ? 1.5 : loading ? 2.0 : 3.0,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute inset-0 rounded-full blur-md ${
                    isListening 
                      ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                      : isSpeaking 
                        ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                        : loading 
                          ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' 
                          : 'bg-accent/80'
                  }`}
                />
                
                {/* Visual Glass Orb Core */}
                <motion.div
                  animate={isListening || isSpeaking || loading ? {
                    scale: [0.95, 1.05, 0.95],
                    rotate: 360
                  } : {}}
                  transition={{ 
                    scale: { duration: 2, repeat: Infinity }, 
                    rotate: { duration: 15, repeat: Infinity, ease: 'linear' } 
                  }}
                  className={`w-5 h-5 rounded-full border shadow-md relative z-10 flex items-center justify-center backdrop-blur-xl ${
                    isListening 
                      ? 'bg-gradient-to-tr from-rose-400 via-rose-500 to-rose-600 border-rose-300' 
                      : isSpeaking 
                        ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 border-amber-300' 
                        : loading 
                          ? 'bg-gradient-to-tr from-indigo-400 via-indigo-500 to-indigo-600 border-indigo-300' 
                          : 'bg-gradient-to-tr from-accent via-accent/80 to-primary/80 border-primary/20'
                  }`}
                />
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <span>AI Life Coach</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  {isListening 
                    ? 'Listening carefully...' 
                    : isSpeaking 
                      ? 'Speaking aloud...' 
                      : loading 
                        ? 'Formulating roadmap...' 
                        : 'Ready to converse'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleVoiceFeedback}
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-lg transition-colors ${voiceEnabled ? 'text-accent bg-accent/10' : 'text-muted-foreground'}`}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Messages block / Empty Chat Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/20 select-text">
            {messages.length <= 1 && !activeSessionId ? (
              // ChatGPT-style empty landing layout
              <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-8 select-none">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner animate-float">
                    <Brain className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    How can I help you today, {user?.name?.split(' ')[0]}?
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Ask me to generate a personalized career plan, review journal themes, or establish routine checklists.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      disabled={loading}
                      className="text-xs text-left p-4 rounded-2xl border border-border/80 bg-background/85 hover:bg-primary/5 hover:text-primary transition-all duration-300 leading-normal font-semibold text-foreground/80 hover:border-primary/50 shadow-sm hover:scale-[1.02] hover:shadow-md"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
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
                      
                      <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm text-left leading-relaxed transition-all duration-300 hover:shadow-md ${
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
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input block */}
          <div className="p-4 border-t border-border/40 bg-secondary/10 flex flex-col gap-2">
            {/* Listening Wave feedback */}
            {isListening && (
              <div className="flex items-center gap-1.5 px-3 py-1">
                <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.0 }} className="w-1.5 bg-rose-500 rounded-full" />
                <motion.div animate={{ height: [10, 24, 10] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-1.5 bg-rose-500 rounded-full" />
                <motion.div animate={{ height: [6, 14, 6] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-1.5 bg-rose-500 rounded-full" />
                <motion.div animate={{ height: [9, 19, 9] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.45 }} className="w-1.5 bg-rose-500 rounded-full" />
                <span className="text-[10px] font-extrabold text-rose-500 animate-pulse ml-1.5 uppercase tracking-wider">Listening to speech...</span>
              </div>
            )}

            {/* Speaking Wave feedback */}
            {isSpeaking && (
              <div className="flex items-center gap-1.5 px-3 py-1">
                <motion.div animate={{ scaleY: [1, 2, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.0 }} className="w-1 h-3.5 bg-amber-500 rounded-full origin-center" />
                <motion.div animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="w-1 h-3.5 bg-amber-500 rounded-full origin-center" />
                <motion.div animate={{ scaleY: [1, 1.8, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} className="w-1 h-3.5 bg-amber-500 rounded-full origin-center" />
                <span className="text-[10px] font-extrabold text-amber-500 animate-pulse ml-1.5 uppercase tracking-wider">AI is speaking...</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              {/* Mic STT Activation */}
              <Button
                type="button"
                onClick={toggleListening}
                variant="outline"
                className={`rounded-xl px-4 py-5 h-auto transition-all duration-300 ${isListening ? 'border-rose-500 bg-rose-500/10 text-rose-500 scale-105 shadow-sm' : 'border-border/80 hover:bg-secondary'}`}
              >
                {isListening ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4" />}
              </Button>

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
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-5 h-auto transition-all duration-300 hover:scale-[1.02]"
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
