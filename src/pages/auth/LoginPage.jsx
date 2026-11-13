import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
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
      {/* Top-Left Circular Back Button */}
      <div className="fixed top-5 left-5 z-20">
        <Link
          to="/public"
          aria-label="Back to tournament"
          className="w-11 h-11 rounded-full bg-[#161616] border border-white/[0.08] flex items-center justify-center text-[#F4F7F2] hover:bg-[#B8F34A] hover:text-[#090909] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Minimal Clean Sign-In Container */}
      <div className="w-full max-w-[360px] space-y-7 animate-slide-up">
        {/* Clean Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F4F7F2]">
            Staff Sign In
          </h1>
        </div>

        {/* Minimal Form */}
        <form onSubmit={handleLogin} className="space-y-3.5" noValidate>
          {error && (
            <div
              role="alert"
              className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <input
              id="login-email-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-label="Email address"
              className="w-full bg-[#161616] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-sm text-[#F4F7F2] placeholder-[#9AA69B]/55 focus:outline-none focus:border-[#B8F34A] transition-colors"
            />
          </div>

          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-label="Password"
              className="w-full bg-[#161616] border border-white/[0.08] rounded-2xl pl-4 pr-11 py-3.5 text-sm text-[#F4F7F2] placeholder-[#9AA69B]/55 focus:outline-none focus:border-[#B8F34A] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#9AA69B] hover:text-[#F4F7F2] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Signature Track-Style Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full rounded-full bg-[#090909] border border-[#B8F34A] p-1.5 flex items-center justify-between transition-all hover:bg-[#141414] active:scale-[0.98] disabled:opacity-50"
            >
              <span className="w-11 h-11 rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </span>

              <span className="text-sm font-extrabold text-[#F4F7F2] tracking-wide">
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </span>

              <span className="pr-4 flex items-center text-[#B8F34A]">
                <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
                <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
                <ChevronRight className="w-4 h-4 animate-chevron-3" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
