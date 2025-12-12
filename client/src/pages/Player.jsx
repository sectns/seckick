import { useEffect, useMemo, useState, useRef } from 'react'; // useRef eklendi
import { useNavigate, useParams } from 'react-router-dom';
import HlsPlayer from '../components/HlsPlayer';
import { useAuth } from '../context/AuthContext';
import { useFollows } from '../hooks/useFollows';
import { getPlayback } from '../lib/kickApi';

export default function Player() {
  const { slug: routeSlug } = useParams();
  const { user, guest, loading: authLoading } = useAuth();
  const { follows, statuses, loading: followsLoading, refresh } = useFollows();
  const navigate = useNavigate();
  
  const [current, setCurrent] = useState(routeSlug || '');
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Race condition önlemek için son istenen kanalı takip eder
  const lastRequestedSlug = useRef(null);

  // Sıralama mantığı (Değişmedi)
  const orderedFollows = useMemo(() => {
    const orderMap = new Map(follows.map((slug, index) => [slug, index]));
    return [...follows].sort((a, b) => {
      const statusA = statuses[a] || {};
      const statusB = statuses[b] || {};
      const liveA = statusA.isLive ? 1 : 0;
      const liveB = statusB.isLive ? 1 : 0;
      if (liveA !== liveB) return liveB - liveA;

      const viewersA = Number.isFinite(statusA.viewerCount) ? statusA.viewerCount : -1;
      const viewersB = Number.isFinite(statusB.viewerCount) ? statusB.viewerCount : -1;
      if (viewersA !== viewersB) return viewersB - viewersA;

      return (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0);
    });
  }, [follows, statuses]);

  const displayFollows = useMemo(() => {
    if (current && !orderedFollows.includes(current)) {
      return [current, ...orderedFollows];
    }
    return orderedFollows;
  }, [current, orderedFollows]);

  // Auth Yönlendirmesi
  useEffect(() => {
    if (!authLoading && !user && !guest) {
      navigate('/');
    }
  }, [authLoading, user, guest, navigate]);

  // Route yönetimi
  useEffect(() => {
    if (routeSlug) {
      if (current !== routeSlug) {
        setCurrent(routeSlug);
      }
      return;
    }

    if (orderedFollows.length) {
      const next = orderedFollows[0];
      if (current !== next) setCurrent(next);
      if (routeSlug !== next) navigate(`/player/${next}`, { replace: true });
      return;
    }

    if (current) setCurrent('');
    // setPlayback(null); // Burayı kaldırdık, anlık boş ekranı önlemek için
    setError(null);
    if (routeSlug) navigate('/player', { replace: true });
  }, [routeSlug, orderedFollows, navigate, current]);

  // --- KRİTİK DÜZELTME: Veri Çekme ---
  useEffect(() => {
    if (!current) return;

    // 1. Loading durumuna geç ama playback'i hemen silme (Ekranda eski yayın donuk kalabilir veya loading döner)
    // Eğer hemen siyah ekran olsun istersen setPlayback(null) açabilirsin ama genelde istenmez.
    setLoading(true);
    setError(null);
    
    // Referansı güncelle
    lastRequestedSlug.current = current;

    getPlayback(current)
      .then((data) => {
        // Eğer istek tamamlandığında kullanıcı hala aynı kanaldaysa state'i güncelle
        // Aksi takdirde kullanıcı başka kanala geçtiyse eski veriyi basma.
        if (lastRequestedSlug.current === current) {
          setPlayback(data);
        }
      })
      .catch((err) => {
        if (lastRequestedSlug.current === current) {
          setError(err.message);
          setPlayback(null); // Sadece hata varsa player'ı temizle
        }
      })
      .finally(() => {
        if (lastRequestedSlug.current === current) {
          setLoading(false);
        }
      });
  }, [current]);

  const openChat = () => {
    if (!current) return;
    window.open(`https://kick.com/${current}/chatroom`, '_blank', 'noopener,noreferrer');
  };

  const currentStatus = statuses[current];

  // Playback verisi yoksa ama status verisi varsa (sidebar'dan gelen), onu kullan
  // Bu, API dönene kadar başlığın doğru görünmesini sağlar.
  const activeTitle = playback?.title || currentStatus?.title || current;
  const activeViewerCount = Number.isFinite(playback?.viewerCount) 
    ? playback.viewerCount 
    : currentStatus?.viewerCount;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      {/* Sidebar (Sol Menü) */}
      <div className="glass-card flex flex-col gap-4 p-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Takip edilenler</p>
            <h3 className="font-display text-xl font-semibold">Yayıncı seç</h3>
          </div>
          <button
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-white/30"
            onClick={refresh}
            disabled={followsLoading}
          >
            Yenile
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {displayFollows.map((slug) => {
            const status = statuses[slug] || {};
            const live = status.isLive;
            const viewers = Number.isFinite(status.viewerCount) ? status.viewerCount : null;
            
            // Sadece canlı olanları gösterme filtresini kaldırdım veya isteğe bağlı yapabilirsiniz.
            // Kodunuzda 'return live ? ...' vardı, eğer kapalı yayıncıları görmek isterseniz bunu düzenleyin.
            if (!live) return null; 

            return (
              <button 
                key={slug}
                onClick={() => {
                  if (current !== slug) {
                    setCurrent(slug);
                    navigate(`/player/${slug}`);
                  }
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-left transition ${
                  current === slug ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      live ? 'bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]' : 'bg-white/30'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{status.name || slug}</p>
                    <p className="text-xs text-white/60">@{slug}</p>
                  </div>
                </div>
                <span
                  className={`pill text-[10px] ${
                    live
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {viewers !== null ? `${viewers.toLocaleString('tr-TR')}` : 'Canlı'} izleyici
                </span>
              </button>
            );
          })}
          {!displayFollows.length && (
            <div className="text-sm text-white/70">
              Henüz takip listesi boş.{' '}
              <button
                className="text-brand-300 underline underline-offset-2"
                onClick={() => navigate('/follows')}
              >
                Takip ekle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Player Alanı */}
      <div className="flex flex-col gap-4">
        {error && <div className="glass-card p-4 text-sm text-red-300 bg-red-900/10 border border-red-500/20">Hata: {error}</div>}
        
        {/* HlsPlayer Componenti */}
        {/* ÖNEMLİ: key prop'unu kaldırdık veya current yerine sabit tuttuk. 
            Böylece component unmount olmaz, sadece props değişir. */}
        <HlsPlayer
          playbackUrl={playback?.playbackUrl}
          title={activeTitle}
          channel={current}
          isLive={playback?.isLive ?? currentStatus?.isLive}
          viewerCount={activeViewerCount}
        />

        <div className="glass-card flex flex-wrap items-center gap-4 p-4 text-sm text-white/80">
            {loading ? (
                 <span className="flex items-center gap-2 text-white/50">
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
                    Yayın bilgisi güncelleniyor...
                 </span>
            ) : (
                <>
                    {currentStatus?.category && (
                        <span className="pill bg-white/10">Kategori: {currentStatus.category}</span>
                    )}
                    {typeof activeViewerCount === 'number' && (
                        <span className="pill bg-white/10">İzleyici: {activeViewerCount}</span>
                    )}
                </>
            )}
          
          <button
            className="ml-auto rounded-lg bg-brand-600/80 px-4 py-2 font-semibold text-white transition hover:bg-brand-500"
            onClick={openChat}
            disabled={!current}
          >
            Sohbeti Aç
          </button>
        </div>
      </div>
    </div>
  );
}