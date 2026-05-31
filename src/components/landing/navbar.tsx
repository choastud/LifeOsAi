'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingNavbar() {
  const { user, startDemoMode } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className={`w-full transition-all duration-300 rounded-full px-6 py-3 flex items-center justify-between ${
          scrolled 
            ? 'glass-panel shadow-md shadow-primary/5 border-border/40' 
            : 'bg-transparent border-transparent'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <span>LifeOS AI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Interactive Demo</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button render={<Link href="/dashboard" />} variant="default" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full px-5">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button render={<Link href="/login" />} variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full px-4">
                  Sign In
                </Button>
                <Button 
                  onClick={startDemoMode}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-5 transition-all glow-hover"
                >
                  Try Demo Mode
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground p-1 hover:bg-muted rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 p-6 glass-panel rounded-2xl shadow-xl border-border/40 flex flex-col gap-4 z-50 md:hidden"
          >
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-primary/10 transition-all"
            >
              Features
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-primary/10 transition-all"
            >
              Interactive Demo
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-primary/10 transition-all"
            >
              Testimonials
            </a>
            
            <hr className="border-border/60 my-1" />
            
            {user ? (
              <Button render={<Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} />} className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6">
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button render={<Link href="/login" onClick={() => setMobileMenuOpen(false)} />} variant="outline" className="w-full border-border/80 rounded-xl py-6">
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    startDemoMode();
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6"
                >
                  Try Demo Mode
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
