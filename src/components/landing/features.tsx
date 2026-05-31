'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  FileText 
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      className="glass-card border-border/40 p-6 rounded-2xl glow-hover relative overflow-hidden group flex flex-col justify-between"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export default function LandingFeatures() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Lifecoach & Partner",
      description: "Chat naturally with a smart mentor that remembers your career vision, adapts advice, and proactively keeps you focused.",
      delay: 0.1
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Intelligent Goal Tracker",
      description: "Define milestones and deadlines. The AI suggests actionable steps, assigns subtasks, and tracks your progress visually.",
      delay: 0.2
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Memory Vault",
      description: "Our AI auto-extracts your skills, preferences, and interests during conversations. Pin, search, and manage what it knows.",
      delay: 0.3
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Self-Reflecting Journal",
      description: "Log daily reflections and choose your mood. Grok analyzes your feelings, creates psychological insights, and spots patterns.",
      delay: 0.4
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Learning Hub Curriculums",
      description: "Build custom roadmaps for new subjects. Generate weekly study schedules, track completed topics, and save resources.",
      delay: 0.5
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Productivity Analytics",
      description: "Rich, interactive charts showing your goal completion rate, mood trends, learning progress, and AI interaction counts.",
      delay: 0.6
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-secondary/20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,111,71,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,111,71,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-accent"
          >
            Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            Everything you need in one OS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg"
          >
            Built to replace scattered templates, notes, trackers, and chats. An integrated workspace that grows with you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
