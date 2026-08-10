import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem } from '../types';

interface SignToTextProps {
  selectedLanguage: string;
  isDarkMode: boolean;
  onAddHistory: (item: HistoryItem) => void;
}

const ALPHABETS_LIST = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const SAMPLE_SIGNS: string[] = [];

export const SignToText: React.FC<SignToTextProps> = ({ selectedLanguage, isDarkMode, onAddHistory }) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [useWebcam, setUseWebcam] = useState<boolean>(true);
  const [autoAppend, setAutoAppend] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMediaPipeActive, setIsMediaPipeActive] = useState<boolean>(false);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [detectedSentence, setDetectedSentence] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [aiCorrected, setAiCorrected] = useState<string>('');
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelReloadKey, setModelReloadKey] = useState<number>(0);

  // Performance & Model Controls
  const [fastMode, setFastMode] = useState<boolean>(true); // modelComplexity: 0 (Fast Lite WASM) vs 1 (Full)
  const [resolution, setResolution] = useState<{ width: number; height: number }>({ width: 640, height: 480 });
  const [maxHands, setMaxHands] = useState<number>(1);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showPerfControls, setShowPerfControls] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPrintedSignRef = useRef<string>('');
  const printTimeoutRef = useRef<any>(null);
  const latestLandmarksRef = useRef<any[] | null>(null);

  const isMediaPipeActiveRef = useRef<boolean>(false);
  const isProcessingFrameRef = useRef<boolean>(false);
  const isPredictingRef = useRef<boolean>(false);

  // Auto-print recognized gesture to output sentence box when gesture is held
  useEffect(() => {
    if (!autoAppend) return;

    if (!currentGesture || currentGesture === 'Unknown') {
      lastPrintedSignRef.current = '';
      if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
      return;
    }

    const letter = currentGesture.split(' ')[0];
    if (letter !== lastPrintedSignRef.current) {
      if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
      
      printTimeoutRef.current = setTimeout(() => {
        lastPrintedSignRef.current = letter;
        handleAppendSign(letter);
      }, 1200); // Automatically print sign after holding for 1.2s
    }

    return () => {
      if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
    };
  }, [currentGesture, autoAppend]);

  // Initialize MediaPipe Hands & Webcam stream with optimized performance options
  useEffect(() => {
    let cameraInstance: any = null;
    let handsInstance: any = null;

    if (isCameraActive && useWebcam) {
      setIsModelLoading(true);
      setCameraError(null);
      
      const win = window as any;
      if (win.Hands && videoRef.current && canvasRef.current) {
        try {
          handsInstance = new win.Hands({
            locateFile: (file: string) => `/mediapipe/hands/${file}`
          });

          handsInstance.setOptions({
            maxNumHands: maxHands,
            modelComplexity: fastMode ? 0 : 1, // 0 = Lite (Fast WASM execution), 1 = Full
            minDetectionConfidence: 0.35,
            minTrackingConfidence: 0.35
          });

          handsInstance.onResults((results: any) => {
            setIsModelLoading(false);
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!canvas || !video) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (video.videoWidth && video.videoHeight) {
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
              }
            } else {
              canvas.width = resolution.width;
              canvas.height = resolution.height;
            }

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              if (!isMediaPipeActiveRef.current) {
                isMediaPipeActiveRef.current = true;
                setIsMediaPipeActive(true);
              }
              latestLandmarksRef.current = results.multiHandLandmarks;
              
              if (showSkeleton) {
                const HAND_CONNECTIONS = win.HAND_CONNECTIONS || [
                  [0, 1], [1, 2], [2, 3], [3, 4],
                  [0, 5], [5, 6], [6, 7], [7, 8],
                  [5, 9], [9, 10], [10, 11], [11, 12],
                  [9, 13], [13, 14], [14, 15], [15, 16],
                  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
                ];

                ctx.lineWidth = 3;
                ctx.strokeStyle = '#00F0FF';
                for (const landmarks of results.multiHandLandmarks) {
                  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
                    const p1 = landmarks[startIdx];
                    const p2 = landmarks[endIdx];
                    if (p1 && p2) {
                      ctx.beginPath();
                      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                      ctx.stroke();
                    }
                  }

                  ctx.fillStyle = '#FFE600';
                  for (const lm of landmarks) {
                    ctx.beginPath();
                    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
                    ctx.fill();
                  }
                }
              }
            } else {
              if (isMediaPipeActiveRef.current) {
                isMediaPipeActiveRef.current = false;
                setIsMediaPipeActive(false);
                setCurrentGesture('');
                setConfidence(0);
              }
              latestLandmarksRef.current = null;
            }
            ctx.restore();
          });

          if (win.Camera) {
            cameraInstance = new win.Camera(videoRef.current, {
              onFrame: async () => {
                // Frame-skipping lock: skip frames if previous WASM frame is still processing
                if (videoRef.current && handsInstance && !isProcessingFrameRef.current) {
                  isProcessingFrameRef.current = true;
                  try {
                    await handsInstance.send({ image: videoRef.current });
                  } catch (e) {
                    console.error("MediaPipe frame send error:", e);
                  } finally {
                    isProcessingFrameRef.current = false;
                  }
                }
              },
              width: resolution.width,
              height: resolution.height
            });
            cameraInstance.start();
          }
        } catch (err) {
          console.error("MediaPipe initialization error:", err);
        }
      } else {
        navigator.mediaDevices?.getUserMedia({ video: { width: resolution.width, height: resolution.height } })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch((err) => {
            setCameraError("Camera access denied or device not found. Switch to AI Simulator.");
          });
      }
    }

    return () => {
      if (cameraInstance) {
        try { cameraInstance.stop(); } catch {}
      }
      if (handsInstance) {
        try { handsInstance.close(); } catch {}
      }
    };
  }, [isCameraActive, useWebcam, modelReloadKey, fastMode, resolution, maxHands, showSkeleton]);

  // Fast Polling interval (250ms) to send landmarks to backend for prediction
  useEffect(() => {
    if (!isCameraActive || (!useWebcam && !latestLandmarksRef.current)) return;

    const interval = setInterval(() => {
      if (useWebcam && !latestLandmarksRef.current) {
        // Hand is out of frame, do not send to backend
        return;
      }

      if (isPredictingRef.current) {
        // Avoid queueing multiple fetch calls if network/backend is busy
        return;
      }

      isPredictingRef.current = true;

      let bodyData: any = { image_base64: 'frame_placeholder' };
      
      if (useWebcam && latestLandmarksRef.current) {
        // Flatten landmarks
        const flatLandmarks = [];
        for (const hand of latestLandmarksRef.current) {
          const handPoints = [];
          for (const lm of hand) {
            handPoints.push(lm.x, lm.y, lm.z || 0);
          }
          flatLandmarks.push(handPoints);
        }
        bodyData = { landmarks: flatLandmarks };
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      fetch(`${API_URL}/api/ml/isl/isl-recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.recognized_text !== undefined && data.recognized_text !== "") {
            setCurrentGesture(data.recognized_text);
            setConfidence(data.confidence);
          } else if (data.recognized_text === "") {
             setCurrentGesture("Unknown");
             setConfidence(data.confidence);
          }
        })
        .catch(() => {
          if (!useWebcam) {
            const randomSign = SAMPLE_SIGNS[Math.floor(Math.random() * SAMPLE_SIGNS.length)];
            const randomConf = (88 + Math.random() * 11).toFixed(1);
            setCurrentGesture(randomSign);
            setConfidence(parseFloat(randomConf));
          }
        })
        .finally(() => {
          isPredictingRef.current = false;
        });
    }, 250); // Polling every 250ms for instant real-time predictions

    return () => clearInterval(interval);
  }, [isCameraActive, useWebcam]);

  const updateGrammar = (rawText: string) => {
    if (!rawText) {
      setAiCorrected('');
      return;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/ml/isl/grammar-correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_tokens: rawText, language: selectedLanguage })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.corrected_sentence) setAiCorrected(data.corrected_sentence);
      })
      .catch(() => {
        setAiCorrected(`${rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase()}.`);
      });
  };

  const handleAppendSign = (sign: string) => {
    setDetectedSentence((prev) => {
      const newRaw = prev ? `${prev} ${sign}` : sign;
      updateGrammar(newRaw);
      return newRaw;
    });
  };

  const handleBackspace = () => {
    setDetectedSentence((prev) => {
      if (!prev) return prev;
      const tokens = prev.trim().split(' ');
      tokens.pop();
      const newRaw = tokens.join(' ');
      updateGrammar(newRaw);
      return newRaw;
    });
  };

  const handleAppendCurrentGesture = () => {
    const letter = currentGesture.split(' ')[0];
    handleAppendSign(letter);
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(aiCorrected || detectedSentence);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setDetectedSentence('');
    setAiCorrected('');
    lastPrintedSignRef.current = '';
  };

  const handleSaveToHistory = () => {
    if (!detectedSentence) return;
    onAddHistory({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceType: 'sign',
      originalContent: detectedSentence,
      translatedText: aiCorrected || detectedSentence,
      language: selectedLanguage,
      confidence: confidence
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left: Camera Feed & MediaPipe Hand Tracking Overlay */}
      <div className="lg:col-span-7 space-y-4">
        <div className={`relative rounded-2xl overflow-hidden border shadow-xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-semibold text-slate-200">
                {useWebcam ? (isMediaPipeActive ? '🟢 Live MediaPipe Hand Recognition' : '📹 Searching for Hand...') : '🤖 AI Gesture Simulator'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFastMode(!fastMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  fastMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
                }`}
                title="Toggle MediaPipe WASM Lite model complexity (0 = Fast, 1 = High Accuracy)"
              >
                {fastMode ? '⚡ Fast Mode (Lite)' : '🎯 High Accuracy'}
              </button>

              <button
                onClick={() => setShowPerfControls(!showPerfControls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  showPerfControls ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="Performance & Camera Settings"
              >
                ⚙️ Tune FPS
              </button>

              <button
                onClick={() => setAutoAppend(!autoAppend)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  autoAppend
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle automatic printing of recognized hand signs into output sentence"
              >
                {autoAppend ? '⚡ Auto-Print: ON' : '⚡ Auto-Print: OFF'}
              </button>

              <button
                onClick={() => setUseWebcam(!useWebcam)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  useWebcam
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {useWebcam ? '📹 Camera' : '🤖 Simulator'}
              </button>

              <button
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isCameraActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {isCameraActive ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>

          {/* Performance Controls Toolbar */}
          {showPerfControls && (
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-400">Resolution:</span>
                <button
                  onClick={() => setResolution({ width: 640, height: 480 })}
                  className={`px-2 py-0.5 rounded border ${resolution.width === 640 ? 'bg-emerald-600 border-emerald-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  640x480 (Recommended Fast)
                </button>
                <button
                  onClick={() => setResolution({ width: 1280, height: 720 })}
                  className={`px-2 py-0.5 rounded border ${resolution.width === 1280 ? 'bg-emerald-600 border-emerald-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  1280x720 (High Res)
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-400">Max Hands:</span>
                <button
                  onClick={() => setMaxHands(1)}
                  className={`px-2 py-0.5 rounded border ${maxHands === 1 ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  1 Hand (Faster)
                </button>
                <button
                  onClick={() => setMaxHands(2)}
                  className={`px-2 py-0.5 rounded border ${maxHands === 2 ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  2 Hands
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-400">Landmarks Overlay:</span>
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-2 py-0.5 rounded border ${showSkeleton ? 'bg-teal-600 border-teal-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {showSkeleton ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          )}

          {/* Camera Viewport Area */}
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
            {isCameraActive ? (
              <div className="relative w-full h-full flex items-center justify-center">
                
                {useWebcam ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    />
                  </>
                ) : null}

                {/* Camera Error / Permission Banner */}
                {cameraError && useWebcam && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-20 space-y-3">
                    <span className="text-4xl">⚠️</span>
                    <div className="text-sm font-semibold text-rose-400 max-w-md">{cameraError}</div>
                    <button
                      onClick={() => setUseWebcam(false)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Switch to AI Simulator Mode
                    </button>
                  </div>
                )}

                {/* Top-Left Overlay: Loading Model OR Detected Sign */}
                <div className="absolute top-4 left-4 z-20 flex flex-col items-start space-y-2">
                  {isModelLoading && useWebcam ? (
                    <div className="bg-amber-500/90 text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse flex items-center shadow-lg backdrop-blur-md border border-amber-400">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Loading AI Model...
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-indigo-500/40 shadow-lg flex items-center space-x-3">
                      <span className="text-2xl">🤟</span>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Detected ISL Sign / Alphabet</div>
                        <div className="text-xl font-black text-indigo-400">{currentGesture}</div>
                      </div>
                    </div>
                  )}

                  {isCameraActive && useWebcam && (
                    <button 
                      onClick={() => setModelReloadKey(k => k + 1)}
                      className="bg-slate-800/90 hover:bg-slate-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition shadow-lg backdrop-blur-md border border-slate-600 flex items-center"
                      title="Reload Model"
                    >
                      <span className="mr-1">↻</span> Reload
                    </button>
                  )}
                </div>

                {/* Live Confidence Gauge */}
                {!isModelLoading && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-emerald-500/40 shadow-lg flex items-center space-x-3 z-20">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Confidence</div>
                      <div className="text-lg font-black text-emerald-400">{confidence}%</div>
                    </div>
                  </div>
                )}

                {/* Add Current Recognized Sign Button Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center">
                  <button
                    onClick={handleAppendCurrentGesture}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl flex items-center space-x-2 transition-all scale-105"
                  >
                    <span>➕ Print Recognized Alphabet "{currentGesture.split(' ')[0]}" Now</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-slate-500">
                <span className="text-5xl block mb-2">📷</span>
                <p>Camera is currently paused. Click "Start Camera" to enable real-time detection.</p>
              </div>
            )}
          </div>

          {/* Quick Insert Alphabet Bar */}
          <div className="p-4 bg-slate-900/30 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Quick Click to Print ISL Alphabets (A-Z):</div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {ALPHABETS_LIST.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleAppendSign(letter)}
                  className="w-8 h-8 rounded-lg bg-indigo-950/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/40 text-xs font-bold transition-all hover:scale-110"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Right: Real-time Translation & AI Sentence Formation Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between h-full transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <span>📝</span>
                <span>Recognized Output</span>
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Language: {selectedLanguage.toUpperCase()}
              </span>
            </div>

            {/* Raw Detected Sequence */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Raw Detected Sign Tokens / Letters</label>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-base font-mono text-indigo-300 min-h-[60px] flex items-center tracking-wide">
                {detectedSentence || <span className="text-slate-600 italic">Waiting for sign input...</span>}
              </div>
            </div>

            {/* AI Grammar Corrected Sentence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                  <span>✨</span>
                  <span>AI Grammatical Sentence</span>
                </label>
                <span className="text-[10px] text-slate-500">NLP Powered</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-800/40 text-lg font-bold text-emerald-200 min-h-[75px] flex items-center shadow-inner">
                {aiCorrected || <span className="text-slate-600 italic font-normal">AI sentence will be auto-generated here...</span>}
              </div>
            </div>

            {/* Confidence Score Meter */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Detection Accuracy</span>
                <span className="text-emerald-400">{confidence}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-teal-300 h-full transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-3">
            <button
              onClick={handleSpeak}
              disabled={!detectedSentence || isSpeaking}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isSpeaking ? '🔊 Speaking...' : '🔊 Speak Text'}</span>
            </button>

            <button
              onClick={handleSaveToHistory}
              disabled={!detectedSentence}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-sm transition-all"
              title="Save translation to history log"
            >
              💾 Save
            </button>

            <button
              onClick={handleBackspace}
              disabled={!detectedSentence}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 font-semibold text-sm transition-all"
              title="Delete last detected sign"
            >
              ⌫ Backspace
            </button>

            <button
              onClick={handleClear}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-sm transition-all"
              title="Clear current translation"
            >
              🗑️ Clear
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
