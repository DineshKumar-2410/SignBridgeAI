import React, { useState } from 'react';

interface LearnISLProps {
  isDarkMode: boolean;
}

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Official ISLRTC Indian Sign Language (ISL) Alphabet Descriptions & Hand Position Models
const ALPHABET_DETAILS: Record<string, { desc: string; handType: string; tips: string }> = {
  A: { desc: 'Two hands forming an A-frame / roof angle with index fingers and thumbs touching at the top apex.', handType: 'Two Hands (A-Frame / Roof)', tips: 'Touch fingertips at top.' },
  B: { desc: 'Two hands held up together with curved index fingers and thumbs touching to form double eyeglass loops.', handType: 'Two Hands (Double Loops)', tips: 'Form two side-by-side circles.' },
  C: { desc: 'One hand forming a clean C-shape curve with thumb and fingers facing each other.', handType: 'One Hand (C-Curve)', tips: 'Keep curve wide.' },
  D: { desc: 'Index finger of main hand pointing straight upright, with second hand forming a side loop attached.', handType: 'Two Hands (Index + Loop)', tips: 'Loop attached to vertical finger.' },
  E: { desc: 'Main index finger pointing horizontally to touch non-dominant index finger sideways.', handType: 'Two Hands (Horizontal Touch)', tips: 'Horizontal finger alignment.' },
  F: { desc: 'Two index fingers crossed downwards forming an inverted V cross.', handType: 'Two Hands (Crossed Down)', tips: 'Cross fingers pointing down.' },
  G: { desc: 'Two closed fists stacked vertically one directly on top of the other.', handType: 'Two Hands (Stacked Fists)', tips: 'Stack right fist on left fist.' },
  H: { desc: 'One flat palm facing upwards with second hand placed flat horizontally across it.', handType: 'Two Hands (Flat Cross)', tips: 'Place flat hand across palm.' },
  I: { desc: 'One index finger pointing straight up vertically, all other fingers closed into fist.', handType: 'One Hand (Index Upright)', tips: 'Single vertical finger.' },
  J: { desc: 'Two index fingers held up forming a right angle / corner together.', handType: 'Two Hands (Index Corner)', tips: 'Form 90-degree corner.' },
  K: { desc: 'Main index pointing upright with second index finger pointing diagonally across its center.', handType: 'Two Hands (Diagonal Cross)', tips: 'Cross finger at angle.' },
  L: { desc: 'Single hand forming an L-shape with thumb extended sideways and index finger upright.', handType: 'One Hand (L-Shape)', tips: 'Form 90-degree L.' },
  M: { desc: 'Flat horizontal palm with 3 fingers pointing upwards against its base.', handType: 'Two Hands (Flat + 3 Fingers)', tips: '3 fingers under flat palm.' },
  N: { desc: 'Flat horizontal palm with 2 fingers pointing upwards against its base.', handType: 'Two Hands (Flat + 2 Fingers)', tips: '2 fingers under flat palm.' },
  O: { desc: 'Single hand forming an O-circle loop with fingertips meeting thumb.', handType: 'One Hand (O-Circle)', tips: 'Form rounded circle.' },
  P: { desc: 'Main index finger pointing upright with second hand forming a circle loop on top.', handType: 'Two Hands (Index + Top Loop)', tips: 'Circle at top of finger.' },
  Q: { desc: 'Index finger hooked through non-dominant thumb/index circle loop.', handType: 'Two Hands (Hooked Circle)', tips: 'Hook finger into loop.' },
  R: { desc: 'One open flat palm with second index finger touching the center of the palm.', handType: 'Two Hands (Palm + Center Point)', tips: 'Point to palm center.' },
  S: { desc: 'Pinky finger hooked against second index finger.', handType: 'Two Hands (Hooked Pinky)', tips: 'Hook pinky to index.' },
  T: { desc: 'Two index fingers forming a T-shape (one vertical, one horizontal across top).', handType: 'Two Hands (T-Shape Cross)', tips: 'Form capital T.' },
  U: { desc: 'Single hand forming a U-curve facing upwards.', handType: 'One Hand (U-Curve)', tips: 'Fingers curved up.' },
  V: { desc: 'Single hand with index and middle fingers extended in a V-shape.', handType: 'One Hand (V-Sign)', tips: 'Spread index & middle.' },
  W: { desc: 'Two hands interlacing all fingers together tightly.', handType: 'Two Hands (Interlaced Fingers)', tips: 'Interlock fingers.' },
  X: { desc: 'Two index fingers crossed over each other in an X-shape.', handType: 'Two Hands (Crossed X)', tips: 'Cross index fingers.' },
  Y: { desc: 'Index pointing upright with second hand pointing at its wrist/base.', handType: 'Two Hands (Index + Wrist Point)', tips: 'Point to wrist base.' },
  Z: { desc: 'One palm held flat vertically with second index finger touching the flat palm side.', handType: 'Two Hands (Vertical Palm + Touch)', tips: 'Touch side of vertical palm.' }
};

