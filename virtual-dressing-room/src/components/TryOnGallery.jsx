import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Download, RefreshCw, Image as ImageIcon, LogIn, ArrowLeft } from 'lucide-react';
import { getUserGallery, deleteTryOnResult } from '../supabase';
import { AuthContext } from '../context/AuthContext';

const TryOnGallery = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadGallery();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserGallery(user.id);
      
      if (fetchError) {
        throw fetchError;
      }

      setGallery(data || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this try-on result?')) {
      return;
    }

    try {
      const { success, error: deleteError } = await deleteTryOnResult(
        user.id,
        item.file_path,
        item.id
      );

      if (!success) {
        throw deleteError;
      }

      setGallery(gallery.filter(g => g.id !== item.id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleDownload = (imageUrl, index) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `tryon-result-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-8">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-md w-full bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-purple-500/30 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-purple-200 mb-6">
            Please login to view your virtual try-on gallery and saved results.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Login to Continue
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-purple-800/50 border border-purple-500/50 text-purple-100 rounded-lg hover:bg-purple-700/50 font-medium transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex justify-center items-center">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="text-center z-10">
          <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-purple-200 text-lg">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-8">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-md w-full bg-red-900/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-red-100 mb-3">Error Loading Gallery</h3>
          <p className="text-red-200 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-lg"
            >
              Go to Login
            </button>
            <button
              onClick={loadGallery}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main gallery view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto p-8 relative z-10">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                My Try-On Gallery
              </h1>
              <p className="text-purple-200 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {gallery.length} {gallery.length === 1 ? 'result' : 'results'} saved
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadGallery}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-800/50 border border-purple-500/50 text-purple-100 rounded-lg hover:bg-purple-700/50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        {gallery.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30">
              <ImageIcon className="w-12 h-12 text-purple-300" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No try-ons yet
            </h3>
            <p className="text-purple-200 mb-6 max-w-md mx-auto">
              Your virtual try-on results will appear here. Start by trying on some outfits!
            </p>
            <button
              onClick={() => navigate('/ai-tryon')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 font-medium shadow-lg"
            >
              Start Try-On
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item, index) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 border border-purple-500/30"
              >
                <div className="relative aspect-square bg-black/20">
                  <img
                    src={item.image_url}
                    alt={`Try-on result ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-purple-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-purple-200 border border-purple-500/50">
                    #{gallery.length - index}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <p className="text-sm text-purple-300 mb-1">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {item.clothing_type && (
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 rounded-full text-xs font-medium capitalize border border-purple-400/30">
                          {item.clothing_type}
                        </span>
                        {item.clothing_color && (
                          <span className="text-sm text-purple-300 capitalize">
                            {item.clothing_color}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(item.image_url, index)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 text-sm font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex items-center justify-center px-4 py-2.5 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105 shadow-lg border border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOnGallery;
