import React from 'react';

type VideoItem = {
  src: string;         // mp4 URL
  title: string;
  subtitle?: string;
  duration?: string;   // e.g. "0:55"
  thumbnail: string;   // poster/thumbnail URL
};

type ExperienceVisionProps = {
  title?: string;
  subtitle?: string;
  videos?: VideoItem[];
  className?: string;
};

const GOLD = '#d4af37';
const LIGHT_GOLD = '#f4e5a1';

const PlayIcon = ({ size = 28 }: { size?: number }) => (
  <div
    className="rounded-full grid place-items-center shadow-lg"
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
      boxShadow: '0 8px 25px rgba(212,175,55,0.4)',
    }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" fill="#0a0a0a">
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
);

export const ExperienceVision: React.FC<ExperienceVisionProps> = ({
  title = 'Experience Our Vision',
  subtitle = 'Take a virtual tour of our latest developments and architectural excellence',
  videos = [
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/61798715595a4da7a953a94b9615ab58.mp4',
      title: 'Pearl One Courtyard',
      subtitle: 'Flagship luxury residential development',
      duration: '0:55',
      thumbnail: '/images/files-POC-1_1_1375e22c-6fbc-4623-bbff-6f72a6f9709f.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/77928958ac3f4bdf98ba216f3cb2a41f.mp4',
      title: 'Pearl One Courtyard 2',
      subtitle: 'Luxury residential complex with modern amenities',
      duration: '0:57',
      thumbnail: '/images/files-POC-2.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/726e6535c00a4fb7a02143f736227ce9.mp4',
      title: 'Pearl One Courtyard 3',
      subtitle: 'Next phase of our flagship residential series',
      duration: '1:15',
      thumbnail: '/images/files-POC-3.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/95ce0a649cbf43bba5ded3aa7c949e0a.mp4',
      title: 'ABS Mall & Residency',
      subtitle: 'Mixed-use development with retail spaces',
      duration: '0:44',
      thumbnail: '/images/files-ABS-MALL.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/20d24d4d55ff42b8b7dbba7c4ca3f705.mp4',
      title: 'ABS Mall & Residency 2',
      subtitle: 'Integrated shopping and living experience',
      duration: '0:41',
      thumbnail: '/images/files-ABS-MALL-2.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/45d6618a4e494fc583fea986155d367b.mp4',
      title: 'Pearl One Tower',
      subtitle: 'Iconic tower with panoramic city views',
      duration: '1:57',
      thumbnail: '/images/files-POT.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/ed7afa3b96de4fd7b3d5b53a02e8f3df.mp4',
      title: 'Pearl One Premium',
      subtitle: 'Ultra-luxury residential development',
      duration: '0:58',
      thumbnail: '/images/files-POP.png',
    },
    {
      src: 'https://cdn.shopify.com/videos/c/o/v/d3dd1491e33345fb9553878dafe77c27.mp4',
      title: 'Pearl One Capital',
      subtitle: 'Premier mixed-use development project',
      duration: '1:02',
      thumbnail: '/images/files-POCAPITAL.png',
    },
  ],
  className = '',
}) => {
  const [active, setActive] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const activeVideo = videos[active];

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSelect = (idx: number) => {
    setActive(idx);
    setIsPlaying(false);
    // load new source; on loadedmetadata we can optionally autoplay
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        // Do not auto-play for UX parity with original; user taps play
      }
    });
  };

  return (
    <section
      aria-labelledby="vision-title"
      className={`relative py-16 md:py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}
    >
      {/* subtle gold dot pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(212,175,55,0.1) 1px, transparent 1px)",
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            id="vision-title"
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{
              backgroundImage: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Layout: featured video + gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Featured video (2/3 on md+) */}
          <div className="md:col-span-2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              {/* Video element */}
              <video
                ref={videoRef}
                key={activeVideo?.src}
                className="w-full h-auto block aspect-video"
                poster={activeVideo?.thumbnail}
                preload="metadata"
                controls={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={activeVideo?.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play overlay when not playing */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center focus:outline-none"
                  aria-label={`Play ${activeVideo?.title}`}
                >
                  {/* Dim overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
                  {/* Center play button */}
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full grid place-items-center shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`, boxShadow: '0 12px 40px rgba(212,175,55,0.45)' }}>
                      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0a0a0a">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute left-0 right-0 bottom-0 p-4 text-white">
                    <h3 className="m-0 text-lg font-semibold" style={{ color: GOLD }}>
                      {activeVideo?.title}
                    </h3>
                    {activeVideo?.subtitle && (
                      <p className="m-0 text-sm text-gray-300">{activeVideo.subtitle}</p>
                    )}
                    {activeVideo?.duration && (
                      <span
                        className="inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ background: `rgba(212,175,55,0.9)`, color: '#0a0a0a' }}
                      >
                        {activeVideo.duration}
                      </span>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Gallery (1/3 on md+) */}
          <div
            className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1
                       md:pr-2 md:overflow-y-auto
                       md:[scrollbar-width:thin]"
          >
            {/* Mobile: make it horizontal scrolling */}
            <div className="flex md:block gap-4 overflow-x-auto md:overflow-x-hidden">
              {videos.map((v, idx) => {
                const isActive = active === idx;
                return (
                  <button
                    key={v.src}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    aria-pressed={isActive}
                    className={`flex items-center gap-3 rounded-xl border p-3 min-w-[260px] md:min-w-0
                                transition hover:translate-x-2 md:hover:translate-x-2`}
                    style={{
                      background: 'rgba(26,26,26,0.6)',
                      borderColor: isActive ? GOLD : 'rgba(212,175,55,0.2)',
                    }}
                  >
                    {/* Thumb */}
                    <div className="relative w-28 h-16 rounded-md overflow-hidden shrink-0">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 grid place-items-center">
                        <PlayIcon size={24} />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-left">
                      <h4 className="text-sm font-semibold m-0" style={{ color: GOLD }}>
                        {v.title}
                      </h4>
                      {v.subtitle && (
                        <p className="text-xs text-gray-300 m-0 line-clamp-2">{v.subtitle}</p>
                      )}
                      {v.duration && (
                        <span className="text-[11px]" style={{ color: GOLD }}>
                          {v.duration}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceVision;
