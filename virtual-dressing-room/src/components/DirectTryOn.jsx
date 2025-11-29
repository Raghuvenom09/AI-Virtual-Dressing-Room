import React, { useState, useEffect } from "react";
import { Upload, Loader, AlertCircle, CheckCircle, Download, RotateCcw } from "lucide-react";

// Backend API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DirectTryOn = ({ personImage, clothingImage, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendReady, setBackendReady] = useState(false);
  const [fitAnalysis, setFitAnalysis] = useState(null);

  // Check backend on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Auto-process when images are provided
  useEffect(() => {
    if (personImage && clothingImage && backendReady && !isProcessing) {
      processVirtualTryOn();
    }
  }, [personImage, clothingImage, backendReady]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tryon/health`);
      if (response.ok) {
        setBackendReady(true);
      }
    } catch (err) {
      setError("Backend not available. Please start: python backend/app.py");
    }
  };

  const processVirtualTryOn = async () => {
    if (!personImage || !clothingImage) {
      setError("Both person and clothing images are required");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        person_image: personImage.split(",")[1] || personImage,
        clothing_image: clothingImage.split(",")[1] || clothingImage,
        clothing_item: {
          item_type: "shirt",
          color: "green",
          pattern: "solid",
          size: "M",
          fit: "regular",
          style: "casual",
        },
        body_measurements: {
          height: 175,
          chest: 95,
          waist: 80,
          hips: 95,
          shoulder_width: 42,
          body_shape: "rectangle",
        },
      };

      console.log("Sending try-on request...");
      const response = await fetch(`${API_BASE_URL}/api/tryon/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        timeout: 300000, // 5 minutes
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setResult({
          image: `data:image/jpeg;base64,${data.result_image}`,
          confidence: data.confidence,
        });
        setFitAnalysis(data.fit_analysis);
      } else {
        setError(data.message || "Failed to process virtual try-on");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.image;
    link.download = "virtual-tryon-result.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Virtual Try-On Result</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-red-300 font-semibold mb-1">Error</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6">
                <Loader className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Processing Virtual Try-On</h3>
              <p className="text-white/70 text-center max-w-md">
                Analyzing body, removing original clothing, applying new garment, matching lighting...
                <br />
                <span className="text-sm mt-2 block">This may take 2-3 minutes on first run</span>
              </p>
            </div>
          )}

          {/* Result Display */}
          {result && !isProcessing && (
            <div className="space-y-6">
              {/* Result Image */}
              <div className="rounded-2xl overflow-hidden border border-white/20 bg-black/30">
                <img
                  src={result.image}
                  alt="Virtual Try-On Result"
                  className="w-full h-auto"
                />
              </div>

              {/* Fit Analysis */}
              {fitAnalysis && (
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={20} />
                    Fit Analysis
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Fit Rating</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {(fitAnalysis.fit_rating * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Color Match</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {(fitAnalysis.color_match * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Style Match</p>
                      <p className="text-2xl font-bold text-pink-400">
                        {(fitAnalysis.style_match * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Overall Score</p>
                      <p className="text-2xl font-bold text-green-400">
                        {(fitAnalysis.overall_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/90">{fitAnalysis.fit_description}</p>
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {result.confidence && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
                  <p className="text-white/70 text-sm mb-2">Processing Confidence</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold min-w-fit">
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={downloadResult}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Download size={20} />
                  Download Result
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setFitAnalysis(null);
                    processVirtualTryOn();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                >
                  <RotateCcw size={20} />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!result && !isProcessing && !error && (
            <div className="flex flex-col items-center justify-center py-16">
              <Upload className="w-12 h-12 text-purple-400 mb-4" />
              <p className="text-white/70 text-center">
                Ready to process your virtual try-on...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectTryOn;
