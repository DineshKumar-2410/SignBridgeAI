import React, { useState, useEffect } from 'react';
import { Avatar3D } from './Avatar3D';

interface TextToSignProps {
  selectedLanguage: string;
  isDarkMode: boolean;
}

export const TextToSign: React.FC<TextToSignProps> = ({ selectedLanguage, isDarkMode }) => {
  const [inputText, setInputText] = useState<string>('Hello! Welcome to Indian Sign Language translation.');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // Split input into individual characters for finger spelling
  const wordTokens = inputText
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .split('')
    .filter(Boolean);

  const currentSignWord = wordTokens[activeWordIndex] || 'A';

  // Advance gesture word automatically on timeline when playing
  useEffect(() => {
    if (!isPlaying || wordTokens.length === 0) return;

    const intervalMs = (2500 / speed);
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % wordTokens.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, wordTokens.length, speed]);

  const handleSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment. You can type your phrase in the text area below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
      recognition.interimResults = false;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setActiveWordIndex(0);
          setIsPlaying(true);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: 3D Avatar Display & Controls */}
      <div className="lg:col-span-7 space-y-4">
        <div className={`p-4 rounded-2xl border shadow-xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-base font-bold flex items-center space-x-2">
              <span>🤖</span>
              <span>3D ISL Sign Avatar</span>
            </h2>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Natural Joint Rigging
            </span>
          </div>

          {/* 3D Humanoid Avatar Canvas */}
          <Avatar3D currentSign={currentSignWord} isPlaying={isPlaying} speed={speed} />

          {/* Playback Controls */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            {/* Play/Pause/Replay Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>

              <button
                onClick={() => {
                  setActiveWordIndex(0);
                  setIsPlaying(true);
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                title="Replay from start"
              >
                🔄 Replay
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400 font-medium">Speed:</span>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    speed === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Right Column: Text / Voice Input & Gesture Word Timeline */}
      <div className="lg:col-span-5 space-y-4">
        <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between h-full transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <span>💬</span>
                <span>Text / Voice Input</span>
              </h2>
              
              <button
                onClick={handleSpeechInput}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <span>🎙️</span>
                <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
              </button>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Type phrase or sentence ({selectedLanguage.toUpperCase()})
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setActiveWordIndex(0);
                }}
                placeholder="Enter English or Indian language text to convert to Indian Sign Language..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Gesture Word Sequence Breakdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                ISL Gesture Timeline Breakdown
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                {wordTokens.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveWordIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeWordIndex === idx
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {idx + 1}. {word}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Info Banner */}
          <div className="mt-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Avatar maps text tokens to Indian Sign Language (ISL) grammar structures.</span>
          </div>

        </div>
      </div>

    </div>
  );
};
