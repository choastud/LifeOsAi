export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.GROK_API_KEY || '';

export const isGrokConfigured = !!API_KEY;

export async function sendToGrok(messages: GrokMessage[]): Promise<string> {
  if (!isGrokConfigured) {
    // If not configured, run the fallback local simulation
    return getMockAIResponse(messages);
  }

  let url = GROK_API_URL;
  let model = 'grok-2';

  if (API_KEY.startsWith('gsk_')) {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    model = 'llama-3.3-70b-versatile';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Grok/Groq API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices[0]?.message?.content || 'No response content';
    return sanitizeResponse(raw);
  } catch (error: any) {
    console.error('Error calling Grok API:', error);
    // Return a safe error fallback response that looks nice
    return `[System Connection Offline] I ran into an issue connecting to the Grok API: "${error.message}". I will act in offline coaching mode for now.\n\nLet's focus on your goals: what are the next milestones we should add to your preparation plan?`;
  }
}

// Highly intelligent mockup response generator for portfolio showcases
function sanitizeResponse(text: string): string {
  return text
    .replace(/[#*`_\[\]\\]/g, '') // remove markdown symbols
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getMockAIResponse(messages: GrokMessage[]): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  if (lowerMsg.includes('product manager') || lowerMsg.includes('pm')) {
    return sanitizeResponse(`Becoming a Product Manager is an incredibly rewarding path! Let's draft a complete roadmap for you:

### 📍 PM Career Vision
We'll aim to transition you within **3 months** by focusing on core skills, mock interviews, and launching a side project.

### 📚 Skills To Master
* **Product Sense & Discovery**: Understanding user pain points and defining the 'Why'.
* **Execution & Metrics**: Defining KPIs, tracking analytics, and prioritizing features using frameworks like RICE.
* **Technical Basics**: SQL, API structures, and basic frontend systems.

### 🎯 Suggested Goals & Milestones
* **Goal 1: Learn Figma & Design 3 Wireframes** (Deadline: 2 weeks)
* **Goal 2: Write a Product Requirement Document (PRD)** (Deadline: 4 weeks)
* **Goal 3: Connect with 5 current PMs on LinkedIn for informational chats** (Deadline: 6 weeks)

I have automatically tagged these as recommended priorities. Would you like me to add these directly to your Goals Module?`);
  }

  if (lowerMsg.includes('rust') || lowerMsg.includes('systems programming')) {
    return sanitizeResponse(`Rust is an exceptional systems language focused on performance and safety. Here is a custom study plan:

### 🦀 Rust Mastery Blueprint
* **Week 1**: Basic syntax, variables, mutability, and cargo project layouts.
* **Week 2**: **Ownership, references, and borrowing** (the core of Rust memory safety).
* **Week 3**: Structs, enums, pattern matching, and error handling with \`Result\` and \`Option\`.
* **Week 4**: Multi-threading, concurrency basics, and building a simple TCP client.

### 🛠 Exercises to try
1. Read the Official Rust Book chapters 1-4.
2. Complete the first 20 tasks in the 'Rustlings' CLI utility.

I have updated your Learning Hub suggestions with these topics. What is your programming background so I can customize the exercises further?`);
  }

  if (lowerMsg.includes('journal') || lowerMsg.includes('mood') || lowerMsg.includes('sleep')) {
    return sanitizeResponse(`I've analyzed your reflections. It seems screen time and sleep quality have a direct correlation with your mood trends.

### 💡 Cognitive Insights
Your productivity scores are consistently 35% higher on days where you log a sleep duration of 7+ hours and zero late-night screen activity.

### 🧘 Recommendations
1. Establish a strict screen shutdown threshold at **10:30 PM**.
2. Spend the last 30 minutes of your day reading a physical book or journaling.

I've logged this preference in your Memory Vault. Shall we set up a reminder to check in on this tomorrow?`);
  }

  // Default response
  return sanitizeResponse(`I hear you, and I am documenting this in your personal ecosystem.

As your LifeOS coach, I want to help you align this with your bigger picture. Let's start by breaking down this idea into actionable milestones:
1. What is the immediate first step you can complete within the next 24 hours?
2. What resources do you need (articles, tools, or contacts)?

Tell me more about your thoughts, and I'll extract relevant notes for your Memory Vault!`);

}
