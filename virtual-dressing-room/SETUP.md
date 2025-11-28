# Virtual Dressing Room - Setup & Usage

## 🚀 Quick Start

### Start Backend
```bash
cd backend
venv\Scripts\python.exe app.py
```
Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
npm start
```
Frontend runs on: `http://localhost:5174`

---

## 📱 Access the App

Open browser and go to:
```
http://localhost:5174/virtual-dressing
```

---

## 🎯 How to Use

1. **Upload Your Photo** - Click "Your Photo" and select an image
2. **Upload Clothing** - Click "Upload Custom Clothing" and select a shirt image
3. **Process** - Click "Try On Custom Clothing"
4. **View Result** - See the blended result in the Output box

---

## 📊 Features

- ✅ Virtual try-on with image blending
- ✅ Fit analysis and recommendations
- ✅ Confidence scoring
- ✅ Beautiful UI with gradient design
- ✅ Real-time processing

---

## 🔧 Backend API

**Endpoint**: `POST http://localhost:5000/api/tryon/process`

**Request**:
```json
{
  "person_image": "base64_encoded_image",
  "clothing_image": "base64_encoded_image",
  "clothing_item": {
    "item_type": "shirt",
    "color": "green",
    "pattern": "solid",
    "size": "M",
    "fit": "regular",
    "style": "casual"
  },
  "body_measurements": {
    "height": 170,
    "chest": 95,
    "waist": 80,
    "hips": 100,
    "shoulder_width": 40,
    "body_shape": "rectangle"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "result_image": "base64_encoded_result",
  "confidence": 0.39,
  "fit_analysis": {
    "fit_rating": 0.0,
    "color_match": 0.75,
    "style_match": 0.80,
    "overall_score": 0.39
  }
}
```

---

## 📁 Project Structure

```
virtual-dressing-room/
├── backend/
│   ├── app.py              # Flask app
│   ├── llm_tryon_service.py # Try-on engine
│   ├── tryon_api.py        # API routes
│   ├── requirements.txt    # Dependencies
│   └── venv/               # Virtual environment
├── src/
│   ├── components/         # React components
│   ├── pages/              # React pages
│   └── App.jsx             # Main app
├── package.json            # Frontend dependencies
└── README.md               # This file
```

---

## ✨ Status

✅ Backend: Running
✅ Frontend: Running
✅ Try-On: Working
✅ Ready to use
