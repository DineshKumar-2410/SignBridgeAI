import React, { useState, useEffect } from 'react';
import { Avatar3D, ANIMATION_DICTIONARY } from './Avatar3D';
import { englishToISLGloss } from '../utils/nlp';

interface TextToSignProps {
  selectedLanguage: string;
  isDarkMode: boolean;
}

export const TextToSign: React.FC<TextToSignProps> = ({ selectedLanguage, isDarkMode }) => {
  const [inputText, setInputText] = useState<string>('Hello I am eating the apple');
  const [glossSequence, setGlossSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // Initialize with the default translation
  useEffect(() => {
    handleTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTranslate = () => {
    // Run NLP to convert SVO English to SOV ISL Gloss
    const sequence = englishToISLGloss(inputText);
    setGlossSequence(sequence);
    setActiveWordIndex(0);
    setIsPlaying(true);
  };

  const currentSignWord = glossSequence[activeWordIndex] || 'DEFAULT';

  // Advance gesture word automatically on timeline when playing
  useEffect(() => {
    if (!isPlaying || glossSequence.length === 0) return;

    const intervalMs = (2500 / speed); // Time per animation
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev + 1 >= glossSequence.length) {
          setIsPlaying(false); // Stop playing when sequence ends
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, glossSequence.length, speed]);

  const handleSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment.');
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
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: 3D Avatar Display & Controls */}
      <div className="lg:col-span-7 space-y-4">
        <div className={`p-4 rounded-2xl border shadow-xl transition-all flex flex-col h-full ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-base font-bold flex items-center space-x-2">
              <span>🤖</span>
              <span>3D ISL Sign Avatar</span>
            </h2>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              GLTF Animation Engine
            </span>
          </div>

          {/* 3D Humanoid Avatar Canvas */}
          <Avatar3D currentSign={currentSignWord} isPlaying={isPlaying} speed={speed} />

          {/* Playback Controls */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            {/* Play/Pause/Replay Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (activeWordIndex >= glossSequence.length - 1 && !isPlaying) {
                    setActiveWordIndex(0); // restart if at the end
                  }
                  setIsPlaying(!isPlaying);
                }}
                disabled={glossSequence.length === 0}
                className="p-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-indigo-600/30"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>

              <button
                onClick={() => {
                  setActiveWordIndex(0);
                  setIsPlaying(true);
                }}
                disabled={glossSequence.length === 0}
                className="p-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-sm font-semibold transition-all"
                title="Replay from start"
              >
                🔄 Replay
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Playback Speed:</span>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1.5 rounded-md font-bold transition-all ${
                    speed === s ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
                <span>English to ISL Gloss</span>
              </h2>
              
              <button
                onClick={handleSpeechInput}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <span>🎙️</span>
                <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
              </button>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Enter English Text
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter English text to convert to Indian Sign Language..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-base transition-colors resize-none shadow-inner"
              />
              
              <button
                onClick={handleTranslate}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>✨ Translate to ISL Sequence</span>
              </button>
            </div>

            {/* Gesture Word Sequence Breakdown */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-2 flex justify-between">
                <span>ISL Animation Sequence Queue</span>
                <span className="text-indigo-400 text-[10px]">SOV Format Generated</span>
              </label>
              
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
                {glossSequence.length === 0 ? (
                  <span className="text-slate-600 text-sm italic py-2">No sequence generated yet. Enter text and click Translate.</span>
                ) : (
                  glossSequence.map((word, idx) => {
                    const isActive = idx === activeWordIndex && isPlaying;
                    const isPlayed = idx < activeWordIndex;
                    const hasAnimation = ANIMATION_DICTIONARY[word] !== undefined;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveWordIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105 transform z-10'
                            : isPlayed
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-indigo-900/40 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-800'
                        }`}
                      >
                        {word}
                        {!hasAnimation && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" title="Missing GLTF map"></span>
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
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
