import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Zap,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { getCurrentUser, uploadTryOnResult } from "../supabase";
import "./VirtualTryOnAI.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const VirtualTryOnAI = () => {
  const [personImage, setPersonImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("tryon");
  const [backendReady, setBackendReady] = useState(false);

  const personImageRef = useRef(null);
  const clothingImageRef = useRef(null);

  const [fitAnalysis, setFitAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [fashionAdvice, setFashionAdvice] = useState(null);

  const [clothingItem] = useState({
    item_type: "shirt",
    color: "black",
    size: "M",
  });

  const [bodyMeasurements] = useState({
    height: 170,
    chest: 95,
    waist: 80,
    hips: 100,
    shoulder_width: 40,
    body_shape: "rectangle",
  });

  // ============================================
  // BACKEND HEALTH CHECK
  // ============================================
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setBackendReady(true);
        setSuccess("Backend connected successfully!");
      } else {
        setError("Backend not responding correctly.");
      }
    } catch {
      setError("Backend not available (Railway offline or wrong URL).");
    }
  };

  // ============================================
  // IMAGE HANDLING
  // ============================================
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === "person") setPersonImage(event.target.result);
      else setClothingImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ============================================
  // REAL TRY-ON REQUEST
  // ============================================
  const processVirtualTryOn = async () => {
    if (!personImage || !clothingImage)
      return setError("Upload both person and clothing images");

    if (!backendReady) return setError("Backend not connected.");

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentUser = await getCurrentUser();

      const payload = {
        person_image: personImage.split(",")[1],
        clothing_image: clothingImage.split(",")[1],
        user_id: currentUser?.id || null,
      };

      const response = await fetch(`${API_BASE_URL}/api/tryon/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        const resultImageData = `data:image/jpeg;base64,${data.result_image}`;
        setResultImage(resultImageData);
        setSuccess("Virtual try-on completed!");

        if (currentUser) {
          await uploadTryOnResult(currentUser.id, resultImageData);
        }
      } else {
        setError(data.message || "Try-on failed");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MOCK AI FEATURES (DETAILED)
  // ============================================
  const analyzeBody = async () => {
    setSuccess(null);
    setError(null);

    const MOCK = {
      status: "success",
      body_shape: "Rectangle",
      proportions: {
        shoulders: "Slightly wider",
        waist: "Moderately defined",
        hips: "Similar to shoulders",
      },
      posture: "Neutral posture, good body alignment",
      analysis:
        "Your body shape is a rectangle, meaning your shoulders and hips are similar in width with a less defined waist. Clothes that add structure on top or definition at the waist look best.",
    };

    setSuccess("Body analysis completed!");
    setFitAnalysis(MOCK);
  };

  const getFashionAdvice = async () => {
    const MOCK = {
      status: "success",
      advice:
        "With a rectangle body shape, choose clothing that adds visual curves. Go for layered outfits, belted jackets, A-line shirts, and contrast colors. Avoid boxy fits.",
    };

    setFashionAdvice(MOCK.advice);
    setSuccess("Fashion advice generated!");
  };

  const getRecommendations = async () => {
    const MOCK = {
      status: "success",
      recommendations: [
        "Slim-fit black jeans with structured shirts",
        "Layered outfits with contrast jackets",
        "Vertical stripe shirts for height enhancement",
        "Avoid oversized boxy clothing",
      ],
    };

    setRecommendations(MOCK.recommendations);
    setSuccess("Recommendations generated!");
  };

  // ============================================
  // UI COMPONENTS
  // ============================================
  const ImageUploadSection = ({ label, image, imageRef, onChange }) => (
    <div className="upload-section">
      <label className="upload-label">{label}</label>
      <div className="upload-box">
        {image ? (
          <img src={image} alt={label} className="uploaded-image" />
        ) : (
          <div className="upload-placeholder">
            <Upload size={32} />
            <p>Click to upload</p>
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="file-input"
        />
      </div>
    </div>
  );

  return (
    <div className="virtual-tryon-ai">
      <div className="container">
        <div className="header">
          <h1>🎨 AI Virtual Try-On</h1>
          <p>Use AI to visualize outfits on your body</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "tryon" ? "active" : ""}`}
            onClick={() => setActiveTab("tryon")}
          >
            Virtual Try-On
          </button>
          <button
            className={`tab ${activeTab === "advice" ? "active" : ""}`}
            onClick={() => setActiveTab("advice")}
          >
            Fashion Analysis
          </button>
        </div>

        {/* ================= TRY-ON TAB ================ */}
        {activeTab === "tryon" && (
          <div className="tab-content">
            <div className="upload-container">
              <ImageUploadSection
                label="Person Image"
                image={personImage}
                imageRef={personImageRef}
                onChange={(e) => handleImageUpload(e, "person")}
              />
              <ImageUploadSection
                label="Clothing Image"
                image={clothingImage}
                imageRef={clothingImageRef}
                onChange={(e) => handleImageUpload(e, "clothing")}
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={processVirtualTryOn}
                disabled={loading}
              >
                {loading ? "Processing..." : "Process Virtual Try-On"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={analyzeBody}
                disabled={loading}
              >
                Analyze Body (AI Mock)
              </button>

              <button
                className="btn btn-secondary"
                onClick={getRecommendations}
                disabled={loading}
              >
                Get Recommendations (AI Mock)
              </button>
            </div>

            {resultImage && (
              <div className="results-container">
                <h3>Try-On Result</h3>
                <img src={resultImage} className="result-image" />
              </div>
            )}
          </div>
        )}

        {/* ================= ADVICE TAB ================ */}
        {activeTab === "advice" && (
          <div className="tab-content">
            <button
              className="btn btn-primary"
              onClick={getFashionAdvice}
              disabled={loading}
            >
              {loading ? "Generating..." : "Get Fashion Advice (AI Mock)"}
            </button>

            {fashionAdvice && (
              <div className="analysis-card">
                <p>{fashionAdvice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnAI;
