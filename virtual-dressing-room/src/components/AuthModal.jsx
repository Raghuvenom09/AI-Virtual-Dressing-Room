import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, X, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../utils/authErrors";
import { validateSignupForm, validateLoginForm } from "../utils/validators";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("choice"); // choice, login, signup, otp
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
    setError(null);
  };

  const handleContinueWithEmail = () => {
    if (!formData.email) {
      setValidationErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationErrors({ email: "Enter a valid email" });
      return;
    }
    setStep(isSignup ? "signup" : "login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      const validation = validateSignupForm({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
      });

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setLoading(false);
        return;
      }

      const { data, error: signupError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (signupError) {
        setError(getAuthErrorMessage(signupError));
        setLoading(false);
        return;
      }

      setSuccess("✓ Account created successfully!");
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      const validation = validateLoginForm({
        email: formData.email,
        password: formData.password,
      });

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setLoading(false);
        return;
      }

      const { data, error: signinError } = await signIn(
        formData.email,
        formData.password
      );

      if (signinError) {
        setError(getAuthErrorMessage(signinError));
        setLoading(false);
        return;
      }

      setSuccess("✓ Login successful!");
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: googleError } = await signInWithGoogle();

      if (googleError) {
        console.error('Google login error:', googleError);
        setError(getAuthErrorMessage(googleError));
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Failed to login with Google");
        setLoading(false);
        return;
      }

      setSuccess("✓ Google login successful!");
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Google login exception:', err);
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", fullName: "", phone: "" });
    setValidationErrors({});
    setError(null);
    setSuccess(null);
    setStep("choice");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">TRY & BUY</h1>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Step 1: Choice */}
          {step === "choice" && (
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to TRY & BUY
                </h2>
                <p className="text-gray-600">
                  Discover your perfect style with AI-powered virtual try-on
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      validationErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              <button
                onClick={() => {
                  setIsSignup(false);
                  handleContinueWithEmail();
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Login with Email
              </button>

              <button
                onClick={() => {
                  setIsSignup(true);
                  setStep("signup");
                }}
                className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2"
              >
                <User size={20} />
                Create New Account
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-gray-500 text-sm">OR</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Google OAuth will be enabled in production"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Login */}
          {step === "login" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                <p className="text-gray-600 text-sm mt-1">{formData.email}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        validationErrors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="text-purple-600 text-sm font-medium hover:underline"
                >
                  Forgot password?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setStep("choice");
                  setFormData({ email: "", password: "", fullName: "", phone: "" });
                }}
                className="w-full text-purple-600 py-2 font-medium hover:bg-purple-50 rounded-lg transition"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Signup */}
          {step === "signup" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-600 text-sm mt-1">Join TRY & BUY today</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        validationErrors.fullName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        validationErrors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        validationErrors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Min 8 chars, uppercase, lowercase, number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setStep("choice");
                  setFormData({ email: "", password: "", fullName: "", phone: "" });
                }}
                className="w-full text-purple-600 py-2 font-medium hover:bg-purple-50 rounded-lg transition"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-600 border-t">
          <p>
            By continuing, you agree to our{" "}
            <button className="text-purple-600 hover:underline">Terms of Service</button> and{" "}
            <button className="text-purple-600 hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
