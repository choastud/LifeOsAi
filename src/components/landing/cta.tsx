'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingCTA() {
  const { startDemoMode } = useAuth();

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-accent/15 rounded-full blur-3xl opacity-60"></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel border-border/40 p-12 sm:p-16 rounded-3xl shadow-2xl space-y-8 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>Instant Free Access</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Start Building Your <br />Future Today
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
              Join thousands of creators, engineers, and researchers using LifeOS AI to align daily tasks with long-term goals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button 
              onClick={startDemoMode}
              size="lg" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full px-8 py-7 h-auto text-base glow-hover flex items-center gap-2 group w-full sm:w-auto"
            >
              <span>Try Demo Mode (Instant)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase pt-4">
            No Credit Card Required • Instant Setup • Complete Data Privacy
          </p>
        </motion.div>
      </div>
    </section>
  );
}
