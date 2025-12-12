import { useEffect, useMemo, useRef, useState } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

export default function HlsPlayer({ playbackUrl, title, channel, isLive, viewerCount }) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState('Otomatik');

  const effectiveUrl = useMemo(() => {
    if (!playbackUrl) return '';
    if (import.meta.env.VITE_USE_PROXY === '1') {
      return `https://durbekle.seckick.workers.dev/?url=${encodeURIComponent(playbackUrl)}`;
    }
    return playbackUrl;
  }, [playbackUrl]);

  useEffect(() => {
    // URL değiştiğinde bu useEffect çalışır.
    // Ancak aşağıdaki return (cleanup) fonksiyonu önce çalışarak eski player'ı temizler.
    
    const video = videoRef.current;
    if (!video || !effectiveUrl) return;

    // --- AYARLAR ---
    const defaultOptions = {
      controls: [
        'play-large', 'play', 'mute', 'volume', 'settings', 'fullscreen', 'airplay'
      ],
      settings: ['quality', 'speed'],
      i18n: { quality: 'Kalite', speed: 'Hız', auto: 'Otomatik' },
      speed: { selected: 1, options: [0.5, 1, 1.5, 2] },
      autoplay: true,
      muted: true,
      clickToPlay: false,
      displayDuration: true,
      hideControls: false, // Canlı yayında kontroller kaybolmasın
      resetOnEnd: true,
    };

    // --- HLS.JS KURULUMU ---
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(effectiveUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Kalite Sıralaması
        const availableQualities = hls.levels.map((l) => l.height);
        const uniqueQualities = [0, ...new Set(availableQualities)].sort((a, b) => {
           if (a === 0) return -1;
           if (b === 0) return 1;
           return b - a; 
        });

        // Plyr Başlatma
        // Plyr, video elementini sarmalar (wrapper oluşturur).
        plyrRef.current = new Plyr(video, {
          ...defaultOptions,
          quality: {
            default: 0,
            options: uniqueQualities,
            forced: true,
            onChange: (newQuality) => {
              if (newQuality === 0) {
                hls.currentLevel = -1;
                setCurrentQuality('Otomatik');
              } else {
                const levelIndex = hls.levels.findIndex((l) => l.height === newQuality);
                hls.currentLevel = levelIndex;
                setCurrentQuality(`${newQuality}p`);
              }
            },
          },
        });

        // Oynat
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              // Fatal hata durumunda destroy etmeye çalışmıyoruz,
              // çünkü component unmount/remount ile zaten temizlenecek.
              break;
          }
        }
      });
    } 
    // --- SAFARI (Doğal HLS) ---
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = effectiveUrl;
      const onLoadedMetadata = () => {
         if (!plyrRef.current) {
             plyrRef.current = new Plyr(video, defaultOptions);
         }
         video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    }

    // --- CLEANUP (TEMİZLİK) ---
    return () => {
      // 1. Önce HLS akışını durdur (Blob hatalarını önler)
      if (hlsRef.current) {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // 2. Plyr'ı yok et
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      
      // 3. Videoyu temizle (Ama DOM'dan silmeye çalışma, React halledecek)
      // Bu adım önemlidir, video src'si kalırsa bellek şişebilir.
      // Ancak removeChild hatasını önlemek için burada DOM manipülasyonu yapmıyoruz.
    };

  }, [effectiveUrl]); 

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

      {/* KRİTİK DÜZELTME BURADA:
         key={effectiveUrl} özelliğini <video> etiketinden alıp 
         onu sarmalayan <div> etiketine taşıdık.
         
         Bu sayede React, video elementini tek tek silmeye çalışmaz (bunu yaparken Plyr ile çakışıyordu).
         Bunun yerine tüm "wrapper-div"i çöpe atar ve yenisini oluşturur.
         Bu işlem güvenlidir ve "NotFoundError" hatasını %100 çözer.
      */}
      <div 
        key={effectiveUrl} 
        className="wrapper-div overflow-hidden rounded-xl border border-white/5 bg-black plyr--video shadow-2xl"
      >
        <video
          ref={videoRef}
          className="h-full w-full"
          playsInline
          muted
          crossOrigin="anonymous"
        />
      </div>

      {/* CSS */}
      <style>{`
        .plyr--video .plyr__control--overlaid {
            background: rgba(83, 252, 24, 0.8);
        }
        .plyr--video .plyr__control.plyr__tab-focus,
        .plyr--video .plyr__control:hover,
        .plyr--video .plyr__control[aria-expanded=true] {
            background: #53fc18;
            color: #000;
        }
        .plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::before {
            background: #53fc18;
        }
      `}</style>
    </div>
  );
}