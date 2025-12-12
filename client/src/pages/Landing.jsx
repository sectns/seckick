import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { login, register, startGuest, user, guest } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/follows');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAsGuest = () => {
    startGuest();
    navigate('/follows');
  };

  const alreadyIn = user || guest;

  useEffect(() => {
    if (alreadyIn) {
      navigate('/follows', { replace: true });
    }
  }, [alreadyIn, navigate]);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-brand-300">Kick radar</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-white">
            Takip ettiğin Kick yayıncılarını tek panelde izle, giriş veya anonim modla devam et.
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Canlılık durumu, kategori ve izleyici sayılarını gerçek zamanlı çekip sana özel bir
            oynatıcıda sunuyoruz. Sohbeti ayrı sekmede açarak giriş sorunlarıyla uğraşmadan takip et.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <div className="pill">Kick public API proxy (Node.js)</div>
            <div className="pill">Firebase giriş / Firestore takipler</div>
            <div className="pill">Anonim mod: çerezlerde saklama</div>
            <div className="pill">Plyr tabanlı oynatıcı (native HLS)</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">
              {mode === 'login' ? 'Giriş yap' : 'Hızlı kayıt'}
            </h2>
            <button
              className="text-sm text-brand-300 hover:text-brand-200"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Hesabın yok mu?' : 'Hesabın var mı?'}
            </button>
          </div>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleAuth}>
            <label className="text-sm text-white/70">
              E-posta
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-white/70">
              Şifre
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            {error && <p className="text-sm text-amber-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-4 py-3 font-semibold text-black transition hover:bg-brand-400 disabled:opacity-60"
            >
              {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-xl font-semibold">Anonim gez</h3>
          <p className="mt-2 text-sm text-white/70">
            Takip listesi çerezlerde tutulur, cihaz değiştirdiğinde sıfırlanır. Giriş yapmadan hızlıca
            dene.
          </p>
          <button
            className="mt-4 w-full rounded-lg border border-brand-500/40 bg-white/5 px-4 py-3 font-semibold text-brand-200 transition hover:bg-brand-500/10"
            onClick={startAsGuest}
          >
            {alreadyIn ? 'Panele dön' : 'Anonim devam et'}
          </button>
        </div>
      </div>
    </div>
  );
}
