import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { authApi } from '../../services/api/auth.api';
import { setCredentials } from '../../store/slices/auth.slice';

export function LoginPage() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('supercup_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'super_admin') navigate('/admin', { replace: true });
      else if (role === 'manager') navigate('/manager', { replace: true });
      else if (role === 'referee') navigate('/referee', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, session, role: userRole, profile } = await authApi.signIn(
        trimmedEmail,
        password
      );

      try {
        localStorage.setItem('supercup_remembered_email', trimmedEmail);
      } catch {
        // Ignore storage errors
      }

      dispatch(setCredentials({ user, session, role: userRole, profile }));

      if (userRole === 'super_admin') navigate('/admin', { replace: true });
      else if (userRole === 'manager') navigate('/manager', { replace: true });
      else if (userRole === 'referee') navigate('/referee', { replace: true });
      else navigate('/public', { replace: true });
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Invalid email or password.'
          : err.message || 'Sign in failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col justify-center items-center p-5 relative overflow-hidden">
      {/* Subtle Ambient Color Glows */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#001AFF]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#FF1E27]/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Top-Left Back Button */}
      <div className="fixed top-5 left-5 z-20">
        <Link
          to="/public"
          aria-label="Back to tournament"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] border border-[#303030] text-xs font-bold text-[#F4F7F2] hover:bg-[#1C1C1C] hover:border-[#FFC600]/60 hover:text-[#FFC600] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to League Hub</span>
        </Link>
      </div>

      {/* Sleek Dark Sign-In Card */}
      <div className="w-full max-w-[400px] rounded-2xl bg-[#141414] border border-[#2A2A2A] shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden animate-slide-up relative z-10">
        {/* Top Tri-Color Championship Strip */}
        <div className="h-1.5 w-full flex">
          <span className="flex-1 bg-[#001AFF]" />
          <span className="flex-1 bg-[#FFC600]" />
          <span className="flex-1 bg-[#FF1E27]" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <BrandLogo size="lg" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFC600]/15 border border-[#FFC600]/45 text-[10px] font-black uppercase tracking-wider text-[#FFC600]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC600]" />
              Authorized Officials Only
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#F4F7F2]">
              Staff Sign In
            </h1>
            <p className="text-xs font-medium text-[#9AA69B]">
              Access Admin, Club Manager, or Match Referee consoles
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-xl bg-[#FF1E27]/15 border border-[#FF1E27]/45 flex items-center gap-2 text-[#FF6B72] text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="login-email-input"
                className="block text-xs font-semibold text-[#F4F7F2]"
              >
                Email Address
              </label>
              <input
                id="login-email-input"
                type="email"
                placeholder="official@betterinu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-label="Email address"
                className="w-full bg-[#202020] border border-[#303030] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F7F2] placeholder-[#6E7A70] focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs font-semibold text-[#F4F7F2]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-label="Password"
                  className="w-full bg-[#202020] border border-[#303030] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#F4F7F2] placeholder-[#6E7A70] focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9AA69B] hover:text-[#F4F7F2] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#001AFF] hover:bg-[#1B3BFF] text-[#FFFFFF] py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-[0_8px_24px_rgba(0,26,255,0.4)] border border-[#3B82F6]/40 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4 text-[#FFC600]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
