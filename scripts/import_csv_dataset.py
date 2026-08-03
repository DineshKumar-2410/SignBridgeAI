import os
import sys
import csv
import pickle
import argparse
import numpy as np
from sklearn.ensemble import RandomForestClassifier

def import_csv(file_path, label_col_name=None, label_col_idx=-1, skip_header=True):
    print(f"Reading dataset from {file_path}...")
    X_new = []
    y_new = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        if skip_header:
            header = next(reader, None)
            if header and label_col_name:
                try:
                    label_col_idx = header.index(label_col_name)
                except ValueError:
                    print(f"Warning: Label column '{label_col_name}' not found. Defaulting to last column.")
                    label_col_idx = -1
                    
        for row_num, row in enumerate(reader):
            if not row:
                continue
            
            try:
                # Extract label
                label = row[label_col_idx].strip()
                
                # Extract features (exclude label)
                if label_col_idx == -1 or label_col_idx == len(row) - 1:
                    features_raw = row[:-1]
                elif label_col_idx == 0:
                    features_raw = row[1:]
                else:
                    features_raw = row[:label_col_idx] + row[label_col_idx+1:]
                
                # Filter out empty strings
                features = [float(val) for val in features_raw if val.strip()]
                
                # Format detection and padding
                if len(features) == 126:
                    pass # Already perfect (both hands, x,y,z)
                elif len(features) == 63:
                    # One hand (x,y,z), pad the other hand with zeros
                    features = features + [0.0] * 63
                elif len(features) == 42:
                    # One hand (x,y), missing z. We need to insert z=0 for each landmark, then pad the other hand.
                    # MediaPipe hands has 21 landmarks.
                    padded = []
                    for i in range(21):
                        padded.extend([features[i*2], features[i*2+1], 0.0])
                    features = padded + [0.0] * 63
                elif len(features) == 84:
                    # Both hands (x,y), missing z.
                    padded = []
                    for i in range(42):
                        padded.extend([features[i*2], features[i*2+1], 0.0])
                    features = padded
                else:
                    print(f"Skipping row {row_num+2}: Unrecognized feature length ({len(features)}). Expected 42, 63, 84, or 126.")
                    continue
                
                X_new.append(features)
                y_new.append(label)
                
            except ValueError as e:
                print(f"Skipping row {row_num+2}: Invalid data format. {e}")
                
    return X_new, y_new


def merge_and_retrain(X_new, y_new):
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ml_models_dir = os.path.join(project_root, 'backend', 'ml_models')
    os.makedirs(ml_models_dir, exist_ok=True)
    
    user_dataset_path = os.path.join(ml_models_dir, 'user_dataset.pkl')
    
    # 1. Load existing user dataset if it exists
    if os.path.exists(user_dataset_path):
        with open(user_dataset_path, 'rb') as f:
            data = pickle.load(f)
            X_existing = data.get('X', [])
            y_existing = data.get('y', [])
            print(f"Loaded existing user dataset with {len(y_existing)} samples.")
    else:
        X_existing = []
        y_existing = []
        print("No existing user dataset found. Creating a new one.")
        
    # 2. Merge
    X_merged = X_existing + X_new
    y_merged = y_existing + y_new
    print(f"Merged dataset now has {len(y_merged)} samples.")
    
    # 3. Save
    with open(user_dataset_path, 'wb') as f:
        pickle.dump({'X': X_merged, 'y': y_merged}, f)
    print(f"Saved merged dataset to {user_dataset_path}")
    
    # 4. Generate Baseline and Retrain Model
    # Import the baseline generator from generate_model.py
    sys.path.append(os.path.join(project_root, 'scripts'))
    from generate_model import generate_synthetic_data
    
    print("Generating baseline synthetic data (Idle gesture)...")
    X_synth, y_synth = generate_synthetic_data(samples_per_class=150)
    
    print("Training Random Forest Classifier on combined dataset...")
    X_train = np.vstack((X_synth, np.array(X_merged)))
    y_train = np.concatenate((y_synth, np.array(y_merged)))
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    model_path = os.path.join(ml_models_dir, 'isl_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump({'model': clf, 'label_encoder': None}, f)
        
    print(f"Success! Model retrained and saved to {model_path}.")
    print("You may need to restart your backend server if it is currently running.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import MediaPipe landmarks from CSV into SignBridge AI dataset")
    parser.add_argument("--file", required=True, help="Path to the CSV dataset file")
    parser.add_argument("--label_col", default=None, help="Name of the column containing the label (e.g., 'class', 'target'). If not provided, assumes the last column.")
    parser.add_argument("--no_header", action="store_true", help="Set this flag if your CSV does NOT have a header row.")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}")
        sys.exit(1)
        
    X_new, y_new = import_csv(
        args.file, 
        label_col_name=args.label_col,
        skip_header=not args.no_header
    )
    
    if not X_new:
        print("No valid data could be extracted from the CSV.")
        sys.exit(1)
        
    print(f"Successfully parsed {len(X_new)} samples.")
    merge_and_retrain(X_new, y_new)
