'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Play, Brain, CheckCircle2, ShieldCheck, HeartPulse, User, Mail, Lock, Eye, EyeOff, Loader2, Database, Terminal, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LandingHero() {
  const { user, isDemo, login, loginWithGoogle, startDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'guest'>('signin');
  
  // Login card form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await login(email, password, name);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back to LifeOS AI!');
    }
  };

  const handleGoogleLogin = async () => {
    if (name.trim()) {
      localStorage.setItem('lifeos_oauth_nickname', name.trim());
    }
    setGoogleLoading(true);
    const { error } = await loginWithGoogle();
    setGoogleLoading(false);
    if (error) {
      toast.error(error);
    }
  };

  const handleStartDemo = (e: React.FormEvent) => {
    e.preventDefault();
    const guestName = name.trim() || 'Guest';
    startDemoMode(guestName);
    toast.success(`Welcome, ${guestName}! Starting Guest Demo Mode.`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/25 rounded-full blur-3xl opacity-60 animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

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

          {/* Action Buttons for quick navigations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            {user ? (
              <Button 
                render={<Link href="/dashboard" />}
                size="lg" 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full px-8 py-7 h-auto text-base glow-hover flex items-center gap-2 group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  const target = document.getElementById('auth-card');
                  target?.scrollIntoView({ behavior: 'smooth' });
                  setActiveTab('guest');
                }}
                size="lg" 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full px-8 py-7 h-auto text-base glow-hover flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            
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

        {/* Right Column: Embedded Authentication Form */}
        <div id="auth-card" className="lg:col-span-5 relative flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md relative z-10"
          >
            {/* Background glowing circle behind the card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-80 -z-10 pointer-events-none"></div>

            <div className="glass-card border-border/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-left space-y-6">
              
              {user ? (
                /* Authenticated State Display */
                <div className="space-y-6 py-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-foreground">Welcome back, {user.name}!</h3>
                    <p className="text-xs text-muted-foreground leading-normal">
                      You are signed in with <span className="font-semibold text-foreground">{user.email || 'Guest Mode'}</span>.
                    </p>
                  </div>

                  <div className="p-3 bg-secondary/35 rounded-xl border border-border/30 text-xs text-left space-y-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Connection status: <span className={isDemo ? 'text-amber-600' : 'text-emerald-600'}>{isDemo ? 'Guest Sandbox' : 'Cloud Sync Active'}</span>
                    </span>
                  </div>

                  <Button 
                    render={<Link href="/dashboard" />}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl py-6 flex items-center justify-center gap-2"
                  >
                    <span>Enter Dashboard Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                /* Unauthenticated Login Form tabs */
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Workspace Gateway</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Access your personal AI ecosystem directly from here.
                    </p>
                  </div>

                  <Tabs 
                    value={activeTab} 
                    onValueChange={(val) => setActiveTab(val as 'signin' | 'guest')}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full p-1 bg-muted/60 border border-border/40 rounded-xl mb-4">
                      <TabsTrigger value="signin" className="py-2 rounded-lg font-semibold text-xs transition-all">
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="guest" className="py-2 rounded-lg font-semibold text-xs transition-all">
                        Guest Demo
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="signin" className="space-y-4 focus-visible:outline-none">
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                          {/* Optional Name field to sync during credentials login */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Name / Nickname (Optional)</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="e.g. Hema"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background/40 border-border/80 focus:border-primary text-xs rounded-xl pl-9 py-4 transition-all"
                                disabled={loading || googleLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/40 border-border/80 focus:border-primary text-xs rounded-xl pl-9 py-4 transition-all"
                                required
                                disabled={loading || googleLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                              <Link
                                href="/reset-password"
                                className="text-[10px] text-primary hover:underline hover:text-accent font-semibold transition-colors"
                              >
                                Forgot?
                              </Link>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/40 border-border/80 focus:border-primary text-xs rounded-xl pl-9 pr-9 py-4 transition-all"
                                required
                                disabled={loading || googleLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 group transition-all duration-300 mt-2 h-auto text-xs"
                            disabled={loading || googleLoading}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Sign In</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </>
                            )}
                          </Button>
                        </form>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-card px-2 text-muted-foreground font-semibold">Or continue with</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogleLogin}
                          className="w-full border-border/80 bg-background/20 hover:bg-background/50 hover:text-foreground text-muted-foreground py-5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 h-auto"
                          disabled={loading || googleLoading}
                        >
                          {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
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
                      </TabsContent>

                      <TabsContent value="guest" className="space-y-4 focus-visible:outline-none">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-[10px] text-muted-foreground leading-normal">
                          ⚙️ <strong>Local Guest Sandbox Mode</strong>: Launching this mode allows you to browse the application completely offline. All data will be saved locally inside your browser.
                        </div>

                        <form onSubmit={handleStartDemo} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Nickname</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                type="text"
                                placeholder="e.g. Hema"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background/40 border-border/80 focus:border-primary text-xs rounded-xl pl-9 py-4 transition-all"
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/95 text-accent-foreground font-bold rounded-xl py-5 flex items-center justify-center gap-1.5 group transition-all duration-300 mt-2 h-auto text-xs"
                          >
                            <span>Launch Guest Demo</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>

                  <div className="text-xs text-center text-muted-foreground pt-4 border-t border-border/20">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-primary hover:underline hover:text-accent font-semibold transition-colors">
                      Sign Up
                    </Link>
                  </div>
                </>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
