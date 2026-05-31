import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching journal logs:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const { userId, content, mood } = await request.json();

    if (!userId || !content || !mood) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Auto-generate AI insights based on the journal content
    const ai_insights = generateAIJournalInsights(content, mood);

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content,
        mood,
        ai_insights
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating journal log:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

function generateAIJournalInsights(content: string, mood: string): string {
  const contentLower = content.toLowerCase();
  
  if (mood === 'stressed' || mood === 'anxious' || contentLower.includes('stress') || contentLower.includes('anxious')) {
    return 'Your stress markers are slightly elevated today. It appears you have a high cognitive load regarding projects. Consider breaking down big tasks into micro-steps, and scheduling a screen-free walks to reset your cortisol levels.';
  }
  
  if (mood === 'tired' || contentLower.includes('sleep') || contentLower.includes('tired')) {
    return 'Sleep quality is flagged as lower today. You mentioned late screen time or night coding. I recommend a hard shutdown of all monitors by 10:30 PM and relaxing with a book. Consistent circadian rhythm boosts daily focus by 20%.';
  }
  
  if (mood === 'productive' || mood === 'happy' || contentLower.includes('finish') || contentLower.includes('success')) {
    return 'Excellent momentum! Your emotional markers are aligned with high productivity. Capitalize on this energy to tackle your hardest priority goals first today. Continue setting clear boundaries in the evening.';
  }

  return 'Log captured. Reflecting regularly is linked to higher emotional regulation and clarity. Keep outlining your focus points to feed our coaching algorithm.';
}