const COMMON_SIGNS = [
  { name: 'Hello', symbol: '👋', category: 'Greetings', desc: 'Raise right hand near head with open palm and wave side-to-side.' },
  { name: 'Thank You', symbol: '🙏', category: 'Polite', desc: 'Touch fingertips to chin and move hand forward towards person.' },
  { name: 'Please', symbol: '🤲', category: 'Polite', desc: 'Place flat hand on chest and move in a circular motion.' },
  { name: 'Help / Emergency', symbol: '🚨', category: 'Emergency', desc: 'Place left open palm flat, right fist on top with thumb up.' },
  { name: 'Doctor / Hospital', symbol: '🏥', category: 'Medical', desc: 'Touch two fingers to wrist pulse area, then form cross.' },
  { name: 'Water / Drink', symbol: '💧', category: 'Daily', desc: 'Form W shape with fingers and touch index finger to lip.' },
  { name: 'Food / Eat', symbol: '🍱', category: 'Daily', desc: 'Bring fingertips together and touch to mouth repeatedly.' },
  { name: 'Yes', symbol: '👍', category: 'Basics', desc: 'Form a fist and nod hand up and down like a head nod.' },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'How do you sign "A" in official Indian Sign Language (ISL)?',
    options: ['Two hands forming a roof / A-frame with fingertips touching at top', 'Single fist with side thumb', 'Wave open palm', 'Cross index fingers'],
    correct: 0
  },
  {
    id: 2,
    question: 'How is "T" signed in official ISL?',
    options: ['Two index fingers forming a T-shape (one vertical, one horizontal on top)', 'Open flat hand', 'Interlaced fingers', 'Single pinky up'],
    correct: 0
  },
  {
    id: 3,
    question: 'What is the official ISL sign for "W"?',
    options: ['Two hands interlacing all fingers together', 'Single V sign', 'Point to wrist', 'Form C curve'],
    correct: 0
  }
];

