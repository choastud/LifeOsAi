'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  text: string;
  delay: number;
}

function TestimonialCard({ name, role, avatar, text, delay }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      className="glass-card border-border/40 p-6 rounded-2xl flex flex-col justify-between shadow-sm relative"
    >
      <div className="space-y-4">
        {/* Rating */}
        <div className="flex gap-1 text-accent">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        
        {/* Text */}
        <p className="text-sm italic leading-relaxed text-muted-foreground font-medium">"{text}"</p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 mt-6 border-t border-border/30 pt-4">
        <Avatar className="w-9 h-9 border border-border/80">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <div className="text-sm font-bold text-foreground">{name}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingTestimonials() {
  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Lead Software Architect",
      avatar: "",
      text: "I used to have scattered boards in Notion, lists in Todoist, and conversations in ChatGPT. LifeOS AI brought everything together. The AI memory vault feels like magic.",
      delay: 0.1
    },
    {
      name: "Clara Zhang",
      role: "UX Researcher",
      avatar: "",
      text: "The journal mood insights are spot on. It parsed my daily stress logs and correctly identified that coding too late was hurting my morning focus. Highly recommended!",
      delay: 0.2
    },
    {
      name: "Devon Reed",
      role: "Founder, PeakFlow",
      avatar: "",
      text: "LifeOS AI is basically my Chief of Staff. I ask it to draft roadmaps, and it populates my goals, schedule, and tasks. The coffee-beige design is beautifully minimal.",
      delay: 0.3
    }
  ];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">Testimonials</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Loved by builders and thinkers</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            See how high-performing individuals organize their lives and reach goals with LifeOS AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
