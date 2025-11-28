import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { testSupabaseConnection } from "./supabase";
import Homepage from "./components/Homepage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import VirtualDressingRoom from "./components/VirtualDressingRoom.jsx";
import VirtualTryOnAI from "./components/VirtualTryOnAI.jsx";
import QuickTryOn from "./pages/QuickTryOn.jsx";
import TryOnGallery from "./components/TryOnGallery.jsx";

const App = () => {
  useEffect(() => {
    // Test Supabase connection on app load
    const testConnection = async () => {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        console.log("✅ App initialized with Supabase authentication");
      } else {
        console.warn("⚠️ Supabase connection failed - check your credentials");
      }
    };
    testConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/virtual-dressing" element={<VirtualDressingRoom />} />
          <Route path="/ai-tryon" element={<VirtualTryOnAI />} />
          <Route path="/quick-tryon" element={<QuickTryOn />} />
          <Route path="/gallery" element={<TryOnGallery />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
