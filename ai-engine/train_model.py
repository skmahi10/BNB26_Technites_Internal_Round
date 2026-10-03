import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os

# Create a directory to store the trained model weights
os.makedirs('models', exist_ok=True)

# Simulated historical test data: [accuracy, error_rate]
# Represents typical, healthy model lifecycle metrics
X_train = np.array([
    [0.95, 0.05], [0.92, 0.08], [0.89, 0.11], [0.98, 0.02], 
    [0.91, 0.09], [0.85, 0.15], [0.97, 0.03], [0.94, 0.06]
])

# Initialize and train the Anomaly Detector
model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X_train)

# Save the model
with open('models/anomaly_detector.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Anomaly detection model trained and saved to models/anomaly_detector.pkl")