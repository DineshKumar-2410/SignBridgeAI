import React, { useState, useEffect } from 'react';
import { ActiveTab, HistoryItem } from './types';
import { Navbar } from './components/Navbar';
import { SignToText } from './components/SignToText';
import { TextToSign } from './components/TextToSign';
import { Translator } from './components/Translator';
import { LearnISL } from './components/LearnISL';
import { History } from './components/History';
import { TrainModel } from './components/TrainModel';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sign-to-text');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: '1',
      timestamp: '09:30 AM',
      sourceType: 'sign',
      originalContent: 'HELLO WELCOME',
      translatedText: 'Hello! Welcome to our session.',
      language: 'en',
      confidence: 96.8
    },
    {
      id: '2',
      timestamp: '09:45 AM',
      sourceType: 'speech',
      originalContent: 'Thank you for your assistance',
      translatedText: 'THANK YOU ASSISTANCE',
      language: 'en',
      confidence: 98.1
    }
  ]);

  // Check backend health
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') setApiConnected(true);
      })
      .catch(() => setApiConnected(false));
  }, []);

  const handleAddHistory = (item: HistoryItem) => {
    setHistoryItems((prev) => [item, ...prev]);
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isHighContrast
        ? 'bg-black text-yellow-400 font-bold'
        : isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        apiConnected={apiConnected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Active Tab View Rendering */}
        {activeTab === 'sign-to-text' && (
          <SignToText
            selectedLanguage={selectedLanguage}
            isDarkMode={isDarkMode}
            onAddHistory={handleAddHistory}
          />
        )}

        {activeTab === 'text-to-sign' && (
          <TextToSign
            selectedLanguage={selectedLanguage}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'translator' && (
          <Translator
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'learn' && (
          <LearnISL isDarkMode={isDarkMode} />
        )}

        {activeTab === 'history' && (
          <History
            historyItems={historyItems}
            isDarkMode={isDarkMode}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'train' && (
          <TrainModel isDarkMode={isDarkMode} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <p>SignBridge AI — Indian Sign Language Communication Platform © 2026</p>
      </footer>

    </div>
  );
};

export default App;