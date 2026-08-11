import { useEffect, useState } from 'react';
import { X, MapPin, Plus, Check } from 'lucide-react';
import type { SavedAddress, ShippingAddress } from '../data/api';
import { getAddresses, saveAddress, deleteAddress } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { PhoneInput } from './PhoneInput';

interface Props {
  total: string;
  onClose: () => void;
  onSubmit: (address: ShippingAddress) => void;
  submitting?: boolean;
}

const emptyForm: ShippingAddress = {
  first_name: '', last_name: '', phone: '', city: '', district: '',
  neighborhood: '', house_number: '', postal_code: '',
};

const UZ_CITIES = [
  'Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona',
  'Nukus', 'Qarshi', 'Termiz', 'Jizzax', 'Navoiy', 'Urganch', 'Guliston',
];

export const CheckoutModal = ({ total, onClose, onSubmit, submitting }: Props) => {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [step, setStep] = useState<'choose' | 'form'>('form');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingAddress>(emptyForm);
  const [error, setError] = useState('');
  const set = (k: keyof ShippingAddress, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    getAddresses().then((addrs) => {
      setSavedAddresses(addrs);
      setStep(addrs.length > 0 ? 'choose' : 'form');
      setLoadingSaved(false);
    });
  }, []);

  const required: (keyof ShippingAddress)[] = [
    'first_name', 'phone', 'city', 'district', 'neighborhood', 'house_number',
  ];

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = required.find((k) => !form[k]?.trim());
    if (missing) {
      setError('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    setError('');
    if (user?.id) saveAddress(user.id, form).catch(() => {});
    onSubmit(form);
  };

  const handleUseSaved = () => {
    const addr = savedAddresses.find((a) => a.id === selectedId);
    if (!addr) {
      setError('Iltimos, manzilni tanlang');
      return;
    }
    onSubmit({
      first_name: addr.first_name,
      last_name: addr.last_name,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      neighborhood: addr.neighborhood,
      house_number: addr.house_number,
      postal_code: addr.postal_code,
    });
  };

  const handleDeleteSaved = async (id: string) => {
    await deleteAddress(id);
    setSavedAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length === 0) setStep('form');
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const inputClass =
    'w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-neutral-400';
  const labelClass = 'text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl p-6 md:p-8 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black dark:text-white" />
            <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Yetkazib berish ma'lumotlari</h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-5">
          Yuborganingizdan so'ng jamoamiz vakili buyurtmangizni tasdiqlash uchun sizga qo'ng'iroq qiladi.
        </p>

        {error && <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl tracking-wide mb-4">{error}</div>}

        {loadingSaved && <p className="text-xs text-neutral-400 text-center py-6">Yuklanmoqda...</p>}

        {!loadingSaved && step === 'choose' && (
          <div className="space-y-3">
            {savedAddresses.map((addr) => {
              const active = selectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedId(addr.id)}
                  className={`relative border rounded-2xl p-4 cursor-pointer transition-colors ${
                    active ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-black dark:text-white">{addr.first_name} {addr.last_name}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{addr.phone}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {addr.city}, {addr.district}, {addr.neighborhood}, {addr.house_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-white dark:text-black" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSaved(addr.id); }}
                        className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-red-600"
                      >
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => { setStep('form'); setForm(emptyForm); setError(''); }}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-2xl text-xs font-bold uppercase tracking-widest py-3.5 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yangi manzil qo'shish
            </button>

            <button
              type="button"
              onClick={handleUseSaved}
              disabled={submitting || !selectedId}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-4 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {submitting ? 'Buyurtma qabul qilinmoqda...' : `Shu yerga yetkazish — ${total}`}
            </button>
          </div>
        )}

        {!loadingSaved && step === 'form' && (
          <form onSubmit={handleSubmitNew} className="space-y-4">
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => { setStep('choose'); setError(''); }}
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white"
              >
                &larr; Saqlangan manzildan foydalanish
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ism *</label>
                <input value={form.first_name} onChange={e => set('first_name', e.target.value)} className={inputClass} placeholder="Ism" />
              </div>
              <div>
                <label className={labelClass}>Familiya</label>
                <input value={form.last_name} onChange={e => set('last_name', e.target.value)} className={inputClass} placeholder="Familiya" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Aloqa telefoni *</label>
              <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Shahar *</label>
                <select value={form.city} onChange={e => set('city', e.target.value)} className={inputClass}>
                  <option value="">Shaharni tanlang</option>
                  {UZ_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tuman *</label>
                <input value={form.district} onChange={e => set('district', e.target.value)} className={inputClass} placeholder="Tuman" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Mahalla *</label>
              <input value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className={inputClass} placeholder="Mahalla" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Uy / Ko'cha *</label>
                <input value={form.house_number} onChange={e => set('house_number', e.target.value)} className={inputClass} placeholder="Uy / Ko'cha" />
              </div>
              <div>
                <label className={labelClass}>Pochta indeksi</label>
                <input value={form.postal_code} onChange={e => set('postal_code', e.target.value)} className={inputClass} placeholder="Ixtiyoriy" />
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold py-4 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {submitting ? 'Buyurtma qabul qilinmoqda...' : `Buyurtma berish — ${total}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