// Helper to render authentic multi-hand / single-hand SVG diagram matching ISLRTC chart
const HandDiagramSVG: React.FC<{ symbol: string }> = ({ symbol }) => {
  const isTwoHanded = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'].includes(symbol);

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full text-indigo-400">
      {/* Background container */}
      <rect width="200" height="200" rx="24" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      
      {/* Hand Model Graphics */}
      {symbol === 'A' && (
        <>
          {/* Two hands forming A-frame roof */}
          <line x1="60" y1="140" x2="100" y2="50" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />
          <line x1="140" y1="140" x2="100" y2="50" stroke="#ec4899" strokeWidth="14" strokeLinecap="round" />
          <line x1="80" y1="110" x2="120" y2="110" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
          <circle cx="100" cy="50" r="10" fill="#ffe600" />
        </>
      )}

      {symbol === 'B' && (
        <>
          {/* Double eyeglass circles */}
          <circle cx="70" cy="90" r="28" fill="none" stroke="#6366f1" strokeWidth="10" />
          <circle cx="130" cy="90" r="28" fill="none" stroke="#ec4899" strokeWidth="10" />
          <circle cx="70" cy="90" r="6" fill="#ffe600" />
          <circle cx="130" cy="90" r="6" fill="#ffe600" />
        </>
      )}

      {symbol === 'C' && (
        <>
          <path d="M 130,50 A 45,45 0 0,0 130,130" fill="none" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" />
          <circle cx="130" cy="50" r="8" fill="#ffe600" />
          <circle cx="130" cy="130" r="8" fill="#ffe600" />
        </>
      )}

      {symbol === 'D' && (
        <>
          <line x1="120" y1="150" x2="120" y2="40" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />
          <path d="M 120,60 A 35,35 0 0,0 120,130" fill="none" stroke="#ec4899" strokeWidth="12" />
          <circle cx="120" cy="40" r="8" fill="#ffe600" />
        </>
      )}

      {symbol === 'T' && (
        <>
          {/* T shape */}
          <line x1="100" y1="150" x2="100" y2="60" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />
          <line x1="60" y1="60" x2="140" y2="60" stroke="#ec4899" strokeWidth="14" strokeLinecap="round" />
          <circle cx="100" cy="60" r="8" fill="#ffe600" />
        </>
      )}

      {symbol === 'X' && (
        <>
          {/* Crossed X */}
          <line x1="60" y1="50" x2="140" y2="130" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />
          <line x1="140" y1="50" x2="60" y2="130" stroke="#ec4899" strokeWidth="14" strokeLinecap="round" />
          <circle cx="100" cy="90" r="8" fill="#ffe600" />
        </>
      )}

      {symbol === 'W' && (
        <>
          {/* Interlaced fingers */}
          {[60, 80, 100, 120, 140].map((x, i) => (
            <line key={i} x1={x} y1="130" x2={x} y2="50" stroke={i % 2 === 0 ? '#6366f1' : '#ec4899'} strokeWidth="10" strokeLinecap="round" />
          ))}
          <circle cx="100" cy="90" r="8" fill="#ffe600" />
        </>
      )}

      {/* Generic fallback SVG for other letters */}
      {!['A', 'B', 'C', 'D', 'T', 'X', 'W'].includes(symbol) && (
        <>
          {isTwoHanded ? (
            <>
              <line x1="80" y1="140" x2="80" y2="50" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />
              <line x1="120" y1="140" x2="120" y2="70" stroke="#ec4899" strokeWidth="14" strokeLinecap="round" />
              <line x1="60" y1="80" x2="140" y2="80" stroke="#38bdf8" strokeWidth="8" />
              <circle cx="80" cy="50" r="8" fill="#ffe600" />
              <circle cx="120" cy="70" r="8" fill="#ffe600" />
            </>
          ) : (
            <>
              <ellipse cx="100" cy="130" rx="35" ry="30" fill="#6366f1" opacity="0.8" />
              <line x1="85" y1="110" x2="85" y2="40" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
              <line x1="105" y1="110" x2="105" y2="35" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
              <circle cx="85" cy="40" r="7" fill="#ffe600" />
              <circle cx="105" cy="35" r="7" fill="#ffe600" />
            </>
          )}
        </>
      )}

      {/* Badge Indicator */}
      <rect x="10" y="10" width="80" height="24" rx="6" fill="#1e293b" />
      <text x="50" y="26" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
        {isTwoHanded ? '2 HANDS' : '1 HAND'}
      </text>

      {/* Letter Title */}
      <text x="100" y="182" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900">
        ISL "{symbol}"
      </text>
    </svg>
  );
};

