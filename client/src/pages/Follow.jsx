import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChannelCard from '../components/ChannelCard';
import { useAuth } from '../context/AuthContext';
import { useFollows } from '../hooks/useFollows';

export default function Follow() {
  const { user, guest, loading: authLoading } = useAuth();
  const { follows, statuses, loading, error, addFollow, removeFollow, refresh } = useFollows();
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user && !guest) {
      navigate('/');
    }
  }, [authLoading, user, guest, navigate]);

  const handleAdd = () => {
    if (!input) return;
    addFollow(input);
    setInput('');
  };

  const sortedFollows = useMemo(() => {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Takip listesi</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            Yayıncı ekle, canlı durumlarını anlık takip et.
          </h2>
          <p className="text-sm text-white/70">
            {user ? 'Takipler Firestore’a kaydediliyor.' : 'Takipler bu cihazdaki çerezlerde saklanıyor.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yayıncı Adı"
            className="w-52 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
          />
          <button
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-400"
            onClick={handleAdd}
            disabled={loading}
          >
            Ekle
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-amber-300">Hata: {error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {sortedFollows.map((slug) => (
          <ChannelCard
            key={slug}
            slug={slug}
            data={statuses[slug]}
            onPlay={() => navigate(`/player/${slug}`)}
            onRemove={removeFollow}
          />
        ))}
      </div>

      {!follows.length && !loading && (
        <div className="glass-card p-6 text-white/70">
          Henüz takip eklenmedi. Yayıncı slug&apos;ını yazarak listeye ekleyebilirsin.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
          onClick={refresh}
          disabled={loading}
        >
          Yenile
        </button>
        <Link
          to="/player"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Oynatıcıya git
        </Link>
      </div>
    </div>
  );
}
