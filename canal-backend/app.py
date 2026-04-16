from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
import numpy as np

app = Flask(__name__)
# React එකෙන් එන ඉල්ලීම් වලට ඉඩ ලබා දීම
CORS(app) 

# ==========================================
# 1. Machine Learning Model එක පුහුණු කිරීම (Training)
# ==========================================

# පරාමිති 10 සඳහා බොරු දත්ත (CPU, Memory, Disk, Load, Query Time, Connections, Slow Queries, Errors, Latency, Throttling)
X_train = np.array([
    [30, 40, 10, 0.5, 20, 50, 0, 0, 15, 0],    # ඉතා හොඳ තත්ත්වයක් (Healthy)
    [80, 85, 60, 2.5, 150, 300, 5, 2, 80, 5],  # අවධානය යොමු කළ යුතු (Warning)
    [95, 98, 90, 5.0, 500, 800, 20, 10, 200, 20] # අවදානම් තත්ත්වයක් (Critical)
])

# ඉහත දත්ත වලට අදාළ පිළිතුරු
y_train = ['Healthy', 'Warning', 'Critical']

# Random Forest Classifier එක සෑදීම සහ පුහුණු කිරීම
rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
rf_model.fit(X_train, y_train)

# ==========================================
# 2. React Dashboard එකට දත්ත යවන API Endpoints
# ==========================================

@app.route('/api/ml-health', methods=['GET'])
def get_ml_health():
    # දැනට සර්වර් එකේ තියෙනවා යැයි උපකල්පනය කරන දත්ත (Current Live Metrics)
    current_metrics = np.array([[42, 68, 12, 1.2, 45, 128, 0, 0, 25, 0]])
    
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
            "cpu": current_metrics[0][0],
            "memory": current_metrics[0][1],
            "disk": current_metrics[0][2],
            "query_time": current_metrics[0][4],
            "connections": current_metrics[0][5],
            "slow_queries": current_metrics[0][6],
            "errors": current_metrics[0][7]
        }
    })

# සර්වර් එක Run කිරීම
if __name__ == '__main__':
    print("Backend API is running on http://localhost:5000")
    app.run(debug=True, port=5000)