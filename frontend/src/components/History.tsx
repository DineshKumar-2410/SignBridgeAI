import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  historyItems: HistoryItem[];
  isDarkMode: boolean;
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ historyItems, isDarkMode, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'sign' | 'speech' | 'text'>('all');

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.originalContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.sourceType === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (historyItems.length === 0) return;
    const headers = 'ID,Timestamp,SourceType,Original,Translated,Language,Confidence\n';
    const rows = historyItems
      .map(
        (i) =>
          `"${i.id}","${i.timestamp}","${i.sourceType}","${i.originalContent}","${i.translatedText}","${i.language}",${i.confidence}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SignBridge_History_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-xl space-y-6 transition-all ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center space-x-2">
            <span>📜</span>
            <span>Translation History Log</span>
          </h2>
          <p className="text-xs text-slate-400">Review past sign detections, speech translations, and export reports.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={historyItems.length === 0}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md"
          >
            📥 Export CSV
          </button>

          <button
            onClick={onClearHistory}
            disabled={historyItems.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-rose-400 font-semibold text-xs transition-all"
          >
            🗑️ Clear History
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by keywords..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {['all', 'sign', 'speech', 'text'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                filterType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">Original Input</th>
              <th className="p-3">Translated Output</th>
              <th className="p-3">Language</th>
              <th className="p-3">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                  No translation history matching filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{item.timestamp}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.sourceType === 'sign' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {item.sourceType}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-200">{item.originalContent}</td>
                  <td className="p-3 font-medium text-emerald-300">{item.translatedText}</td>
                  <td className="p-3 uppercase text-slate-400">{item.language}</td>
                  <td className="p-3 font-bold text-emerald-400">{item.confidence}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
