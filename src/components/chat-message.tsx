import React from 'react';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userName?: string;
  // Simple placeholder timestamp, can be expanded later
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, userName = 'You', timestamp = 'Just now' }) => {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent-foreground'
          }`}
        >
          {isUser ? userName[0] : <Brain className="w-4 h-4" />}
        </div>
        <div className="flex flex-col gap-1 max-w-full">
          <p className={`text-xs font-medium text-muted-foreground ${isUser ? 'text-right' : ''}`}>
            {isUser ? 'You' : 'AI'}
          </p>
          <div
            className={`rounded-2xl px-4 py-3 text-sm shadow-sm text-left leading-relaxed transition-all duration-300 hover:shadow-md ${
              isUser
                ? 'bg-primary text-primary-foreground rounded-tr-none'
                : 'bg-background/80 border border-border/40 text-foreground rounded-tl-none whitespace-pre-wrap font-medium'
            }`}
          >
            {content.split('\n').map((line, idx) => (
              <p key={idx} className="mb-1 last:mb-0">
                {line}
              </p>
            ))}
          </div>
          <span className={`text-[10px] text-muted-foreground ${isUser ? 'text-right' : ''}`}>{timestamp}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
