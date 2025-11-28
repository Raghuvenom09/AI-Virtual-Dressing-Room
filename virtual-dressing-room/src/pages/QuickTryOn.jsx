import React, { useState } from "react";
import { Upload, Sparkles, Zap } from "lucide-react";
import DirectTryOn from "../components/DirectTryOn";

const QuickTryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  React.useEffect(() => {
    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y <= -10 ? 110 : p.y - p.speed * 0.1,
          x: p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.3,
        }))
      );
    };
    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePersonImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClothingImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessTryOn = () => {
    if (personImage && clothingImage) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setPersonImage(null);
    setClothingImage(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Mouse-follow glow */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              background: `linear-gradient(135deg, rgba(139,92,246,${p.opacity}), rgba(236,72,153,${p.opacity}))`,
              boxShadow: `0 0 ${p.size * 2}px rgba(139,92,246,0.5)`,
              animation: `pulse ${2 + p.delay}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            QUICK TRY-ON
          </h1>
        </div>
        <button
          onClick={() => (window.location.href = "/")}
          className="text-white/70 hover:text-white transition-colors hover:bg-white/10 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
            <Zap className="text-yellow-400 animate-pulse" size={20} />
            <span className="text-white/90 font-medium">AI-Powered Virtual Try-On</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">Quick Try-On</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Upload your photo and a clothing item to see how it looks instantly
          </p>
        </div>

        {!showResult ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Person Image Upload */}
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300">
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Upload className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Your Photo</h3>
                    <p className="text-white/70 text-sm text-center mb-4">
                      Clear full-body or upper-body shot with good lighting
                    </p>
                    {personImage ? (
                      <div className="mt-4 rounded-lg overflow-hidden border border-white/20">
                        <img
                          src={personImage}
                          alt="Person"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-white/50 text-sm">Click to select image</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePersonImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Clothing Image Upload */}
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300">
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Upload className="w-12 h-12 text-cyan-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Clothing Item</h3>
                    <p className="text-white/70 text-sm text-center mb-4">
                      Clear, well-lit image of the shirt or garment
                    </p>
                    {clothingImage ? (
                      <div className="mt-4 rounded-lg overflow-hidden border border-white/20">
                        <img
                          src={clothingImage}
                          alt="Clothing"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-white/50 text-sm">Click to select image</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClothingImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleProcessTryOn}
                disabled={!personImage || !clothingImage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <Sparkles size={20} />
                Process Virtual Try-On
              </button>
              {(personImage || clothingImage) && (
                <button
                  onClick={handleReset}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 border border-white/20"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        ) : (
          <DirectTryOn
            personImage={personImage}
            clothingImage={clothingImage}
            onClose={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default QuickTryOn;
