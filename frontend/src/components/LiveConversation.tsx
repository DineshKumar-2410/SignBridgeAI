import React, { useState } from 'react';

interface LiveConversationProps {
  selectedLanguage: string;
  isDarkMode: boolean;
}

interface Message {
  id: string;
  sender: 'deaf' | 'hearing';
  senderName: string;
  text: string;
  timestamp: string;
  confidence?: number;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({ selectedLanguage, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'hearing',
      senderName: 'Hearing Partner (Doctor/Teacher)',
      text: 'Hello! How can I assist you today?',
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      sender: 'deaf',
      senderName: 'ISL Signer (Deaf/Mute User)',
      text: 'I NEED HELP WITH MEDICAL APPOINTMENT',
      timestamp: '10:01 AM',
      confidence: 97.2
    }
  ]);

  const [deafInput, setDeafInput] = useState<string>('');
  const [hearingInput, setHearingInput] = useState<string>('');

  const handleSendDeaf = () => {
    if (!deafInput.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'deaf',
      senderName: 'ISL Signer (Deaf/Mute User)',
      text: deafInput.toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 95.8
    };
    setMessages((prev) => [...prev, newMsg]);
    setDeafInput('');
  };

  const handleSendHearing = () => {
    if (!hearingInput.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'hearing',
      senderName: 'Hearing Partner',
      text: hearingInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setHearingInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-2xl">
            💬
          </div>
          <div>
            <h2 className="text-lg font-bold">Live Bidirectional Conversation</h2>
            <p className="text-xs text-slate-400">Real-time two-way translation between Sign Language and Spoken/Text Language ({selectedLanguage.toUpperCase()})</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
        >
          Clear Chat History
        </button>
      </div>

      {/* Main Split Screen Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Deaf / Mute Partner (Sign Recognizer) */}
        <div className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-bold text-indigo-400 flex items-center space-x-2">
                <span>🤟</span>
                <span>Sign Language User Panel</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Camera Live
              </span>
            </div>

            {/* Simulated Live Sign Camera Preview */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
              <span className="text-4xl animate-bounce">🖐️</span>
              <div className="absolute bottom-2 left-2 px-3 py-1 rounded-md bg-slate-900/90 text-[10px] text-indigo-300 font-mono">
                Tracking 21 Landmarks
              </div>
            </div>

            {/* Quick Sign Inputs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['I NEED HELP', 'THANK YOU', 'PLEASE WAIT', 'YES', 'NO'].map((s) => (
                <button
                  key={s}
                  onClick={() => setDeafInput(s)}
                  className="px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/40 text-xs"
                >
                  + {s}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={deafInput}
                onChange={(e) => setDeafInput(e.target.value)}
                placeholder="Detected or typed sign phrase..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendDeaf}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md"
              >
                Send Sign
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Hearing Partner (Speech / Text) */}
        <div className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                <span>🎙️</span>
                <span>Hearing User Panel</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Speech to Text Active
              </span>
            </div>

            {/* Hearing Input Area */}
            <div className="space-y-3 mb-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300">
                Speak or type in your spoken language. It will automatically translate into animated sign language for your conversation partner.
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={hearingInput}
                  onChange={(e) => setHearingInput(e.target.value)}
                  placeholder="Type speech reply..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendHearing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md"
                >
                  Send Speech
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Shared Live Chat Stream */}
      <div className={`p-6 rounded-2xl border shadow-xl transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
          <span>📜</span>
          <span>Live Translation Stream</span>
        </h3>

        <div className="space-y-3 max-h-72 overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">No conversation messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border flex flex-col space-y-1 ${
                  msg.sender === 'deaf'
                    ? 'bg-indigo-950/40 border-indigo-800/40 ml-0 mr-12'
                    : 'bg-emerald-950/40 border-emerald-800/40 ml-12 mr-0'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={msg.sender === 'deaf' ? 'text-indigo-400' : 'text-emerald-400'}>
                    {msg.senderName}
                  </span>
                  <span className="text-slate-500">{msg.timestamp}</span>
                </div>
                <div className="text-sm font-medium text-slate-100">{msg.text}</div>
                {msg.confidence && (
                  <div className="text-[10px] text-indigo-300">
                    Accuracy Score: {msg.confidence}%
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
