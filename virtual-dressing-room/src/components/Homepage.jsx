import React, { useState, useEffect } from "react";
import { Sparkles, LogIn, Zap, ArrowRight, ShoppingBag, TrendingUp, Heart } from "lucide-react";
import AuthModal from "./AuthModal";

const Homepage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const words = ["Fashion", "Style", "Elegance", "Innovation"];

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
    setIsLoaded(true);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate particles
  useEffect(() => {
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

  // Word rotation
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(wordInterval);
  }, [words.length]);

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const openSignupModal = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Mouse Follow Effect */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Animated Particles */}
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
              background: `linear-gradient(135deg, rgba(139, 92, 246, ${p.opacity}), rgba(236, 72, 153, ${p.opacity}))`,
              boxShadow: `0 0 ${p.size * 2}px rgba(139, 92, 246, 0.5)`,
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
            TRY & BUY
          </h1>
        </div>

        <button 
          onClick={openLoginModal}
          className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <LogIn size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10 font-semibold">Login</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 hover:bg-white/20 transition-all cursor-pointer">
            <Zap className="text-yellow-400 animate-pulse" size={20} />
            <span className="text-white/90 font-medium">AI-Powered Fashion Experience</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Main Heading with Word Rotation */}
          <div className="mb-4">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tight">
              Discover the Future of
            </h2>
            <div className="relative h-24 md:h-32 overflow-hidden">
              {words.map((word, index) => (
                <h2
                  key={word}
                  className={`absolute inset-0 flex items-center justify-center text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-500 ${
                    index === currentWord ? 'translate-y-0 opacity-100' : index < currentWord ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
                  }`}
                >
                  {word}
                </h2>
              ))}
            </div>
          </div>

          <p className="text-white/70 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed">
            Explore, experiment, and express yourself like never before. Experience our revolutionary AI-powered fashion ecosystem.
          </p>

          {/* CTA Button */}
          <button 
            onClick={openSignupModal}
            className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white px-12 py-5 rounded-full font-bold text-xl flex items-center gap-4 hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-pink-500/50 mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Sparkles className="relative z-10 group-hover:rotate-180 transition-transform duration-500" size={24} />
            <span className="relative z-10">Start Your Journey</span>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
            {[
              { icon: ShoppingBag, text: "AI-Powered Styling", color: "from-blue-500 to-cyan-500" },
              { icon: TrendingUp, text: "Trending Collections", color: "from-purple-500 to-pink-500" },
              { icon: Heart, text: "Personalized Picks", color: "from-rose-500 to-orange-500" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{feature.text}</h3>
                  <p className="text-white/60 text-sm">Revolutionizing the way you discover fashion</p>
                </div>
              );
            })}
          </div>

          {/* Floating Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-20">
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "50K+", label: "Products" },
              { number: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <>
        {/* Auth Modal - Professional Amazon/Myntra style */}
        <AuthModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setTimeout(() => {
              window.location.href = '/virtual-dressing';
            }, 1500);
          }}
        />

        <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
      </>
    </div>
  );
};

export default Homepage;