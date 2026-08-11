import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TelegramAuth } from '../components/TelegramAuth';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.65z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.31 14.32A7.2 7.2 0 0 1 4.9 12c0-.81.14-1.6.4-2.32V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41l4.01-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.59l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z" />
  </svg>
);

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(
    location.pathname === '/signup' ? 'signup' : 'login'
  );
  const [step, setStep] = useState<'email' | 'details'>('email');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to send the user back to once they're signed in (e.g. checkout)
  const from = (location.state as { from?: string } | null)?.from || '/profile';

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    setLoading(false);
    if (err) setError(err);
    // On success, Supabase redirects the browser away, so nothing else to do here.
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      setLoading(false);
      if (err) { setError(err); return; }
      setInfo('Account created! You can sign in now.');
      setMode('login');
      return;
    }

    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate(from);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {mode === 'login'
              ? 'Sign in to view your orders, wishlist and account.'
              : 'Sign up to start saving your orders and wishlist.'}
          </p>
        </div>

        {error && <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl tracking-wide">{error}</div>}
        {info && <div className="text-xs font-bold text-green-700 bg-green-50 dark:bg-green-950/30 p-3 rounded-xl tracking-wide">{info}</div>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-full py-3.5 text-sm font-semibold text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <TelegramAuth mode={mode} onSuccess={() => navigate(from)} />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Or</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            className="w-full text-center text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-2"
          >
            {mode === 'login' ? 'Sign in with email instead' : 'Sign up with email instead'}
          </button>
        ) : step === 'email' ? (
          <form onSubmit={handleContinue} className="space-y-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Email address"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            />
            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{email}</span>
              <button type="button" onClick={() => setStep('email')} className="font-bold text-black dark:text-white hover:underline">
                Edit
              </button>
            </div>
            {mode === 'signup' && (
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
              />
            )}
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              placeholder="Password"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); setStep('email'); setShowEmailForm(false); }}
            className="font-bold text-black dark:text-white hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white underline underline-offset-2"
          >
            Stay logged out
          </button>
        </p>
      </div>
    </div>
  );
};
