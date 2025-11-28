# 👗 AI Virtual Dressing Room

> **Transform your online shopping experience with AI-powered virtual try-on technology**

An advanced virtual try-on application that uses cutting-edge AI to help users visualize how clothing will look on them. Built with modern web technologies and powered by state-of-the-art machine learning models.

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?logo=flask)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.12-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Virtual Try-On**: Upload your photo and a clothing item to see realistic try-on results using IDM-VTON technology
- **Instant Results**: Cloud-based AI processing via Hugging Face Spaces for fast, GPU-accelerated try-ons
- **User Authentication**: Secure login and signup with Supabase Auth
- **Personal Gallery**: Auto-save and manage your try-on history with cloud storage
- **Direct Try-On**: Quick try-on mode without login for instant testing

### 🎨 User Experience
- **Modern Dark UI**: Beautiful gradient design with glassmorphism effects
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Drag & Drop Upload**: Intuitive image upload with preview
- **Real-time Feedback**: Progress indicators and status updates
- **Download Results**: Save your virtual try-on images locally

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library with latest features
- **Vite 7.1.12** - Lightning-fast build tool and dev server
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Supabase Client** - Authentication and cloud storage
- **Lucide React** - Beautiful icon library

### Backend
- **Flask 3.0.0** - Lightweight Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Gunicorn** - Production WSGI server
- **OpenCV** - Image processing
- **NumPy & Pillow** - Image manipulation
- **Gradio Client** - Hugging Face integration

### AI/ML
- **IDM-VTON** - State-of-the-art virtual try-on model via Hugging Face (yisol/IDM-VTON)
- **Cloud GPU Processing** - No local GPU required

### Storage & Database
- **Supabase Storage** - Cloud image storage with public CDN
- **Supabase PostgreSQL** - Try-on history database with RLS
- **Row Level Security** - User data isolation and protection

---

## 📁 Project Structure

```
virtual-dressing-room/
├── backend/                      # Flask API server
│   ├── app.py                   # Main application entry point
│   ├── tryon_api.py            # Virtual try-on API endpoints
│   ├── llm_tryon_service.py    # AI model integration service
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # Temporary upload storage (git-ignored)
│
├── virtual-dressing-room/       # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── VirtualTryOnAI.jsx      # Main try-on interface
│   │   │   ├── TryOnGallery.jsx        # User gallery
│   │   │   ├── LoginPage.jsx           # Authentication
│   │   │   ├── Homepage.jsx            # Landing page
│   │   │   └── DirectTryOn.jsx         # Quick try-on
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/
│   │   │   └── QuickTryOn.jsx   # Quick try-on page
│   │   ├── utils/               # Helper functions
│   │   ├── supabase.js          # Supabase client config
│   │   ├── App.jsx              # Main app component
│   │   └── index.jsx            # Entry point
│   ├── package.json             # Node dependencies
│   └── vite.config.js           # Vite configuration
│
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Git**
- **Supabase Account** (free tier works)
- **Hugging Face Token** (free)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/virtual-dressing-room.git
cd virtual-dressing-room
```

### 2️⃣ Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Create `backend/.env`:
```env
# Hugging Face API Token (get from https://huggingface.co/settings/tokens)
HF_TOKEN=your_huggingface_token_here

# Optional: Gemini API for additional features
GEMINI_API_KEY=your_gemini_api_key

# Flask Configuration
FLASK_PORT=5000
```

#### Run Backend Server
```bash
# Development
python app.py

# Production
gunicorn app:app
```

Backend will run at `http://localhost:5000`

### 3️⃣ Frontend Setup

#### Install Dependencies
```bash
cd virtual-dressing-room
npm install
```

#### Configure Environment Variables
Create `virtual-dressing-room/.env`:
```env
# Supabase Configuration (get from https://app.supabase.com)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_URL=http://localhost:5000
```