export const LearnISL: React.FC<LearnISLProps> = ({ isDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState<'alphabets' | 'numbers' | 'phrases' | 'quiz'>('alphabets');
  const [selectedItem, setSelectedItem] = useState<string>('A');
  
  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswerQuiz = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    if (optionIdx === QUIZ_QUESTIONS[currentQuizIdx].correct) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentQuizIdx + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQuizIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setCurrentQuizIdx(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
  };

  const currentDetails = ALPHABET_DETAILS[selectedItem] || {
    desc: `Form hand position for ISL symbol "${selectedItem}".`,
    handType: 'Official ISL Hand Model',
    tips: 'Practice two-handed alignment.'
  };

  return (
    <div className="space-y-6">
      
      {/* Category Header Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h2 className="text-lg font-bold flex items-center space-x-2">
            <span>🎓</span>
            <span>Official ISL Alphabets & Gestures Portal</span>
          </h2>
          <p className="text-xs text-slate-400">Authentic Indian Sign Language Research & Training Centre (ISLRTC) two-hand & single-hand alphabet charts.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'alphabets', label: '🔤 ISL Alphabets (A-Z)' },
            { id: 'numbers', label: '🔢 Numbers (0-9)' },
            { id: 'phrases', label: '💬 Phrases & Signs' },
            { id: 'quiz', label: '🏆 ISL Quiz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as any);
                if (tab.id === 'numbers') setSelectedItem('1');
                if (tab.id === 'alphabets') setSelectedItem('A');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alphabets Tab */}
      {activeCategory === 'alphabets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Grid: A to Z buttons */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border shadow-xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-slate-300 mb-4">Select ISL Alphabet (A-Z)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {ALPHABETS.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedItem(letter)}
                  className={`p-3 rounded-xl border font-black text-xl text-center transition-all ${
                    selectedItem === letter
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-indigo-400 scale-105 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Visual ISL Hand Diagram & Guide */}
          <div className={`lg:col-span-5 p-6 rounded-2xl border shadow-xl flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-indigo-400 flex items-center space-x-2">
                  <span>🤟</span>
                  <span>ISL Sign Model: "{selectedItem}"</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {currentDetails.handType}
                </span>
              </div>

              {/* Hand Diagram Graphic */}
              <div className="w-52 h-52 mx-auto my-3">
                <HandDiagramSVG symbol={selectedItem} />
              </div>

              {/* Description & Tips */}
              <div className="space-y-3 mt-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block mb-1">Official ISL Gesture Instructions:</span>
                  <p className="text-slate-400 leading-relaxed">{currentDetails.desc}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-center space-x-2">
                  <span>💡</span>
                  <span><strong>ISL Practice Tip:</strong> {currentDetails.tips}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Numbers Tab */}
      {activeCategory === 'numbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-7 p-6 rounded-2xl border shadow-xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-slate-300 mb-4">Select ISL Number (0-9)</h3>
            <div className="grid grid-cols-5 gap-3">
              {NUMBERS.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedItem(num)}
                  className={`p-4 rounded-xl border font-black text-2xl text-center transition-all ${
                    selectedItem === num
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white border-emerald-400 scale-105 shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className={`lg:col-span-5 p-6 rounded-2xl border shadow-xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-base font-bold text-emerald-400 mb-3">ISL Number "{selectedItem}" Visual Diagram</h3>
            <div className="w-48 h-48 mx-auto my-4">
              <HandDiagramSVG symbol={selectedItem} />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Form {selectedItem} finger position(s) facing forward at chest level.
            </p>
          </div>
        </div>
      )}

      {/* Phrases Tab */}
      {activeCategory === 'phrases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMMON_SIGNS.map((item) => (
            <div
              key={item.name}
              className={`p-5 rounded-2xl border shadow-lg space-y-3 transition-all hover:border-indigo-500/50 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.symbol}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.category}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-100">{item.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Tab */}
      {activeCategory === 'quiz' && (
        <div className={`p-8 rounded-2xl border shadow-xl max-w-2xl mx-auto transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400">
                  Question {currentQuizIdx + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs font-semibold text-emerald-400">Score: {score}</span>
              </div>

              <h3 className="text-lg font-bold">
                {QUIZ_QUESTIONS[currentQuizIdx].question}
              </h3>

              <div className="space-y-3">
                {QUIZ_QUESTIONS[currentQuizIdx].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuiz(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left text-sm font-semibold border transition-all ${
                      selectedAnswer === idx
                        ? idx === QUIZ_QUESTIONS[currentQuizIdx].correct
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <span className="text-5xl block">🎉</span>
              <h3 className="text-2xl font-bold">Quiz Completed!</h3>
              <p className="text-sm text-slate-400">
                You scored <span className="text-emerald-400 font-bold">{score}</span> out of {QUIZ_QUESTIONS.length}
              </p>

              <button
                onClick={resetQuiz}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
