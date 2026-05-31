'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Brain, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingHero() {
  const { startDemoMode } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/25 rounded-full blur-3xl opacity-60 animate-pulse-glow"></div>
      <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl opacity-50"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline and Content */}
        <div className="lg:col-span-7 text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-accent/20 text-accent-foreground text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Introducing LifeOS AI v1.0</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground"
            >
              Your Personal AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-shine bg-[size:200%_auto]">
                Operating System
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl font-normal leading-relaxed"
            >
              Track goals, organize your life, journal your thoughts, and grow with an intelligent assistant that truly remembers you.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button 
              onClick={startDemoMode} 
              size="lg" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full px-8 py-7 h-auto text-base glow-hover flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              render={<a href="#demo" />}
              variant="outline" 
              size="lg" 
              className="border-border/80 bg-background/50 hover:bg-background text-foreground font-semibold rounded-full px-8 py-7 h-auto text-base flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-primary" />
              <span>Watch Demo</span>
            </Button>
          </motion.div>

          {/* Core Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-border/40 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground">Persistent Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground">Goal Autopilot</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground">Private & Secure</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive AI Floating Orb / Widget Graphic */}
        <div className="lg:col-span-5 relative flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[360px] aspect-square relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 to-primary/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>

            {/* Glowing AI Assistant Core Orb */}
            <div className="absolute inset-0 m-auto w-64 h-64 bg-background/75 border border-border/80 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-2xl animate-float">
              <div className="w-48 h-48 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] rounded-full flex items-center justify-center opacity-80 animate-pulse-glow">
                <Brain className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(139,111,71,0.5)]" />
              </div>

              {/* Orbital Nodes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute w-full h-full inset-0 pointer-events-none"
              >
                {/* Node 1: Goals */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full glass-panel border-accent/40 shadow-lg flex items-center justify-center text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                {/* Node 2: Journal */}
                <div className="absolute bottom-10 right-2 w-10 h-10 rounded-full glass-panel border-accent/40 shadow-lg flex items-center justify-center text-accent">
                  <HeartPulse className="w-5 h-5" />
                </div>
                {/* Node 3: Learning */}
                <div className="absolute bottom-10 left-2 w-10 h-10 rounded-full glass-panel border-accent/40 shadow-lg flex items-center justify-center text-accent">
                  <Brain className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
            
            {/* Float details */}
            <div className="absolute -top-6 -right-6 glass-panel border-border/40 p-4 rounded-2xl shadow-xl max-w-[160px] text-xs font-semibold space-y-1.5 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-1.5 text-accent">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Memory Vault</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-normal leading-normal">Alex prefers focused morning study blocks and PM coding sessions.</p>
            </div>

            <div className="absolute -bottom-6 -left-6 glass-panel border-border/40 p-4 rounded-2xl shadow-xl max-w-[180px] text-xs font-semibold space-y-1.5 animate-float" style={{ animationDelay: '3s' }}>
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Goal Roadmap</span>
              </div>
              <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[70%]" />
              </div>
              <p className="text-[10px] text-muted-foreground font-normal">70% Product Manager Prep</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
