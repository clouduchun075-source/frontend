import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TelegramAuth } from '../components/TelegramAuth';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(
    location.pathname === '/signup' ? 'signup' : 'login'
  );
  const [showPhoneOption, setShowPhoneOption] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to send the user back to once they're signed in (e.g. checkout)
  const from = (location.state as { from?: string } | null)?.from || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Iltimos, to\'liq ismingizni kiriting');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      setLoading(false);
      if (err) { setError(err); return; }
      setInfo('Hisob yaratildi! Endi tizimga kirishingiz mumkin.');
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
            {mode === 'login' ? 'Xush kelibsiz' : 'Hisob yarating'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {mode === 'login'
              ? 'Buyurtmalaringiz, sevimlilar va hisobingizni ko\'rish uchun tizimga kiring.'
              : 'Buyurtmalaringiz va sevimlilarni saqlash uchun ro\'yxatdan o\'ting.'}
          </p>
        </div>

        {error && <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl tracking-wide">{error}</div>}
        {info && <div className="text-xs font-bold text-green-700 bg-green-50 dark:bg-green-950/30 p-3 rounded-xl tracking-wide">{info}</div>}

        {/* Primary: email + password */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="To'liq ism"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            />
          )}
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="Email manzil"
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            placeholder="Parol"
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Iltimos, kuting...' : mode === 'login' ? 'Kirish' : 'Hisob yaratish'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          {mode === 'login' ? "Hisobingiz yo'qmi? " : 'Hisobingiz bormi? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}
            className="font-bold text-black dark:text-white hover:underline"
          >
            {mode === 'login' ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
          </button>
        </p>

        {/* Secondary: phone / Telegram option */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Yoki</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {!showPhoneOption ? (
          <button
            onClick={() => setShowPhoneOption(true)}
            className="w-full text-center text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-2"
          >
            Telefon raqam bilan {mode === 'login' ? 'kirish' : 'ro\'yxatdan o\'tish'}
          </button>
        ) : (
          <TelegramAuth mode={mode} onSuccess={() => navigate(from)} />
        )}

        <p className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white underline underline-offset-2"
          >
            Kirmasdan davom etish
          </button>
        </p>
      </div>
    </div>
  );
};
