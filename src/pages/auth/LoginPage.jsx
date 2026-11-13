import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Trophy,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
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
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('supercup_remembered_email'));
    } catch {
      return false;
    }
  });

  // Forgot Password Mode
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // Redirect if already authenticated
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
    setResetSuccessMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid tournament staff email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, session, role: userRole, profile } = await authApi.signIn(trimmedEmail, password);

      try {
        if (rememberMe) {
          localStorage.setItem('supercup_remembered_email', trimmedEmail);
        } else {
          localStorage.removeItem('supercup_remembered_email');
        }
      } catch {
        // Ignore storage errors in restricted environments
      }

      dispatch(setCredentials({ user, session, role: userRole, profile }));

      if (userRole === 'super_admin') navigate('/admin', { replace: true });
      else if (userRole === 'manager') navigate('/manager', { replace: true });
      else if (userRole === 'referee') navigate('/referee', { replace: true });
      else navigate('/public', { replace: true });
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please verify your tournament credentials.'
          : err.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccessMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid registered email address to receive a recovery link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(trimmedEmail);
      setResetSuccessMessage(
        'If an official tournament account exists for this email, a password recovery link has been dispatched.'
      );
    } catch (err) {
      setError(err.message || 'Unable to process password reset request at this time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Ambient Background Accent */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#B8F34A]/5 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Link */}
        <Link
          to="/public"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9AA69B] hover:text-[#F4F7F2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Public Spectator Hub
        </Link>

        {/* Tournament Identity Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#B8F34A] flex items-center justify-center text-[#090909] mx-auto shadow-lg">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8F34A]">
              BetterInU Super Cup
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F2] mt-0.5">
              {isResetMode ? 'Account Recovery' : 'Official Staff Sign In'}
            </h1>
            <p className="text-xs text-[#9AA69B] mt-1">
              {isResetMode
                ? 'Enter your registered email address to request a password reset link.'
                : 'Authorized access for Tournament Administrators, Team Managers, and Match Referees.'}
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="p-6 space-y-5 border-[#303030] bg-[#141414]">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
              <Input
                label="Registered Staff Email"
                type="email"
                placeholder="name@supercup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                <KeyRound className="w-4 h-4" />
                Send Recovery Instructions
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                  setResetSuccessMessage('');
                }}
                className="w-full text-center text-xs font-semibold text-[#9AA69B] hover:text-[#F4F7F2] py-1.5 transition-colors"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <Input
                label="Official Email Address"
                type="email"
                placeholder="official@supercup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password-input"
                    className="block text-xs font-medium text-[#9AA69B]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError('');
                      setResetSuccessMessage('');
                    }}
                    className="text-xs font-medium text-[#B8F34A] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full bg-[#202020] border border-[#303030] rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-[#F4F7F2] placeholder-[#9AA69B]/50 focus:outline-none focus:border-[#B8F34A] focus:ring-1 focus:ring-[#B8F34A] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9AA69B] hover:text-[#F4F7F2] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#303030] bg-[#202020] text-[#B8F34A] focus:ring-[#B8F34A]"
                  />
                  <span className="text-xs text-[#9AA69B]">Remember email on this device</span>
                </label>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                <Lock className="w-4 h-4" />
                Sign In to Portal
              </Button>
            </form>
          )}
        </Card>

        {/* Security Notice Footer */}
        <div className="rounded-xl bg-[#141414]/80 border border-[#303030] p-3.5 flex items-center gap-3 text-xs text-[#9AA69B]">
          <ShieldCheck className="w-5 h-5 text-[#B8F34A] shrink-0" />
          <p className="leading-relaxed">
            Management and officiating accounts are provisioned exclusively by the Tournament Super Admin. Public spectators do not require an account.
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
