import { useEffect, useMemo, useState, useRef } from 'react';
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

  const lastRequestedSlug = useRef(null);

  // --- DEĞİŞİKLİK BURADA ---
  // Sadece CANLI olanları filtrele ve sırala
  const orderedFollows = useMemo(() => {
    // 1. Adım: Sadece canlı olanları al
    const liveOnly = follows.filter(slug => statuses[slug]?.isLive);

    // 2. Adım: İzleyici sayısına göre çoktan aza sırala
    return liveOnly.sort((a, b) => {
      const viewersA = statuses[a]?.viewerCount || 0;
      const viewersB = statuses[b]?.viewerCount || 0;
      return viewersB - viewersA;
    });
  }, [follows, statuses]);

  // Sidebar listesi için logic
  const displayFollows = useMemo(() => {
    // Eğer şu an izlenen kanal listede yoksa (örneğin URL'den manuel girildiyse ama canlıysa) listeye ekle
    if (current && !orderedFollows.includes(current)) {
      // Ancak buraya da bir kontrol koyuyoruz, eğer current offline ise listeye zorla ekleme
      const isCurrentLive = statuses[current]?.isLive;
      if (isCurrentLive) {
          return [current, ...orderedFollows];
      }
    }
    return orderedFollows;
  }, [current, orderedFollows, statuses]);

  // Auth Yönlendirmesi
  useEffect(() => {
    if (!authLoading && !user && !guest) {
      navigate('/');
    }
  }, [authLoading, user, guest, navigate]);

  // Route ve Otomatik Seçim Yönetimi
  useEffect(() => {
    // 1. URL'de slug varsa onu kullan
    if (routeSlug) {
      if (current !== routeSlug) {
        setCurrent(routeSlug);
      }
      return;
    }

    // 2. URL boşsa ve canlı yayın varsa ilk sıradakine git
    if (orderedFollows.length) {
      const next = orderedFollows[0];
      if (current !== next) setCurrent(next);
      if (routeSlug !== next) navigate(`/player/${next}`, { replace: true });
      return;
    }

    // 3. Hiçbir şey yoksa state'i temizle
    if (current) setCurrent('');
    setError(null);
    if (routeSlug) navigate('/player', { replace: true });
  }, [routeSlug, orderedFollows, navigate, current]);

  // Veri Çekme (Playback)
  useEffect(() => {
    if (!current) return;

    setLoading(true);
    setError(null);
    lastRequestedSlug.current = current;

    getPlayback(current)
      .then((data) => {
        if (lastRequestedSlug.current === current) {
          setPlayback(data);
        }
      })
      .catch((err) => {
        if (lastRequestedSlug.current === current) {
          setError(err.message);
          setPlayback(null);
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
  const activeTitle = playback?.title || currentStatus?.title || current;
  const activeViewerCount = Number.isFinite(playback?.viewerCount) 
    ? playback.viewerCount 
    : currentStatus?.viewerCount;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      {/* Sidebar */}
      <div className="glass-card flex flex-col gap-4 p-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Canlı Yayınlar</p>
            <h3 className="font-display text-xl font-semibold">Yayıncı Seç</h3>
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
            // Burada artık "if (!live) return null" kontrolüne gerek yok
            // Çünkü displayFollows zaten filtrelenmiş listeden geliyor.
            const viewers = Number.isFinite(status.viewerCount) ? status.viewerCount : null;

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
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">{status.name || slug}</p>
                    <p className="text-xs text-white/60">@{slug}</p>
                  </div>
                </div>
                <span className="pill text-[10px] bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                  {viewers !== null ? `${viewers.toLocaleString('tr-TR')}` : 'Canlı'} izleyici
                </span>
              </button>
            );
          })}
          
          {!displayFollows.length && (
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
              <p>Şu an takip ettiğin kimse yayında değil.</p>
              <button
                className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
                onClick={() => navigate('/follows')}
              >
                Takip listesini düzenle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Player Alanı */}
      <div className="flex flex-col gap-4">
        {error && <div className="glass-card p-4 text-sm text-red-300 bg-red-900/10 border border-red-500/20">Hata: {error}</div>}
        
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