#### Setup Supabase Storage

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Create Bucket**
3. Create a bucket named `tryon-results`
4. Set as **Public**
5. Configure policies for user access

Or run this SQL in Supabase SQL Editor:
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tryon-results', 'tryon-results', true);

-- Create database table
CREATE TABLE IF NOT EXISTS tryon_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  clothing_type TEXT,
  clothing_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE tryon_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own records
CREATE POLICY "Users can view own tryon history"
  ON tryon_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert own tryon history"
  ON tryon_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own records
CREATE POLICY "Users can delete own tryon history"
  ON tryon_history FOR DELETE
  USING (auth.uid() = user_id);
```

#### Run Frontend Development Server
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4️⃣ Usage
1. Open `http://localhost:5173` in your browser
2. Sign up or login with Supabase Auth
3. Navigate to "Try-On AI"
4. Upload a person image and clothing image
5. Click "Generate Try-On" and wait for AI processing
6. View results instantly and check your gallery for saved try-ons

---

## 🌐 Deployment

### Deploy to Render

#### Backend Service
1. Create new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Add Environment Variables:
   - `HF_TOKEN`
   - `GEMINI_API_KEY`
   - `FLASK_PORT=10000`

#### Frontend Service
1. Create new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `virtual-dressing-room`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL from step above)

---

## 🔑 API Endpoints

### POST `/api/tryon/process`
Process virtual try-on request

**Request Body:**
```json
{
  "person_image": "base64_encoded_image",
  "clothing_image": "base64_encoded_image",
  "user_id": "optional_user_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "result_image": "base64_encoded_result",
  "user_id": "user_uuid"
}
```

---

## 🎨 Design System

### Color Palette
- **Background**: Dark gradient from slate-900 via purple-900 to slate-900
- **Cards**: Glassmorphism with backdrop blur
- **Accents**: Purple to pink gradients
- **Interactive**: Cyan to purple hover effects

### Components
- Animated gradient orbs in background
- Smooth transitions with Framer Motion
- Responsive grid layouts
- Loading states with spinners
- Error handling with user-friendly messages

---

## 🔐 Security Features

- **Environment Variables**: All sensitive data in .env files (git-ignored)
- **Row Level Security**: Supabase RLS policies for data isolation
- **CORS Configuration**: Controlled cross-origin requests
- **User Authentication**: Secure Supabase Auth with JWT tokens
- **Input Validation**: Client and server-side validation

---

## 📊 Features Roadmap

- [x] Virtual try-on with IDM-VTON
- [x] User authentication
- [x] Gallery with cloud storage
- [x] Responsive dark UI
- [ ] Multiple clothing categories
- [ ] Batch try-on processing
- [ ] Social sharing
- [ ] Fashion recommendations
- [ ] Size prediction
- [ ] Outfit combinations

---

## 🐛 Troubleshooting

### Backend Issues
**Problem**: ModuleNotFoundError
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
pip install -r requirements.txt
```

**Problem**: CORS errors
```bash
# Solution: Check FLASK_CORS configuration in app.py
# Ensure frontend URL is whitelisted
```

### Frontend Issues
**Problem**: Environment variables not loading
```bash
# Solution: Restart dev server after adding .env file
npm run dev
```

**Problem**: Supabase connection errors
```bash
# Solution: Verify Supabase URL and anon key in .env
# Check network connectivity to Supabase
```

### AI Processing Issues
**Problem**: Slow try-on generation
```
# This is normal - cloud GPU processing can take 30-60 seconds
# Hugging Face Spaces may have queue times
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👏 Acknowledgments

- **IDM-VTON** - Virtual try-on AI model by [yisol](https://huggingface.co/yisol)
- **Hugging Face** - AI model hosting and inference
- **Supabase** - Backend as a Service
- **TailwindCSS** - Styling framework
- **React & Vite** - Frontend tooling

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">
  <p>Made with ❤️ and AI</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
