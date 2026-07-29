import React, { useState, useEffect, useRef } from 'react';

interface TrainModelProps {
  isDarkMode: boolean;
}

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const TrainModel: React.FC<TrainModelProps> = ({ isDarkMode }) => {
  const [selectedLabel, setSelectedLabel] = useState<string>('A');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedFrames, setRecordedFrames] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // To store the collected data before sending to backend
  const [dataset, setDataset] = useState<any[]>([]);

  // Use refs to bypass closure stale state in MediaPipe onResults callback
  const isRecordingRef = useRef(isRecording);
  const selectedLabelRef = useRef(selectedLabel);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  
  useEffect(() => {
    selectedLabelRef.current = selectedLabel;
  }, [selectedLabel]);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    let cameraInstance: any = null;
    let handsInstance: any = null;
    
    setCameraError(null);
    const win = window as any;

    if (win.Hands && videoRef.current && canvasRef.current) {
      try {
        handsInstance = new win.Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3
        });

        handsInstance.onResults((results: any) => {
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
          }

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Draw landmarks
            const HAND_CONNECTIONS = win.HAND_CONNECTIONS || [
              [0, 1], [1, 2], [2, 3], [3, 4],
              [0, 5], [5, 6], [6, 7], [7, 8],
              [5, 9], [9, 10], [10, 11], [11, 12],
              [9, 13], [13, 14], [14, 15], [15, 16],
              [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
            ];

            for (const landmarks of results.multiHandLandmarks) {
              ctx.lineWidth = 4;
              ctx.strokeStyle = '#00F0FF';
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
                ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#000000';
                ctx.stroke();
              }
            }

            // If recording, save the frame data
            if (isRecordingRef.current) {
              const flatLandmarks = [];
              for (const hand of results.multiHandLandmarks) {
                const handPoints = [];
                for (const lm of hand) {
                  handPoints.push(lm.x, lm.y, lm.z || 0);
                }
                flatLandmarks.push(handPoints);
              }
              
              setDataset(prev => [...prev, { label: selectedLabelRef.current, features: flatLandmarks }]);
              setRecordedFrames(prev => {
                if (prev >= 99) {
                  setIsRecording(false);
                  isRecordingRef.current = false;
                  return 100;
                }
                return prev + 1;
              });
            }
          }
          ctx.restore();
        });

        if (win.Camera) {
          cameraInstance = new win.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsInstance) {
                await handsInstance.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720
          });
          cameraInstance.start();
        }
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
      }
    } else {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {
          setCameraError("Camera access denied or device not found.");
        });
    }

    return () => {
      if (cameraInstance) {
        try { cameraInstance.stop(); } catch {}
      }
      if (handsInstance) {
        try { handsInstance.close(); } catch {}
      }
    };
  }, []);

  const handleStartRecording = () => {
    setRecordedFrames(0);
    setIsRecording(true);
  };

  const handleTrainModel = async () => {
    if (dataset.length === 0) return;
    setIsTraining(true);
    setTrainStatus("Training AI Model on backend...");

    try {
      const response = await fetch('http://localhost:8000/api/ml/isl/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataset })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setTrainStatus(`Successfully trained! Model Accuracy: ${(data.accuracy * 100).toFixed(1)}%`);
        setDataset([]); // clear dataset after training
      } else {
        setTrainStatus("Failed to train model.");
      }
    } catch (err) {
      setTrainStatus("Error communicating with backend API.");
    }
    setIsTraining(false);
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
      <h2 className="text-2xl font-black mb-2 flex items-center space-x-3">
        <span>🧠</span>
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Train Custom AI Model
        </span>
      </h2>
      <p className="text-sm text-slate-400 mb-6">Record your own hand gestures to personalize the machine learning model.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Camera Area */}
        <div className="space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
            
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-rose-400 p-4 text-center">
                {cameraError}
              </div>
            )}
            
            {isRecording && (
              <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-rose-500/20 border border-rose-500/50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-300">Recording {recordedFrames}/100</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select Alphabet to Record</label>
              <select 
                value={selectedLabel} 
                onChange={e => setSelectedLabel(e.target.value)}
                disabled={isRecording}
                className={`w-full px-4 py-3 rounded-xl border font-bold text-lg outline-none transition-all ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-300 focus:border-indigo-500 text-slate-900'
                }`}
              >
                {ALPHABETS.map(letter => <option key={letter} value={letter}>Sign "{letter}"</option>)}
              </select>
            </div>
            
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`mt-5 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                isRecording 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {isRecording ? 'Recording...' : '🔴 Start Recording'}
            </button>
          </div>
        </div>

        {/* Dataset & Training Area */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-4">Collected Dataset</h3>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400 font-medium">Total Samples Ready</span>
              <span className="text-2xl font-black text-indigo-400">{dataset.length}</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${Math.min((dataset.length / 500) * 100, 100)}%` }}
              />
            </div>

            <button
              onClick={handleTrainModel}
              disabled={dataset.length === 0 || isTraining}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl ${
                dataset.length === 0 || isTraining
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 scale-[1.02]'
              }`}
            >
              {isTraining ? '⚙️ Training Model...' : '🧠 Train AI Now'}
            </button>

            {trainStatus && (
              <div className={`mt-4 p-4 rounded-lg text-sm font-semibold text-center border ${
                trainStatus.includes('Success') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
                {trainStatus}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-400">How to Train:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Select an alphabet from the dropdown.</li>
              <li>Position your hand clearly in front of the camera.</li>
              <li>Click <b>Start Recording</b> and hold the sign steadily for a few seconds.</li>
              <li>Repeat for any other alphabets you want to teach the AI.</li>
              <li>Click <b>Train AI Now</b>. Your custom signs will be merged with the baseline dataset!</li>
            </ol>
          </div>
        </div>
        
      </div>
    </div>
  );
};
