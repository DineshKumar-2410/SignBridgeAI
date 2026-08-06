import React, { useState } from 'react';
import { INDIAN_LANGUAGES } from './Navbar';

interface TranslatorProps {
  isDarkMode: boolean;
}

export const Translator: React.FC<TranslatorProps> = ({ isDarkMode }) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setError('Failed to translate. Please try again.');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto p-6 rounded-2xl shadow-xl transition-colors ${
      isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
    }`}>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <span>🌐</span> Language Translator
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Translate between English and various Indian languages
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Source Box */}
        <div className="flex-1 flex flex-col gap-2">
          <select 
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className={`p-3 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {INDIAN_LANGUAGES.map(lang => (
              <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className={`w-full p-4 h-64 rounded-xl border resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center items-center py-2 md:py-0">
          <button
            onClick={handleSwap}
            className={`p-3 rounded-full hover:scale-110 transition-transform shadow-md ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
            }`}
            title="Swap Languages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* Target Box */}
        <div className="flex-1 flex flex-col gap-2">
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className={`p-3 rounded-xl border font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {INDIAN_LANGUAGES.map(lang => (
              <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          
          <div className="relative h-64">
            <textarea
              readOnly
              value={translatedText}
              placeholder="Translation will appear here..."
              className={`w-full h-full p-4 rounded-xl border resize-none outline-none transition-all text-lg ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600'
                  : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-500'
              } ${isTranslating ? 'opacity-50' : 'opacity-100'}`}
            />
            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
            !inputText.trim() || isTranslating
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30'
          }`}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>
    </div>
  );
};
