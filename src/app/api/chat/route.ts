import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendToGrok, GrokMessage } from '@/lib/grok';

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await handleRequestData(request);
    
    // 1. Get user context if logged in
    const supabase = await createClient();
    let profileName = 'User';
    let systemContext = `You are LifeOS AI, a premium personal operating system and life coach. You help the user manage goals, learning, journaling, and habits. You speak like a senior mentor: professional, empathetic, and action-oriented. Keep replies organized with clear markdown headers.`;

    if (supabase && userId) {
      // Fetch user profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (profile) profileName = profile.name;

      // Fetch user memories to feed as system context
      const { data: memories } = await supabase
        .from('memories')
        .select('memory')
        .eq('user_id', userId);

      if (memories && memories.length > 0) {
        const memoryString = memories.map(m => `- ${m.memory}`).join('\n');
        systemContext += `\n\nHere are things you know about the user (use these to personalize advice):\n${memoryString}`;
      }
    }

    // 2. Build full message array with system prompt
    const fullMessages: GrokMessage[] = [
      { role: 'system', content: systemContext },
      ...messages
    ];

    // 3. Call Grok API
    const responseText = await sendToGrok(fullMessages);

    // 4. Save chat log to DB if Supabase is connected
    if (supabase && userId) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      await supabase.from('chats').insert({
        user_id: userId,
        message: lastUserMsg,
        response: responseText
      });
    }

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Error in chat API handler:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

async function handleRequestData(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return { messages: [], userId: null };
  }
}
