import React, { ReactNode } from 'react';
import { Markdown } from './markdown';

export interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    parts: {
      type: string;
      text?: string;
      [key: string]: any;
    }[];
  };
  renderToolInvocation?: (part: any, messageId: string, index: number) => ReactNode;
}

export function Message({ message, renderToolInvocation }: MessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 dark:bg-zinc-700 dark:text-white text-zinc-800'
        }`}
      >
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return (
                <div key={`${message.id}-${i}`}>
                  {message.role === 'assistant' ? (
                    <Markdown>{part.text || ''}</Markdown>
                  ) : (
                    part.text
                  )}
                </div>
              );
            case "tool-invocation":
              return renderToolInvocation ? renderToolInvocation(part, message.id, i) : null;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
} 