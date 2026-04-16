from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app) 

# ==========================================
# 1. Machine Learning Model එක CSV එකෙන් පුහුණු කිරීම
# ==========================================

print("Loading dataset and training the Random Forest Model...")

# CSV ගොනුව කියවීම
try:
    df = pd.read_csv('server_data.csv')
    
    # පරාමිති 10 වෙන් කර ගැනීම (X)
    X_train = df[['cpu', 'memory', 'disk', 'load_avg', 'query_time', 'connections', 'slow_queries', 'errors', 'latency', 'throttling']]
    
    # පිළිතුරු / තත්ත්වයන් වෙන් කර ගැනීම (y)
    y_train = df['status']
    
    # Random Forest Classifier එක සෑදීම සහ පුහුණු කිරීම
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    print("Model training successful!")
    
except Exception as e:
    print(f"Error loading dataset: {e}")
    # CSV එක නැති වුණොත් Backup එකක් විදිහට පරණ විදිහට Train කිරීම
    X_train = np.array([[30,40,10,0.5,20,50,0,0,15,0], [80,85,60,2.5,150,300,5,2,80,5], [95,98,90,5.0,500,800,20,10,200,20]])
    y_train = ['Healthy', 'Warning', 'Critical']
    rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
    rf_model.fit(X_train, y_train)

# ==========================================
# 2. React Dashboard එකට දත්ත යවන API
# ==========================================

@app.route('/api/ml-health', methods=['GET'])
def get_ml_health():
    # දැනට සර්වර් එකේ තියෙනවා යැයි උපකල්පනය කරන දත්ත (Current Live Metrics)
    # මේ අගයන් වෙනස් කර බලන්න ප්‍රතිඵලය වෙනස් වෙනවද කියා (උදා: CPU එක 95 කළොත් Critical එයි)
    current_metrics = pd.DataFrame([{
        'cpu': 42, 
        'memory': 68, 
        'disk': 12, 
        'load_avg': 1.2, 
        'query_time': 45, 
        'connections': 128, 
        'slow_queries': 0, 
        'errors': 0, 
        'latency': 25, 
        'throttling': 0
    }])
    
    # Model එක මගින් තත්ත්වය අනුමාන කිරීම (Prediction)
    prediction = rf_model.predict(current_metrics)[0]
    
    # විශ්වාසනීයතා අගය (Confidence Score %) ගණනය කිරීම
    probabilities = rf_model.predict_proba(current_metrics)[0]
    confidence_score = round(max(probabilities) * 100, 1)
    
    # සර්වර් සහ Database තත්ත්වය නිර්ණය කිරීම
    server_status = "Stable" if prediction == 'Healthy' else "Risky"
    db_status = "Stable" if prediction == 'Healthy' else "Risky"
    
    # React එකට JSON විදිහට දත්ත යැවීම
    return jsonify({
        "system_status": prediction,
        "confidence": confidence_score,
        "server_health": server_status,
        "database_health": db_status,
        "metrics": {
            "cpu": int(current_metrics.iloc[0]['cpu']),
            "memory": int(current_metrics.iloc[0]['memory']),
            "disk": int(current_metrics.iloc[0]['disk']),
            "query_time": int(current_metrics.iloc[0]['query_time']),
            "connections": int(current_metrics.iloc[0]['connections']),
            "slow_queries": int(current_metrics.iloc[0]['slow_queries']),
            "errors": int(current_metrics.iloc[0]['errors'])
        }
    })

if __name__ == '__main__':
    print("Backend API is running on http://13.51.70.185:5000/api/ml-health")
    app.run(debug=True, port=5000)