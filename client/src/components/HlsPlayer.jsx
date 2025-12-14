import { useEffect, useMemo, useRef, useState } from 'react';

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
    // Zaten yüklüyse state'i güncelle ve çık
    if (window.Clappr && window.LevelSelector) {
      setLibsLoaded(true);
      return;
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        // Script DOM'da var mı kontrol et
        if (document.querySelector(`script[src="${src}"]`)) {
          // Var ama window objesi henüz oluşmadıysa bekle (Hızlı refresh durumları için)
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

    // Sıralı yükleme: Önce Clappr, Sonra Plugin
    loadScript(CLAPPR_SCRIPT_URL)
      .then(() => loadScript(LEVEL_SELECTOR_URL))
      .then(() => {
        // Script onload tetiklense bile window objesine oturması için minik bir gecikme tanıyalım
        setTimeout(() => {
            if (window.Clappr) {
                setLibsLoaded(true);
            }
        }, 100);
      })
      .catch((err) => console.error("Player scriptleri yüklenemedi:", err));
  }, []);

  // --- 2. Player Başlat ---
  useEffect(() => {
    // Temel gereksinimler yoksa başlatma
    if (!libsLoaded || !effectiveUrl || !playerDivRef.current || !window.Clappr) return;

    // Önceki player'ı temizle
    if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
    }
    
    // Div içini temizle
    playerDivRef.current.innerHTML = '';

    // --- GÜVENLİ PLUGIN YÜKLEME ---
    // Hatanın çözümü burası: Plugin undefined ise diziye eklemiyoruz.
    const plugins = [];
    if (window.LevelSelector) {
        plugins.push(window.LevelSelector);
    } else {
        console.warn("LevelSelector plugin yüklendi görünmüyor, kalite ayarı devre dışı.");
    }

    // Clappr Konfigürasyonu
    const playerInstance = new window.Clappr.Player({
      source: effectiveUrl,
      // parentId kullanmıyoruz, attachTo yapacağız
      plugins: plugins, 
      width: '100%',
      height: '100%',
      autoPlay: true,
      mute: true,
      playback: {
        hlsjsConfig: {
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        },
      },
      hlsMinimumDvrSize: 60,
      mediacontrol: {seekbar: '#53fc18', buttons: '#53fc18'},
      
      // Plugin varsa ayarları da ekle
      ...(window.LevelSelector ? {
          levelSelectorConfig: {
            title: 'Kalite',
            labelCallback: function(playbackLevel) {
                if (!playbackLevel.level.height) return 'Otomatik';
                return playbackLevel.level.height + 'p'; 
            }
          }
      } : {}),
    });

    // Player'ı DOM'a bağla
    playerInstance.attachTo(playerDivRef.current);
    playerRef.current = playerInstance;

    // --- Event Listenerlar ---
    
    // Kalite Değişimi (Sadece plugin yüklendiyse çalışır)
    if (window.LevelSelector) {
        playerInstance.on(window.Clappr.Events.PLAYBACK_LEVEL_SWITCH_END, () => {
            const playback = playerInstance.core.getCurrentPlayback();
            // Playback hazır mı kontrolü
            if (!playback) return;

            const currentLevel = playback.currentLevel;
            if (currentLevel === -1 || currentLevel === undefined) {
                setCurrentQuality('Otomatik');
            } else {
                const levels = playback.levels;
                if(levels && levels[currentLevel]) {
                    setCurrentQuality(`${levels[currentLevel].height}p`);
                }
            }
        });
    }

    // Mobil Landscape Zorlama
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

      <style>{`
        .media-control-layer .bar-fill-2 {
            background-color: #53fc18 !important;
        }
        .media-control-layer .bar-scrubber-icon {
            border-color: #53fc18 !important;
        }
        .level_selector ul {
            background-color: rgba(0, 0, 0, 0.9) !important;
            color: white !important;
            z-index: 9999;
        }
        .level_selector li {
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .level_selector li:hover, .level_selector li.current {
            color: #53fc18 !important;
            background-color: rgba(255,255,255,0.1);
        }
        .media-control-layer button:hover {
            color: #53fc18 !important;
            fill: #53fc18 !important;
        }
      `}</style>
    </div>
  );
}
