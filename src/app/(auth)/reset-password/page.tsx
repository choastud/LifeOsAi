'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured) {
      // Demo mode password reset simulation
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        toast.success('Reset email simulated successfully!');
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        setSuccess(true);
        toast.success('Password reset link sent to your email');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--color-accent)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--color-primary)_0%,transparent_50%)] p-4 sm:p-6">
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,111,71,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,111,71,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-border/40 overflow-hidden shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pt-8">
            <Link href="/" className="inline-flex items-center gap-2 mx-auto mb-2 text-primary font-bold text-xl hover:opacity-85 transition-opacity">
              <Sparkles className="w-6 h-6 animate-pulse text-accent" />
              <span>LifeOS AI</span>
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a recovery link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4 pb-6">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all"
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg py-6 flex items-center justify-center gap-2 group transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="pb-8 pt-2 bg-muted/20 border-t border-border/20 flex justify-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
