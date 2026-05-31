'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Send, Brain, Target, Calendar, Award, CheckCircle2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  {
    prompt: "I want to become a Product Manager",
    response: [
      { type: "text", content: "That's an excellent goal! Let's build a premium career roadmap to get you there." },
      { type: "title", content: "📍 PM CAREER ROADMAP" },
      { type: "milestone", title: "Phase 1: Build Core Skills (Weeks 1-4)", desc: "Master product discovery, user research, wireframing, and SQL basics." },
      { type: "milestone", title: "Phase 2: Lead a Side Project (Weeks 5-8)", desc: "Build a web app using Next.js/React. Act as both PM & developer." },
      { type: "milestone", title: "Phase 3: Craft Your Portfolio (Weeks 9-12)", desc: "Write product requirement docs (PRDs), case studies, and prepare for interviews." },
      { type: "title", content: "🎓 RECOMMENDED COURSES" },
      { type: "bullet", content: "• 'Product Management First Steps' (LinkedIn)" },
      { type: "bullet", content: "• 'Product Management Fundamentals' (Coursera)" },
      { type: "title", content: "💡 WEEKLY ACTION ITEMS" },
      { type: "bullet", content: "✔ Conduct 3 user interviews for a sample product idea." },
      { type: "bullet", content: "✔ Draft your first mockup in Figma." }
    ]
  },
  {
    prompt: "Design a study schedule to learn Rust",
    response: [
      { type: "text", content: "Rust is highly powerful. Here is your fast-track study plan:" },
      { type: "title", content: "🦀 RUST STUDY PATHWAY" },
      { type: "milestone", title: "Week 1: Syntax & Tooling", desc: "Install rustup, learn cargo, and master variables, functions, and control flow." },
      { type: "milestone", title: "Week 2: Ownership & Borrowing", desc: "Grasp Rust's core safety features: ownership rules, references, and lifetimes." },
      { type: "milestone", title: "Week 3: Structs & Enums", desc: "Build custom types and use pattern matching to handle complex control flow." },
      { type: "milestone", title: "Week 4: First CLI App", desc: "Build a terminal-based task manager utilizing file I/O and JSON storage." },
      { type: "title", content: "📚 RESOURCES" },
      { type: "bullet", content: "• Read 'The Rust Programming Language' (Book)" },
      { type: "bullet", content: "• Practice with 'Rustlings' exercises" }
    ]
  },
  {
    prompt: "Give me a daily morning mindfulness routine",
    response: [
      { type: "text", content: "Perfect choice for starting your day centered and energized:" },
      { type: "title", content: "🧘 DAILY MORNING FLOW" },
      { type: "milestone", title: "07:00 AM — Gentle Awakening (10m)", desc: "No phone. Stretch in bed, hydrate with a glass of water, and open the blinds." },
      { type: "milestone", title: "07:15 AM — Breathwork (15m)", desc: "Perform 10 minutes of Box Breathing, followed by 5 minutes of gratitude scripting." },
      { type: "milestone", title: "07:30 AM — Intentional Movement (15m)", desc: "Do a light yoga flow or a brisk outdoor walk to stimulate blood circulation." },
      { type: "title", content: "💡 COACHING TIP" },
      { type: "bullet", content: "• Treat this time as non-negotiable. Protect it from social media apps." }
    ]
  }
];

export default function LandingDemo() {
  const { startDemoMode } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text?: string; blocks?: any[] }>>([
    {
      sender: 'ai',
      text: "Hello! I am your LifeOS AI companion. Click a preset below or type a goal to see how I can generate plans, extract memories, and track progress for you."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      // Find matches in presets or defaults
      const preset = PRESETS.find(p => p.prompt.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(p.prompt.toLowerCase())) 
        || PRESETS[0]; // fallback to PM if no match

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          blocks: preset.response
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">Interactive Demo</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">See how Grok remembers and plans</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Try a query yourself to see how our AI creates custom roadmaps, tasks, and memory tags.
          </p>
        </div>

        {/* Demo Chat Console */}
        <Card className="glass-card border-border/40 overflow-hidden shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
          {/* Header */}
          <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            <div className="text-xs font-semibold tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-accent" />
              <span>LIFEOS_ASSISTANT_V1</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Messages area */}
          <CardContent className="h-[400px] overflow-y-auto p-6 space-y-4 bg-background/20 select-text">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent-foreground'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-background/80 border border-border/40 text-foreground rounded-tl-none space-y-3'
                    }`}>
                      {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                      
                      {msg.blocks && msg.blocks.map((block, idx) => {
                        if (block.type === 'text') {
                          return <p key={idx} className="leading-relaxed">{block.content}</p>;
                        }
                        if (block.type === 'title') {
                          return <h4 key={idx} className="font-bold text-accent pt-2 tracking-wide text-xs">{block.content}</h4>;
                        }
                        if (block.type === 'milestone') {
                          return (
                            <div key={idx} className="flex gap-2.5 p-3 rounded-lg bg-secondary/40 border border-border/30">
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-foreground text-xs block">{block.title}</span>
                                <span className="text-[11px] text-muted-foreground block font-medium leading-normal">{block.desc}</span>
                              </div>
                            </div>
                          );
                        }
                        if (block.type === 'bullet') {
                          return <p key={idx} className="pl-2 font-medium text-muted-foreground text-xs">{block.content}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2.5">
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
          </CardContent>

          {/* Footer & input area */}
          <div className="p-4 border-t border-border/40 bg-secondary/10 flex flex-col gap-3">
            {/* Presets chips */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  disabled={isTyping}
                  className="text-xs font-semibold bg-background hover:bg-primary hover:text-primary-foreground border border-border/80 px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm shrink-0"
                >
                  "{p.prompt}"
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type a goal or interest..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="bg-background/80 border-border/80 rounded-xl focus:border-primary transition-all py-5 shadow-inner"
              />
              <Button 
                type="submit" 
                disabled={isTyping || !inputText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-5 h-auto shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* CTA below chat */}
        <div className="text-center mt-12">
          <Button 
            onClick={startDemoMode}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-6 py-6 h-auto transition-all duration-300 glow-hover shadow-lg"
          >
            Create Your Own Custom Roadmaps Now
          </Button>
        </div>
      </div>
    </section>
  );
}
