const LiveIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
  </svg>
);

const EyeIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

const TagIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 9.5 12 2l8 7.5V20a2 2 0 0 1-2 2h-4.5z" />
    <path d="M9 11.5 2 20" />
    <circle cx="14" cy="7" r="1.5" fill="currentColor" />
  </svg>
);

const PlayIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M6 4.5a1 1 0 0 1 1.54-.84l10 7a1 1 0 0 1 0 1.68l-10 7A1 1 0 0 1 6 18.5z" />
  </svg>
);

const TrashIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 7h14" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2" />
    <path d="M7 7v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" />
  </svg>
);

export default function ChannelCard({ slug, data, onPlay, onRemove }) {
  const isLive = data?.isLive;
  const avatar = data?.profilePic || data?.thumbnailUrl;
  const viewerCount = Number.isFinite(data?.viewerCount) ? data.viewerCount : null;

  return (
    <div className="glass-card flex flex-col gap-4 p-4 border border-white/10 bg-gradient-to-br from-white/5 via-black/10 to-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
              isLive ? 'shadow-[0_0_0_6px_rgba(34,197,94,0.18)]' : ''
            }`}
          >
            {avatar ? (
              <img src={avatar} alt={data?.name || slug} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-white/70">
                {(data?.name || slug).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {data?.name || slug}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isLive
                    ? 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/50'
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                <LiveIcon className="h-3.5 w-3.5" />
                {isLive ? 'Canlı' : 'Kapalı'}
              </span>
            </div>
            <p className="flex items-center gap-1 text-xs text-white/60">
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70">@</span>
              {slug}
            </p>
            {data?.title && isLive && (
              <p className="max-w-xl truncate text-sm text-white/80">{data.title.substring(0, 35)}</p>
            )}
          </div>
        </div>
        <div
          className={` ${
            isLive ? 'pill border border-emerald-400/50 bg-emerald-500/10 text-emerald-50' : 'hidden'
          }`}
        >
          <EyeIcon className="mr-2 h-3.5 w-3.5" />
          {viewerCount !== null ? `${viewerCount.toLocaleString('tr-TR')} izleyici` : 'Veri yok'}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-white/70">
      {isLive ?   data?.category && (
          <span className="pill bg-white/5">
            <TagIcon className="mr-1.5 h-3.5 w-3.5" />
            {data.category}
          </span>
        ) : null}
        {data?.raw?.followersCount ? (
          <span className="pill bg-white/5">
            {data.raw.followersCount.toLocaleString('tr-TR')} takipçi
          </span>
        ) : null}
        {!isLive && <span className="pill bg-white/5 text-white/60">Şu an çevrimdışı</span>}
      </div>

      <div className="flex items-center gap-2">
       { isLive ?   <button
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-brand-400 disabled:opacity-60"
          onClick={() => onPlay?.(slug)}
        >
        <PlayIcon className="h-4 w-4" /> :
          Oynat
        </button> : null}
        <button
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:border-red-400/60 hover:text-red-200"
          onClick={() => onRemove?.(slug)}
        >
          <TrashIcon className="h-4 w-4" />
          Sil
        </button>
      </div>
      {data?.error && <p className="text-xs text-amber-300">Hata: {data.error}</p>}
    </div>
  );
}
