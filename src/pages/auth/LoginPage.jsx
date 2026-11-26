import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useArenaViewport } from '../../hooks/useArenaViewport';
import { useAuth } from '../../hooks/useAuth';
import { getStaffDashboard } from '../../utils/staffRoles';
import { StaffRoleSelection, staffPortals } from './StaffRoleSelection';
import './staff-login.css';

const rememberedEmailKey = 'supercup_remembered_email';

function readRememberedEmail() {
  try {
    return localStorage.getItem(rememberedEmailKey) || '';
  } catch {
    return '';
  }
}

function loginError(error) {
  if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
    return 'The email or password is incorrect.';
  }

  if (['user_banned', 'email_not_confirmed', 'staff_access_unavailable'].includes(error.code)) {
    return 'Staff access is unavailable for this account. Contact your league administrator.';
  }

  if (error.status === 429) return 'Too many sign-in attempts. Wait a moment and try again.';
  if (error.name === 'AuthRetryableFetchError' || error.status === 0 || error.status >= 500) {
    return 'Could not connect to the sign-in service. Check your connection and try again.';
  }
  return 'Sign-in could not be completed. Try again.';
}

function StaffLoginForm({ portal, login }) {
  const [email, setEmail] = useState(readRememberedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heading = useRef(null);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const title = portal.id === 'admin' ? 'Administrator Login' : 'Referee Login';

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError({ text: 'Enter a valid email address.', field: 'email' });
      emailInput.current.focus();
      return;
    }
    if (password.length < 6) {
      setError({ text: 'Enter your password.', field: 'password' });
      passwordInput.current.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await login(address, password);
      try {
        localStorage.setItem(rememberedEmailKey, address);
      } catch {
        // Signing in works when storage is unavailable.
      }
    } catch (failure) {
      setError({ text: loginError(failure) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="staff-form-shell">
      <div className="staff-form-art" data-role={portal.id}>
        <img src={portal.image} width="400" height="236" alt="" />
      </div>
      <div className="staff-form-content">
        <Link className="staff-login-text-link" to="/login" replace><ArrowLeft size={16} aria-hidden="true" /> Change Role</Link>
        <h1 ref={heading} tabIndex={-1}>{title}</h1>
        <p>Use the email and password for your staff account.</p>
        <form onSubmit={handleSubmit} noValidate>
          <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
            {error && (
              <div className="staff-form-error" role="alert" id="staff-login-error">
                <AlertCircle size={17} aria-hidden="true" />{error.text}
              </div>
            )}
            <div className="staff-form-field">
              <label htmlFor="staff-email">{portal.id === 'admin' ? 'Admin email' : 'Staff email'}</label>
              <input
                ref={emailInput} id="staff-email" name="email" type="email" autoComplete="username" required
                value={email} onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error?.field === 'email' || undefined}
                aria-describedby={error?.field === 'email' ? 'staff-login-error' : undefined}
              />
            </div>
            <div className="staff-form-field">
              <label htmlFor="staff-password">Password</label>
              <div className="staff-password-control">
                <input
                  ref={passwordInput} id="staff-password" name="password"
                  type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error?.field === 'password' || undefined}
                  aria-describedby={error?.field === 'password' ? 'staff-login-error' : undefined}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <button type="submit" className="staff-login-primary">
              {isSubmitting ? 'Signing in…' : `Login as ${portal.label}`}<ArrowRight size={17} aria-hidden="true" />
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export function LoginPage() {
  useArenaViewport();
  const [query] = useSearchParams();
  const portal = staffPortals.find(({ id }) => id === query.get('portal'));
  const [active, setActive] = useState(() => portal ? staffPortals.indexOf(portal) : 0);
  const lobbyHeading = useRef(null);
  const previousPortal = useRef(null);
  const { isAuthenticated, role, login } = useAuth();
  const dashboard = isAuthenticated && getStaffDashboard(role);

  useLayoutEffect(() => {
    if (portal || previousPortal.current) window.scrollTo(0, 0);
    if (!portal && previousPortal.current) lobbyHeading.current?.focus({ preventScroll: true });
    previousPortal.current = portal;
  }, [portal]);

  if (dashboard) return <Navigate to={dashboard} replace />;

  return (
    <div className="staff-login">
      <header className="staff-login-header">
        <Link className="staff-login-text-link" to="/public"><ArrowLeft size={17} aria-hidden="true" /> Back to Home</Link>
      </header>
      <main className="staff-login-main">
        <img className="staff-login-logo" src="/assets/betterinu-league-logo.webp" width="900" height="524" alt="Betterinu Football League" />
        {portal ? <StaffLoginForm key={portal.id} portal={portal} login={login} /> : (
          <div className="staff-login-selection">
            <div className="staff-login-heading">
              <h1 ref={lobbyHeading} tabIndex={-1}>Staff Login</h1>
              <p>Choose your staff portal.</p>
            </div>
            <StaffRoleSelection active={active} onChange={setActive} />
          </div>
        )}
        <p className="staff-login-notice"><LockKeyhole size={14} aria-hidden="true" /> Authorized Staff Only</p>
      </main>
    </div>
  );
}

export default LoginPage;
