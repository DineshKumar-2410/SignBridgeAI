import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

def normalize_hand(flat_hand):
    if len(flat_hand) < 3 * 21:
        return flat_hand
        
    wx, wy, wz = flat_hand[0], flat_hand[1], flat_hand[2]
    
    # Middle finger base is landmark 9 (index 9*3 = 27)
    mx, my = flat_hand[27], flat_hand[28]
    
    import math
    real_dist = math.hypot(mx - wx, my - wy)
    if real_dist < 0.0001:
        real_dist = 0.0001
        
    scale = 0.3 / real_dist
    
    norm_hand = []
    for i in range(len(flat_hand) // 3):
        nx = (flat_hand[i*3] - wx) * scale
        ny = (flat_hand[i*3 + 1] - wy) * scale + 1.0
        nz = (flat_hand[i*3 + 2] - wz) * scale
        norm_hand.extend([nx, ny, nz])
        
    return norm_hand

def generate_hand(blueprint, noise_level=0.02):
    """
    Blueprint is a dict of finger extensions:
    'thumb': bool, 'index': bool, 'middle': bool, 'ring': bool, 'pinky': bool
    We generate a 63-element array simulating the landmarks (x, y, z).
    """
    # Base wrist
    hand = [0.0, 1.0, 0.0]
    
    def add_finger(is_extended, base_x, base_y):
        pts = []
        # First point is the base (MCP joint), which is fixed relative to the wrist
        pts.extend([base_x, base_y, 0.0])
        cur_y = base_y
        for i in range(3):
            if is_extended:
                cur_y -= 0.1 # straight up
            else:
                cur_y += 0.05 # curled down
            pts.extend([base_x, cur_y, 0.0])
        return pts

    # Thumb (approximate)
    if blueprint.get('thumb'):
        hand.extend([-0.2, 0.8, 0.0, -0.3, 0.6, 0.0, -0.4, 0.5, 0.0, -0.5, 0.4, 0.0])
    else:
        hand.extend([-0.1, 0.9, 0.0, -0.1, 0.85, 0.0, 0.0, 0.8, 0.0, 0.1, 0.8, 0.0])
        
    hand.extend(add_finger(blueprint.get('index'), -0.1, 0.7))
    hand.extend(add_finger(blueprint.get('middle'), 0.0, 0.7))
    hand.extend(add_finger(blueprint.get('ring'), 0.1, 0.7))
    hand.extend(add_finger(blueprint.get('pinky'), 0.2, 0.7))
    
    # Normalize the hand to match the inference pipeline
    hand = normalize_hand(hand)
    
    hand_arr = np.array(hand)
    noise = np.random.normal(0, noise_level, 63)
    return hand_arr + noise

def generate_synthetic_data(samples_per_class=300):
    classes = {
        # Baseline Idle gesture so the model has something to fall back on
        "Idle": {'thumb': False, 'index': False, 'middle': False, 'ring': False, 'pinky': False}
    }
    
    X = []
    y = []
    np.random.seed(42)
    
    for cls, blueprint in classes.items():
        for _ in range(samples_per_class):
            hand1 = generate_hand(blueprint, noise_level=0.04)
            # Second hand is usually empty/idle for simple static models unless two-handed
            hand2 = np.zeros(63) + np.random.normal(0, 0.01, 63)
            
            feature_vector = np.concatenate([hand1, hand2])
            X.append(feature_vector)
            y.append(cls)
            
    return np.array(X), np.array(y)

if __name__ == "__main__":
    print("Generating realistic synthetic ISL landmark data for Random Forest...")
    X, y = generate_synthetic_data(samples_per_class=500)
    
    print("Training RandomForestClassifier ML Model...")
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    clf = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42)
    clf.fit(X, y_encoded)
    
    print(f"Training Accuracy: {clf.score(X, y_encoded):.2f}")
    
    model_data = {
        'model': clf,
        'label_encoder': le
    }
    
    os.makedirs(r'c:\Users\acer\Desktop\project\backend\ml_models', exist_ok=True)
    model_path = r'c:\Users\acer\Desktop\project\backend\ml_models\isl_model.pkl'
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
        
    print(f"Model successfully saved to {model_path}")
