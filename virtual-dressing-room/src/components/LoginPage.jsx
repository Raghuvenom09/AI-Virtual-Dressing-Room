import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../utils/authErrors";
import { validateSignupForm, validateLoginForm } from "../utils/validators";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp, signIn, signInWithGoogle } = useAuth();
  
  const [isSignup, setIsSignup] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("✅ User already logged in:", user.email);
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Toggle visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // ✅ Handle Signup/Login with Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      if (isSignup) {
        // Validate signup form
        const validation = validateSignupForm(formData);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          setLoading(false);
          return;
        }

        // Sign up with Supabase
        const { data, error: signupError } = await signUp(
          formData.email,
          formData.password,
          formData.fullName
        );

        if (signupError) {
          setError(getAuthErrorMessage(signupError));
          console.error("❌ Signup error:", signupError);
          setLoading(false);
          return;
        }

        console.log("✅ Account created successfully!");
        // Clear form
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
        // Show success message
        setError(null);
        // Navigate to virtual dressing room with smooth animation
        setTimeout(() => navigate("/virtual-dressing"), 1000);
      } else {
        // Validate login form
        const validation = validateLoginForm(formData);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          setLoading(false);
          return;
        }

        // Sign in with Supabase
        const { data, error: signinError } = await signIn(
          formData.email,
          formData.password
        );

        if (signinError) {
          setError(getAuthErrorMessage(signinError));
          console.error("❌ Sign in error:", signinError);
          setLoading(false);
          return;
        }

        console.log("✅ Logged in successfully!");
        // Navigate to virtual dressing room with smooth animation
        setTimeout(() => navigate("/virtual-dressing"), 500);
      }
    } catch (error) {
      console.error("❌ Auth error:", error);
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-In with Supabase
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: googleError } = await signInWithGoogle();

      if (googleError) {
        setError(getAuthErrorMessage(googleError));
        console.error("❌ Google login error:", googleError);
        setLoading(false);
        return;
      }

      console.log("✅ Google login successful!");
      // Supabase handles redirect automatically
    } catch (error) {
      console.error("❌ Google login error:", error);
      setError(getAuthErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-purple-200 hover:text-white transition-all hover:rotate-90 duration-300 bg-purple-700/50 rounded-full p-2"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-4 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent mb-2">
          {isSignup ? "Join TRY & BUY" : "Welcome Back!"}
        </h2>
        <p className="text-center text-purple-200 mb-6">
          {isSignup
            ? "Create your account to get started"
            : "Login to continue your journey"}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <div className="relative">
                <User className="absolute top-3 left-3 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setValidationErrors({ ...validationErrors, fullName: '' });
                  }}
                  required
                  className={`w-full pl-10 pr-3 py-3 bg-purple-800/50 border rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:outline-none transition ${
                    validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-purple-600 focus:ring-pink-500'
                  }`}
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-purple-300" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setValidationErrors({ ...validationErrors, email: '' });
                }}
                required
                className={`w-full pl-10 pr-3 py-3 bg-purple-800/50 border rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:outline-none transition ${
                  validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-purple-600 focus:ring-pink-500'
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute top-3 left-3 text-purple-300" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setValidationErrors({ ...validationErrors, password: '' });
                }}
                required
                className={`w-full pl-10 pr-10 py-3 bg-purple-800/50 border rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:outline-none transition ${
                  validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-purple-600 focus:ring-pink-500'
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-purple-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {isSignup && (
            <div>
              <div className="relative">
                <Lock
                  className="absolute top-3 left-3 text-purple-300"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    setValidationErrors({ ...validationErrors, confirmPassword: '' });
                  }}
                  required
                  className={`w-full pl-10 pr-10 py-3 bg-purple-800/50 border rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:outline-none transition ${
                    validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-purple-600 focus:ring-pink-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-3 text-purple-300 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-purple-900 text-purple-300">OR</span>
          </div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-purple-800/50 border border-purple-600 text-white py-2 rounded-lg hover:bg-purple-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Switch */}
        <p className="text-center text-sm text-purple-200 mt-6">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-pink-400 hover:underline font-medium"
          >
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
