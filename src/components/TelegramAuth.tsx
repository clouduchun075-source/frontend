import { useState } from 'react';
import { Phone, Send, ShieldCheck, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const BOT_USERNAME = 'saywayuz_bot';

interface Props {
  mode: 'signup' | 'login';
  onSuccess: () => void;
}

type Step = 'intro' | 'phone' | 'waiting';

export const TelegramAuth = ({ mode, onSuccess }: Props) => {
  const [step, setStep] = useState<Step>('intro');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [botLink, setBotLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [sentDirectly, setSentDirectly] = useState(false);

  const callFunction = async (name: string, body: unknown) => {
    const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Nimadir xato ketdi');
    return data;
  };

  const handleGetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !fullName.trim()) {
      setError('Iltimos, to\'liq ismingizni kiriting');
      return;
    }
    if (!phone.trim()) {
      setError('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    setLoading(true);
    try {
      const data = await callFunction('start-signup', {
        full_name: mode === 'signup' ? fullName : phone,
        phone,
      });
      setSessionId(data.sessionId);
      setSentDirectly(!!data.sentDirectly);
      if (!data.sentDirectly) {
        setBotLink(data.botLink);
        window.open(data.botLink, '_blank');
      }
      setStep('waiting');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const value = (codeToVerify ?? code).trim();
    if (value.length < 6 || loading) return;
    setError('');
    setLoading(true);
    try {
      const data = await callFunction('verify-signup-code', { sessionId, code: value });
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        phone: data.phone,
        password: data.password,
      });
      if (signInErr) throw signInErr;
      setCodeStatus('success');
      setTimeout(onSuccess, 500);
    } catch (err) {
      setCodeStatus('error');
      setError((err as Error).message);
      setTimeout(() => {
        setCodeStatus('idle');
        setCode('');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const StepDots = ({ active }: { active: 1 | 2 | 3 }) => (
    <div className="flex items-center justify-center gap-1.5 pb-1">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === active ? 'w-6 bg-black dark:bg-white' : 'w-1.5 bg-neutral-200 dark:bg-neutral-700'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {error && <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl tracking-wide">{error}</div>}

      {/* STEP 1: How it works */}
      {step === 'intro' && (
        <div className="space-y-5">
          <StepDots active={1} />
          <div className="space-y-3">
            <div className="flex items-start gap-3 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5">
              <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-black dark:text-white stroke-[1.75]" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-xs font-bold text-black dark:text-white">Telefon raqamingizni kiriting</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">Uni Telegram hisobingizni topish uchun ishlatamiz.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5">
              <div className="w-9 h-9 rounded-full bg-[#229ED9]/10 flex items-center justify-center flex-shrink-0">
                <Send className="w-4 h-4 text-[#229ED9] stroke-[1.75] rotate-45 -translate-x-0.5" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-xs font-bold text-black dark:text-white">Telegram botimizni oching</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug"><span className="font-bold">Start</span> tugmasini bosing — u avtomatik ochiladi, bir bosish yetarli.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5">
              <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 stroke-[1.75]" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-xs font-bold text-black dark:text-white">Kelgan kodni kiriting</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">Bot uni to'g'ridan-to'g'ri Telegram chatingizga yuboradi — faqat siz olasiz.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStep('phone')}
            className="w-full flex items-center justify-center gap-2 bg-[#229ED9] text-white rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity"
          >
            Keyingisi
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Phone number */}
      {step === 'phone' && (
        <div className="space-y-4">
          <StepDots active={2} />
          <form onSubmit={handleGetCode} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="To'liq ism"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm px-5 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
              />
            )}
            <PhoneInput value={phone} onChange={setPhone} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="flex items-center justify-center gap-1 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-full text-sm font-bold py-3.5 px-5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#229ED9] text-white rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4 stroke-[2] rotate-45 -translate-x-0.5" />
                {loading ? 'Iltimos, kuting...' : 'Kod olish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Waiting for code from Telegram bot */}
      {step === 'waiting' && (
        <div className="space-y-4">
          <StepDots active={3} />
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#229ED9]/10 flex items-center justify-center mx-auto">
              <Send className="w-5 h-5 text-[#229ED9] stroke-[1.75] rotate-45 -translate-x-0.5" />
            </div>
            {sentDirectly ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed px-2">
                Biz Telegramingizni allaqachon bilamiz — kodingiz to'g'ridan-to'g'ri <span className="font-bold text-black dark:text-white">@{BOT_USERNAME}</span> bilan chatingizga yuborildi. Telegramni tekshiring va uni pastda kiriting.
              </p>
            ) : (
              <>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed px-2">
                  Telegramda <span className="font-bold text-black dark:text-white">@{BOT_USERNAME}</span>ni ochdik. <span className="font-bold text-black dark:text-white">Start</span> tugmasini bosing, so'ng so'ralganda <span className="font-bold text-black dark:text-white">Telefon raqamni ulashish</span>ni bosing — kodingiz shundan keyin darhol chiqadi.
                </p>
                <a
                  href={botLink} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#229ED9] hover:underline"
                >
                  Telegram botni qayta ochish
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
          <div className="space-y-4">
            <OTPInput
              value={code}
              onChange={(v) => { setCode(v); setError(''); if (v.length === 6) handleVerify(v); }}
              status={codeStatus}
              disabled={loading || codeStatus === 'success'}
            />
            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={loading || code.length < 6}
              className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Tekshirilmoqda...' : codeStatus === 'success' ? 'Tasdiqlandi!' : 'Tasdiqlash va davom etish'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setStep('phone'); setCode(''); setError(''); setCodeStatus('idle'); }}
            className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white"
          >
            Telefon raqamni o'zgartirish
          </button>
        </div>
      )}
    </div>
  );
};
