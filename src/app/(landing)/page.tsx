import LandingNavbar from '@/components/landing/navbar';
import LandingHero from '@/components/landing/hero';
import LandingFeatures from '@/components/landing/features';
import LandingDemo from '@/components/landing/ai-demo';
import LandingTestimonials from '@/components/landing/testimonials';
import LandingCTA from '@/components/landing/cta';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative bg-background overflow-hidden min-h-screen">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,111,71,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,111,71,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      <LandingNavbar />
      
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <LandingFeatures />
        <LandingDemo />
        <LandingTestimonials />
        <LandingCTA />
      </main>

      <footer className="py-8 border-t border-border/40 relative z-10 bg-secondary/10">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-sm font-semibold text-muted-foreground">
            © {new Date().getFullYear()} LifeOS AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
