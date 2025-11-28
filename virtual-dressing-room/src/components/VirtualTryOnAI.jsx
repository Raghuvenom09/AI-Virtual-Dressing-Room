import React, { useState, useRef } from "react";
import { Upload, Zap, BarChart3, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { getCurrentUser, uploadTryOnResult } from "../supabase";
import "./VirtualTryOnAI.css";

const VirtualTryOnAI = () => {
  const [personImage, setPersonImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("tryon");
  const [backendReady, setBackendReady] = useState(false);

  // Check backend on mount
  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tryon/health");
      if (response.ok) {
        setBackendReady(true);
        setSuccess("Backend connected successfully!");
      }
    } catch (err) {
      setError("Backend not running. Please start: python backend/app.py");
    }
  };

  // Form states
  const [clothingItem, setClothingItem] = useState({
    item_type: "shirt",
    color: "black",
    pattern: "solid",
    size: "M",
    fit: "regular",
    style: "casual",
  });

  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: 170,
    chest: 95,
    waist: 80,
    hips: 100,
    shoulder_width: 40,
    body_shape: "rectangle",
  });

  const [fitAnalysis, setFitAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [fashionAdvice, setFashionAdvice] = useState(null);
  const [outfitAnalysis, setOutfitAnalysis] = useState(null);

  const personImageRef = useRef(null);
  const clothingImageRef = useRef(null);

  // ============================================
  // IMAGE HANDLING
  // ============================================

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === "person") {
          setPersonImage(event.target.result);
        } else {
          setClothingImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // API CALLS
  // ============================================

  const processVirtualTryOn = async () => {
    if (!personImage || !clothingImage) {
      setError("Please upload both person and clothing images");
      return;
    }

    if (!backendReady) {
      setError("Backend not connected. Please start the backend first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Sending try-on request...");
      
      // Get current user for storage
      const currentUser = await getCurrentUser();
      
      const payload = {
        person_image: personImage.split(",")[1],
        clothing_image: clothingImage.split(",")[1],
        clothing_item: clothingItem,
        body_measurements: bodyMeasurements,
        user_id: currentUser?.id || null,
      };

      const response = await fetch("http://localhost:5000/api/tryon/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.status === "success") {
        const resultImageData = `data:image/jpeg;base64,${data.result_image}`;
        setResultImage(resultImageData);
        setFitAnalysis(data.fit_analysis);
        setRecommendations(data.recommendations);
        setSuccess("Virtual try-on completed successfully!");
        
        // Upload to Supabase if user is logged in
        if (currentUser) {
          try {
            const uploadResult = await uploadTryOnResult(
              currentUser.id,
              resultImageData,
              {
                clothing_type: clothingItem.item_type,
                clothing_color: clothingItem.color,
                fit_rating: data.fit_analysis?.fit_rating,
              }
            );
            
            if (uploadResult.success) {
              console.log("✅ Result saved to gallery");
            }
          } catch (uploadErr) {
            console.warn("Failed to save to gallery:", uploadErr);
            // Don't show error to user, just log it
          }
        }
      } else {
        setError(data.message || "Failed to process virtual try-on");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBody = async () => {
    if (!personImage) {
      setError("Please upload a person image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/tryon/analyze-body", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: personImage.split(",")[1],
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setSuccess("Body analysis completed!");
        console.log("Clothing info:", data.clothing_info);
      } else {
        setError(data.message || "Failed to analyze body");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFashionAdvice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/tryon/fashion-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body_shape: bodyMeasurements.body_shape,
          style_preference: clothingItem.style,
          occasion: "daily",
          budget: "medium",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setFashionAdvice(data.advice);
        setSuccess("Fashion advice generated!");
      } else {
        setError(data.message || "Failed to get fashion advice");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!personImage) {
      setError("Please upload a person image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/tryon/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          person_image: personImage.split(",")[1],
          body_measurements: bodyMeasurements,
          style_preference: clothingItem.style,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setRecommendations(data.recommendations);
        setSuccess("Recommendations generated!");
      } else {
        setError(data.message || "Failed to get recommendations");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER COMPONENTS
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

  const ClothingForm = () => (
    <div className="form-section">
      <h3>Clothing Details</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Item Type</label>
          <select
            value={clothingItem.item_type}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, item_type: e.target.value })
            }
          >
            <option value="shirt">Shirt</option>
            <option value="pants">Pants</option>
            <option value="dress">Dress</option>
            <option value="jacket">Jacket</option>
            <option value="skirt">Skirt</option>
            <option value="shoes">Shoes</option>
            <option value="sweater">Sweater</option>
            <option value="coat">Coat</option>
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <input
            type="text"
            value={clothingItem.color}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, color: e.target.value })
            }
            placeholder="e.g., blue, red"
          />
        </div>

        <div className="form-group">
          <label>Pattern</label>
          <select
            value={clothingItem.pattern}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, pattern: e.target.value })
            }
          >
            <option value="solid">Solid</option>
            <option value="striped">Striped</option>
            <option value="checkered">Checkered</option>
            <option value="floral">Floral</option>
            <option value="polka-dot">Polka Dot</option>
          </select>
        </div>

        <div className="form-group">
          <label>Size</label>
          <select
            value={clothingItem.size}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, size: e.target.value })
            }
          >
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fit</label>
          <select
            value={clothingItem.fit}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, fit: e.target.value })
            }
          >
            <option value="tight">Tight</option>
            <option value="regular">Regular</option>
            <option value="loose">Loose</option>
          </select>
        </div>

        <div className="form-group">
          <label>Style</label>
          <select
            value={clothingItem.style}
            onChange={(e) =>
              setClothingItem({ ...clothingItem, style: e.target.value })
            }
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="sporty">Sporty</option>
            <option value="elegant">Elegant</option>
            <option value="bohemian">Bohemian</option>
          </select>
        </div>
      </div>
    </div>
  );

  const BodyMeasurementsForm = () => (
    <div className="form-section">
      <h3>Body Measurements</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            value={bodyMeasurements.height}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                height: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Chest (cm)</label>
          <input
            type="number"
            value={bodyMeasurements.chest}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                chest: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Waist (cm)</label>
          <input
            type="number"
            value={bodyMeasurements.waist}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                waist: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Hips (cm)</label>
          <input
            type="number"
            value={bodyMeasurements.hips}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                hips: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Shoulder Width (cm)</label>
          <input
            type="number"
            value={bodyMeasurements.shoulder_width}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                shoulder_width: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Body Shape</label>
          <select
            value={bodyMeasurements.body_shape}
            onChange={(e) =>
              setBodyMeasurements({
                ...bodyMeasurements,
                body_shape: e.target.value,
              })
            }
          >
            <option value="rectangle">Rectangle</option>
            <option value="pear">Pear</option>
            <option value="apple">Apple</option>
            <option value="hourglass">Hourglass</option>
            <option value="inverted-triangle">Inverted Triangle</option>
          </select>
        </div>
      </div>
    </div>
  );

  const FitAnalysisCard = () => {
    if (!fitAnalysis) return null;

    return (
      <div className="analysis-card">
        <div className="analysis-header">
          <Zap size={24} />
          <h3>Fit Analysis</h3>
        </div>
        <div className="analysis-content">
          <div className="metric">
            <span className="metric-label">Overall Score:</span>
            <span className="metric-value">
              {(fitAnalysis.overall_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Fit Rating:</span>
            <span className="metric-value">
              {(fitAnalysis.fit_rating * 100).toFixed(0)}%
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Color Match:</span>
            <span className="metric-value">
              {(fitAnalysis.color_match * 100).toFixed(0)}%
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Style Match:</span>
            <span className="metric-value">
              {(fitAnalysis.style_match * 100).toFixed(0)}%
            </span>
          </div>
          <p className="fit-description">{fitAnalysis.fit_description}</p>
        </div>
      </div>
    );
  };

  const RecommendationsCard = () => {
    if (recommendations.length === 0) return null;

    return (
      <div className="analysis-card">
        <div className="analysis-header">
          <Sparkles size={24} />
          <h3>Recommendations</h3>
        </div>
        <div className="analysis-content">
          <ul className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <li key={idx}>
                <CheckCircle size={16} />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const FashionAdviceCard = () => {
    if (!fashionAdvice) return null;

    return (
      <div className="analysis-card">
        <div className="analysis-header">
          <BarChart3 size={24} />
          <h3>Fashion Advice</h3>
        </div>
        <div className="analysis-content">
          <p className="advice-text">{fashionAdvice}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="virtual-tryon-ai">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🎨 AI Virtual Try-On</h1>
          <p>Use AI to see how clothes fit and look on you</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Tabs */}
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
            Fashion Advice
          </button>
        </div>

        {/* Content */}
        {activeTab === "tryon" && (
          <div className="tab-content">
            {/* Image Upload */}
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

            {/* Forms */}
            <div className="forms-container">
              <ClothingForm />
              <BodyMeasurementsForm />
            </div>

            {/* Action Buttons */}
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
                Analyze Body
              </button>
              <button
                className="btn btn-secondary"
                onClick={getRecommendations}
                disabled={loading}
              >
                Get Recommendations
              </button>
            </div>

            {/* Results */}
            {resultImage && (
              <div className="results-container">
                <div className="result-image-section">
                  <h3>Try-On Result</h3>
                  <img src={resultImage} alt="Try-on result" className="result-image" />
                </div>
                <div className="analysis-section">
                  <FitAnalysisCard />
                  <RecommendationsCard />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "advice" && (
          <div className="tab-content">
            <div className="advice-container">
              <BodyMeasurementsForm />
              <button
                className="btn btn-primary"
                onClick={getFashionAdvice}
                disabled={loading}
              >
                {loading ? "Generating..." : "Get Fashion Advice"}
              </button>
              <FashionAdviceCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnAI;
