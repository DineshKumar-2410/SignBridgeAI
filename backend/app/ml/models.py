import os
import math
import pickle
import numpy as np
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ISLInput(BaseModel):
    image_base64: Optional[str] = None
    landmarks: Optional[List[List[float]]] = None

class TrainSample(BaseModel):
    label: str
    features: List[List[float]]

class TrainInput(BaseModel):
    data: List[TrainSample]

class ISLOutput(BaseModel):
    recognized_text: str
    confidence: float
    corrected_sentence: str

class GrammarInput(BaseModel):
    raw_tokens: str
    language: str = "en"

class GrammarOutput(BaseModel):
    corrected_sentence: str

SAMPLE_SIGNS = ["HELLO", "THANK YOU", "PLEASE", "WELCOME", "HELP", "GOOD MORNING", "INDIAN SIGN LANGUAGE", "NAMASTE"]


MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml_models', 'isl_model.pkl')
USER_DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml_models', 'user_dataset.pkl')
clf, le = None, None
if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
            clf = model_data['model']
            le = model_data['label_encoder']
    except Exception as e:
        print(f"Error loading ISL model: {e}")




def normalize_hand(flat_hand):
    if len(flat_hand) < 3 * 21:
        return flat_hand
        
    wx, wy, wz = flat_hand[0], flat_hand[1], flat_hand[2]
    
    # Middle finger base is landmark 9 (index 9*3 = 27)
    mx, my = flat_hand[27], flat_hand[28]
    
    # Real distance from wrist to middle finger base
    import math
    real_dist = math.hypot(mx - wx, my - wy)
    if real_dist < 0.0001:
        real_dist = 0.0001
        
    # Target distance in the synthetic model is 0.3 (wrist at y=1.0, middle base at y=0.7)
    scale = 0.3 / real_dist
    
    norm_hand = []
    for i in range(len(flat_hand) // 3):
        nx = (flat_hand[i*3] - wx) * scale
        ny = (flat_hand[i*3 + 1] - wy) * scale + 1.0
        nz = (flat_hand[i*3 + 2] - wz) * scale
        norm_hand.extend([nx, ny, nz])
        
    return norm_hand

@router.post("/isl-recognize", response_model=ISLOutput)
async def recognize_isl(input: ISLInput):
    recognized_text = ""
    confidence = 0.0

    if input.landmarks:
        if clf is not None:
            features = []
            for i in range(min(2, len(input.landmarks))):
                features.extend(normalize_hand(input.landmarks[i]))
            
            if len(features) < 126:
                features.extend([0.0] * (126 - len(features)))
            else:
                features = features[:126]
                
            try:
                X_input = np.array([features])
                pred = clf.predict(X_input)[0]
                prob = np.max(clf.predict_proba(X_input))
                
                if prob < 0.65:
                    recognized_text = "Unknown"
                elif le is not None and isinstance(pred, (int, np.integer)):
                    recognized_text = le.inverse_transform([pred])[0]
                else:
                    recognized_text = str(pred)
                    
                confidence = round(float(prob) * 100, 1)
            except Exception as e:
                print("Prediction error:", e)
                recognized_text, confidence = "ERROR", 0.0
        else:
            recognized_text, confidence = "MODEL_NOT_FOUND", 0.0
        
    corrected = f"{recognized_text.capitalize()}! Welcome to SignBridge AI." if recognized_text else ""
    
    return {
        "recognized_text": recognized_text,
        "confidence": confidence,
        "corrected_sentence": corrected
    }

@router.post("/grammar-correct", response_model=GrammarOutput)
async def grammar_correct(input: GrammarInput):
    raw = input.raw_tokens.strip()
    if not raw:
        return {"corrected_sentence": ""}
    
    # Combine single letter sequences (e.g. "H E L L O" -> "HELLO")
    parts = raw.split()
    combined_words = []
    current_word = ""

    for p in parts:
        if len(p) == 1 and p.isalpha():
            current_word += p
        else:
            if current_word:
                combined_words.append(current_word)
                current_word = ""
            combined_words.append(p)
    if current_word:
        combined_words.append(current_word)

    sentence = " ".join(combined_words).strip()
    
    # Capitalize and add proper punctuation
    formatted = sentence.capitalize()
    if not formatted.endswith((".", "!", "?")):
        formatted += "."
    
    return {"corrected_sentence": formatted}

import sys
script_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'scripts')
if script_dir not in sys.path:
    sys.path.append(script_dir)

@router.post("/train")
async def train_model(input: TrainInput):
    global clf, le
    
    if not input.data:
        return {"status": "error", "message": "No data provided"}
        
    try:
        # pyrefly: ignore [missing-import]
        from generate_model import generate_synthetic_data
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import LabelEncoder
        
        # 1. Generate synthetic baseline data so the model doesn't forget
        X_synth, y_synth = generate_synthetic_data(samples_per_class=150)
        
        # 2. Extract user's new data
        X_new_user = []
        y_new_user = []
        for sample in input.data:
            flat_features = []
            for i in range(min(2, len(sample.features))):
                flat_features.extend(normalize_hand(sample.features[i]))
            if len(flat_features) < 126:
                flat_features.extend([0.0] * (126 - len(flat_features)))
            else:
                flat_features = flat_features[:126]
                
            X_new_user.append(flat_features)
            y_new_user.append(sample.label)
            
        # 3. Load historical user data and append
        if os.path.exists(USER_DATASET_PATH):
            with open(USER_DATASET_PATH, 'rb') as f:
                historical_data = pickle.load(f)
                X_user = historical_data['X']
                y_user = historical_data['y']
            X_user.extend(X_new_user)
            y_user.extend(y_new_user)
        else:
            X_user = X_new_user
            y_user = y_new_user
            
        # Save updated user data
        with open(USER_DATASET_PATH, 'wb') as f:
            pickle.dump({'X': X_user, 'y': y_user}, f)
            
        # Merge datasets
        X_train = np.vstack((X_synth, np.array(X_user)))
        y_train = np.concatenate((y_synth, np.array(y_user)))
        
        # Retrain model
        new_le = LabelEncoder()
        y_encoded = new_le.fit_transform(y_train)
        
        new_clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
        new_clf.fit(X_train, y_encoded)
        
        # Save model
        model_data = {
            'model': new_clf,
            'label_encoder': new_le
        }
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model_data, f)
            
        # Live reload in memory!
        clf = new_clf
        le = new_le
        
        return {"status": "success", "accuracy": float(new_clf.score(X_train, y_encoded))}
        
    except Exception as e:
        print(f"Error during training: {e}")
        return {"status": "error", "message": str(e)}
