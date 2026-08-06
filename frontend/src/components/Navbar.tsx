import React from 'react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  apiConnected: boolean;
}

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English (India)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada (கன்னட)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese (অসমীয়া)' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  isDarkMode,
  setIsDarkMode,
  isHighContrast,
  setIsHighContrast,
  apiConnected
}) => {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
      isHighContrast
        ? 'bg-black border-yellow-400 text-yellow-400'
        : isDarkMode
        ? 'bg-slate-900/90 border-slate-800 text-slate-100'
        : 'bg-white/90 border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('sign-to-text')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-xl font-black text-white">🤟</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SignBridge AI
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-medium">ISL Platform</span>
                <span className={`inline-block w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} title={apiConnected ? 'Backend API Active' : 'Offline / Standalone Mode'} />
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'sign-to-text', label: 'Sign → Text/Speech', icon: '📷' },
              { id: 'text-to-sign', label: 'Speech/Text → ISL Avatar', icon: '🤖' },
              { id: 'translator', label: 'Translator', icon: '🌐' },
              { id: 'learn', label: 'Learn ISL', icon: '🎓' },
              { id: 'history', label: 'History', icon: '📜' },
              { id: 'train', label: 'Train AI Model', icon: '🧠' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === item.id
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDarkMode
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Controls: Language & Accessibility */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'
                }`}
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              title="Toggle High Contrast Mode"
              className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-500'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              👁️ HC
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Dark/Light Mode"
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'sign-to-text', label: 'Sign → Text', icon: '📷' },
            { id: 'text-to-sign', label: 'Avatar', icon: '🤖' },
            { id: 'translator', label: 'Translator', icon: '🌐' },
            { id: 'learn', label: 'Learn', icon: '🎓' },
            { id: 'history', label: 'History', icon: '📜' },
            { id: 'train', label: 'Train AI', icon: '🧠' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`px-2 py-1.5 rounded-md flex flex-col items-center space-y-1 ${
                activeTab === item.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
