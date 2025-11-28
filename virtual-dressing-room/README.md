# 👗 AI Virtual Dressing Room

A state-of-the-art virtual try-on application that lets users visualize how clothes will look on them using advanced AI. Built with **React** and **Flask**, powered by **Hugging Face's IDM-VTON** model.

![Virtual Try-On Demo](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Backend-Flask-blue)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![AI](https://img.shields.io/badge/AI-IDM--VTON-orange)

## ✨ Features

- **👔 Virtual Try-On**: Upload a photo of yourself and a clothing item to see a realistic simulation.
- **📏 Body Analysis**: Automatically estimates body measurements and shape from your photo.
- **💡 Fashion Advice**: Get personalized styling tips based on your body shape and preferences.
- **⚡ Real-time Processing**: Fast and efficient image processing pipeline.
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices.

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **TailwindCSS** for styling
- **Lucide React** for icons

### Backend
- **Flask** (Python)
- **Gradio Client** for AI model integration
- **OpenCV & NumPy** for image processing

### AI / ML
- **IDM-VTON** (via Hugging Face Spaces) for virtual try-on
- **SegFormer** for body segmentation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/virtual-dressing-room.git
cd virtual-dressing-room
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration (.env)**
Create a `.env` file in the `backend` directory:
```env
# Optional: Add your Hugging Face token for higher rate limits
HF_TOKEN=your_hugging_face_token_here
FLASK_PORT=5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the project root (virtual-dressing-room), and install dependencies.

```bash
# Ensure you are in the root 'virtual-dressing-room' folder
npm install
```

## 🏃‍♂️ Running the Application

### Step 1: Start the Backend
```bash
# In the backend terminal
python app.py
```
*The backend will start on http://localhost:5000*

### Step 2: Start the Frontend
```bash
# In the frontend terminal
npm start
```
*The application will open at http://localhost:3000*

## 📖 Usage Guide

1. **Upload Your Photo**: Use a clear, full-body photo with good lighting.
2. **Upload Clothing**: Upload an image of the clothing item you want to try on (flat lay or mannequin preferred).
3. **Enter Details**: Select the clothing type (Shirt, Dress, etc.) and provide your measurements for better accuracy.
4. **Click "Process"**: The AI will generate your virtual try-on result in 10-30 seconds.

## 🔧 Troubleshooting

- **Backend Connection Error**: Ensure the Flask server is running on port 5000.
- **Slow Processing**: The first request might take longer (30-60s) as models load. Subsequent requests are faster.
- **Quota Exceeded**: If using the free Hugging Face tier, you might hit queue limits. Add a `HF_TOKEN` in `.env` to upgrade.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [IDM-VTON](https://huggingface.co/spaces/yisol/IDM-VTON) for the incredible virtual try-on model.
- [React](https://reactjs.org/) and [Flask](https://flask.palletsprojects.com/) communities.
