import { useEffect, useMemo, useRef, useState } from 'react';

// Linkleri sabit tutuyoruz
const CLAPPR_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js";
const LEVEL_SELECTOR_URL = "https://cdn.jsdelivr.net/npm/clappr-level-selector-plugin@latest/dist/level-selector.min.js";

export default function HlsPlayer({ playbackUrl, title, channel, isLive, viewerCount }) {
  const playerRef = useRef(null);
  const playerDivRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState('Otomatik');
  const [libsLoaded, setLibsLoaded] = useState(false);

  const effectiveUrl = useMemo(() => {
    if (!playbackUrl) return '';
    if (import.meta.env.VITE_USE_PROXY === '1') {
      return `https://durbekle.seckick.workers.dev/?url=${encodeURIComponent(playbackUrl)}`;
    }
    return playbackUrl;
  }, [playbackUrl]);

  // --- 1. Scriptleri Yükle ---
  useEffect(() => {
    if (window.Clappr && window.LevelSelector) {
      setLibsLoaded(true);
      return;
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); 
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script yüklenemedi: ${src}`));
        document.body.appendChild(script);
      });
    };

    loadScript(CLAPPR_SCRIPT_URL)
      .then(() => loadScript(LEVEL_SELECTOR_URL))
      .then(() => {
        // Script yüklense bile window objesine oturması için minik bir bekleme
        setTimeout(() => {
            if (window.Clappr) setLibsLoaded(true);
        }, 200);
      })
      .catch((err) => console.error("Player scriptleri yüklenemedi:", err));
  }, []);

  // --- 2. Player Başlat ---
  useEffect(() => {
    if (!libsLoaded || !effectiveUrl || !playerDivRef.current || !window.Clappr) return;

    // Temizlik
    if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
    }
    playerDivRef.current.innerHTML = '';

    // Eklenti Kontrolü
    const plugins = [];
    // Clappr'ın kendi HLS oynatıcısı zaten var ama level selector için plugin listesine ekliyoruz
    if (window.LevelSelector) {
        plugins.push(window.LevelSelector);
    }

    // --- Clappr Konfigürasyonu ---
    const playerInstance = new window.Clappr.Player({
      source: effectiveUrl,
      mimeType: 'application/x-mpegURL',
      plugins: plugins, 
      width: '100%',
      height: '100%',
      autoPlay: true, // Otomatik oynatmayı açar
      mute: true,     // Otomatik oynatmanın çalışması için ses kapalı başlamalıdır
      
      // KRİTİK: Kalite ayarının veriyi okuyabilmesi için bu gerekli
      playback: {
        playInline: true,
        crossOrigin: 'anonymous', 
        hlsjsConfig: {
            enableWorker: true,
            lowLatencyMode: true,
        }
      },

      // Arayüz Ayarları
      mediacontrol: {seekbar: '#53fc18', buttons: '#53fc18'},
      
      // Kalite Eklentisi Ayarları
      levelSelectorConfig: {
        title: 'Kalite',
        labelCallback: function(playbackLevel, customLabel) {
            // Hata koruması: playbackLevel bazen boş gelebilir
            if (!playbackLevel || !playbackLevel.level) return 'Otomatik';
            // 0 level genellikle 'Auto'dur ama HLS.js versiyonuna göre değişebilir
            if (playbackLevel.level.height) {
                 return playbackLevel.level.height + 'p'; 
            }
            return 'Otomatik';
        }
      },
    });

    // Player'ı div'e bağla
    playerInstance.attachTo(playerDivRef.current);
    playerRef.current = playerInstance;

    // --- Event Listenerlar ---

    // 1. Hazır olduğunda oynatmayı zorla (Ok işaretinde takılmaması için)
    playerInstance.once(window.Clappr.Events.PLAYER_READY, () => {
        playerInstance.play();
    });

    // 2. Kalite Değişimi Takibi
    playerInstance.on(window.Clappr.Events.PLAYBACK_LEVEL_SWITCH_END, () => {
        const playback = playerInstance.core.getCurrentPlayback();
        if (!playback) return;
        
        const currentLevel = playback.currentLevel;
        const levels = playback.levels;

        if (currentLevel === -1 || currentLevel === undefined || !levels || !levels[currentLevel]) {
            setCurrentQuality('Otomatik');
        } else {
            setCurrentQuality(`${levels[currentLevel].height}p`);
        }
    });

    // 3. Mobil Landscape
    playerInstance.on(window.Clappr.Events.PLAYER_FULLSCREEN, (isFullscreen) => {
        if (isFullscreen) {
            try {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            } catch(e) {}
        } else {
            try {
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            } catch(e) {}
        }
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (playerDivRef.current) {
        playerDivRef.current.innerHTML = '';
      }
    };
  }, [effectiveUrl, libsLoaded]);

  if (!playbackUrl) {
    return (
      <div className="glass-card flex min-h-[360px] items-center justify-center p-6 text-white/70">
        Henüz oynatılacak bir yayın seçilmedi.
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">{title || channel}</h3>
          <p className="text-sm text-white/60">@{channel}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-white/70">
          <span className="pill bg-white/10 text-white/70">Kalite: {currentQuality}</span>
          {Number.isFinite(viewerCount) && (
            <span className="pill bg-white/5 text-white/50">
              {viewerCount.toLocaleString('tr-TR')} izleyici
            </span>
          )}
        </div>
      </div>

      {/* Player Container */}
      <div 
        key={effectiveUrl}
        className="wrapper-div relative aspect-video overflow-hidden rounded-xl border border-white/5 bg-black shadow-2xl"
      >
        {!libsLoaded && (
             <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Player yükleniyor...
             </div>
        )}
        <div ref={playerDivRef} className="h-full w-full" />
      </div>

      {/* CSS DÜZELTMELERİ */}
      <style>{`
        /* 1. O kocaman yeşil oku ortala ve düzelt */
        .player-poster .play-wrapper {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            height: 80px !important;
            width: 80px !important;
            border-radius: 50%;
            background: rgba(0,0,0,0.5); /* Hafif arka plan */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        /* Ok ikonu */
        .player-poster .play-wrapper svg {
            height: 40px !important;
            width: 40px !important;
            margin-left: 5px; /* Optik dengeleme */
            fill: #53fc18 !important; /* Senin yeşil rengin */
        }
        
        .player-poster .play-wrapper:hover {
            background: rgba(0,0,0,0.8);
            transform: translate(-50%, -50%) scale(1.1) !important;
        }

        /* 2. Kontrol Çubuğu Renkleri */
        .media-control-layer .bar-fill-2 {
            background-color: #53fc18 !important;
        }
        .media-control-layer .bar-scrubber-icon {
            border-color: #53fc18 !important;
        }
        
        /* 3. Kalite Menüsü Görünürlüğü */
        .level_selector ul {
            background-color: rgba(0, 0, 0, 0.95) !important;
            color: white !important;
            z-index: 9999;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .level_selector li {
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 13px;
            padding: 8px 12px;
        }
        .level_selector li:hover, .level_selector li.current {
            color: #53fc18 !important;
            background-color: rgba(83, 252, 24, 0.1);
        }
        
        /* Buton Hover Efektleri */
        .media-control-layer button:hover {
            color: #53fc18 !important;
            fill: #53fc18 !important;
        }
      `}</style>
    </div>
  );
}
