'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  type: 'global' | 'alliance';
}

interface GameChatProps {
  username: string;
  channel?: 'global' | 'alliance';
}

export default function GameChat({ username, channel = 'global' }: GameChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'System',
      text: 'Welcome to Zerx! Type your message to chat with other players.',
      timestamp: new Date(),
      type: 'global',
    },
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      username,
      text: input,
      timestamp: new Date(),
      type: channel,
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Chat [{channel}]
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-800 border border-slate-700 rounded-lg flex flex-col max-h-96">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-700 p-3 rounded-t-lg border-b border-slate-600">
        <h3 className="text-sm font-bold text-blue-400">
          {channel === 'global' ? 'Global Chat' : 'Alliance Chat'}
        </h3>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-slate-400 hover:text-slate-200 font-bold"
        >
          _
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((msg) => (
          <div key={msg.id}>
            <span className="text-blue-400 font-semibold">{msg.username}:</span>
            <span className="text-slate-300 ml-1">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-600 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
