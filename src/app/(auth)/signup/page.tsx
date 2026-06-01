'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User, Terminal, Database, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const { signUp, loginWithGoogle, startDemoMode } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Registration successful! Welcome to LifeOS AI.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await loginWithGoogle();
    setGoogleLoading(false);
    if (error) {
      toast.error(error);
    }
  };

  const handleStartDemo = () => {
    const demoName = name.trim() || 'Guest';
    startDemoMode(demoName);
    toast.success(`Welcome, ${demoName}! Starting Guest Demo Mode.`);
  };

  return (
    <div className="min-h-screen w-full flex items-stretch justify-center bg-[radial-gradient(ellipse_at_top_right,var(--color-accent)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--color-primary)_0%,transparent_50%)] overflow-hidden">
      
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,111,71,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,111,71,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none"></div>

      {/* Main container split screen */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row relative z-10 md:m-8 md:rounded-3xl border border-border/20 overflow-hidden shadow-2xl glass-panel">
        
        {/* Left Section: Branding & Feature Mockup */}
        <div className="flex-1 hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 to-accent/5 border-r border-border/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          {/* Logo & Brand Header */}
          <Link href="/" className="inline-flex items-center gap-2 text-foreground font-bold text-2xl group w-fit">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <span className="tracking-tight text-glow">LifeOS <span className="text-accent font-semibold">AI</span></span>
          </Link>

          {/* Feature Showcase Mockup */}
          <div className="my-auto max-w-lg space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Your personal <br />
                <span className="text-accent bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary/80">AI productivity engine</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Connect your goals, preferences, and reflections. Experience a secure, customized executive companion that organizes your day.
              </p>
            </motion.div>

            {/* Micro mock preview cards */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-sm shadow-sm"
              >
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">🎙️ Global Voice Commands</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control pages, toggle theme, and read answers hands-free via speech synthesis.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-sm shadow-sm"
              >
                <div className="p-2 bg-accent/20 rounded-lg text-accent">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">💡 Dynamic Memory Vault</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Auto-extract context, facts, and insights from chat sessions to power briefings.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-sm shadow-sm"
              >
                <div className="p-2 bg-green-500/20 rounded-lg text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">🔄 Live Profile Synchronization</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Your nickname, preferences, and data sync dynamically across offline and online modes.</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer of split layout */}
          <div className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} LifeOS AI. All rights reserved.
          </div>
        </div>

        {/* Right Section: Authentic Authentication Forms */}
        <div className="w-full md:w-[480px] p-6 sm:p-12 flex flex-col justify-center bg-card/85 backdrop-blur-md relative">
          
          {/* Mobile view Logo Header */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            <span className="font-bold text-xl text-foreground">LifeOS AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h2>
              <p className="text-sm text-muted-foreground">
                Get started today and initialize your AI ecosystem.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name / Nickname</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 py-5 transition-all"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 py-5 transition-all"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-10 py-5 transition-all"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl py-6 flex items-center justify-center gap-2 group transition-all duration-300 shadow-md shadow-primary/10 mt-2"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full border-border/80 bg-background/30 hover:bg-background/60 hover:text-foreground text-muted-foreground py-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google Account</span>
                </>
              )}
            </Button>

            <div className="pt-2 text-center text-xs">
              <span className="text-muted-foreground font-medium block mb-2">Just want to preview the app?</span>
              <Button
                type="button"
                onClick={handleStartDemo}
                variant="ghost"
                className="text-primary hover:text-accent hover:bg-primary/5 font-semibold text-xs border border-primary/20 rounded-full px-5 py-1.5 h-auto transition-all"
              >
                Launch Guest Demo
              </Button>
            </div>

            <div className="text-sm text-center text-muted-foreground pt-4 border-t border-border/20">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline hover:text-accent font-semibold transition-colors">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
