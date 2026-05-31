'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DashboardTopbar from '@/components/dashboard/topbar';
import { Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"
        >
          <Sparkles className="w-8 h-8 text-accent animate-pulse" />
        </motion.div>
        <div className="space-y-1.5 text-center">
          <p className="text-sm font-bold text-foreground">Synchronizing LifeOS Ecosystem</p>
          <p className="text-xs text-muted-foreground">Retrieving goals & active memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header */}
        <DashboardTopbar />
        
        {/* Tab content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-secondary/15 relative">
          <div className="max-w-5xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
