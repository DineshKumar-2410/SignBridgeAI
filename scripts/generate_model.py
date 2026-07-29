import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

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
        cur_y = base_y
        for i in range(4):
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
    
    hand_arr = np.array(hand)
    noise = np.random.normal(0, noise_level, 63)
    return hand_arr + noise

def generate_synthetic_data(samples_per_class=300):
    classes = {
        # ISL Alphabets
        "A": {'thumb': True, 'index': False, 'middle': False, 'ring': False, 'pinky': False},
        "B": {'thumb': False, 'index': True, 'middle': True, 'ring': True, 'pinky': True},
        "C": {'thumb': True, 'index': True, 'middle': True, 'ring': True, 'pinky': True},
        "I": {'thumb': False, 'index': False, 'middle': False, 'ring': False, 'pinky': True},
        "L": {'thumb': True, 'index': True, 'middle': False, 'ring': False, 'pinky': False},
        "V": {'thumb': False, 'index': True, 'middle': True, 'ring': False, 'pinky': False},
        "W": {'thumb': False, 'index': True, 'middle': True, 'ring': True, 'pinky': False},
        
        # ISL Common Words (Simulated static keyframes)
        "HELLO": {'thumb': True, 'index': True, 'middle': True, 'ring': True, 'pinky': True},
        "THANK YOU": {'thumb': True, 'index': True, 'middle': True, 'ring': True, 'pinky': True}, 
        "YES": {'thumb': False, 'index': False, 'middle': False, 'ring': False, 'pinky': False},
        "NO": {'thumb': False, 'index': True, 'middle': True, 'ring': False, 'pinky': False},
        "PLEASE": {'thumb': True, 'index': True, 'middle': True, 'ring': True, 'pinky': True}
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
