import React from 'react';

type Testimonial = {
  name: string;
  role: string;
  project: string;
  text: string;
  rating?: number; // 0..5
  avatarUrl?: string;
};

type Stat = {
  value: string;
  label: string;
  // simple identifier for built-in icons: 'users' | 'star' | 'handshake' | 'redo'
  icon?: 'users' | 'star' | 'handshake' | 'redo';
};

type TestimonialsProps = {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  stats?: Stat[];
  className?: string;
};

const GOLD = '#d4af37';
const LIGHT_GOLD = '#f4e5a1';

// Simple icons (SVG) so you don’t need external icon libraries
const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7" fill={GOLD}>
    <path d="M7.17 6C5.42 6 4 7.43 4 9.2c0 1.42.9 2.6 2.16 3.03-.1 2.01-1.02 3.63-2.76 4.77-.23.15-.4.37-.4.65 0 .45.36.82.8.82.17 0 .33-.05.48-.15C7.1 16.83 8 14.63 8 11.88V9.2C8 7.43 6.58 6 4.83 6h2.34zm10 0c-1.75 0-3.17 1.43-3.17 3.2v2.68c0 2.75.9 4.95 3.72 6.44.15.1.31.15.48.15.44 0 .8-.37.8-.82 0-.28-.17-.5-.4-.65-1.74-1.14-2.66-2.76-2.76-4.77A3.2 3.2 0 0 0 20 9.2C20 7.43 18.58 6 16.83 6h.34z" />
  </svg>
);

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true" fill={filled ? GOLD : 'none'} stroke={GOLD} strokeWidth={1.2}>
    <path d="M10 2.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 15.9 5.06 17.7l.94-5.49-4-3.9 5.53-.8L10 2.5z" />
  </svg>
);

const CircleIcon = ({ kind }: { kind?: Stat['icon'] }) => {
  const iconPath = {
    users: (
      <path d="M7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 17a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1H3v-1Zm9 0a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1h-8v-1Z" />
    ),
    star: (
      <path d="M12 2l2.6 5.27L20 8.3l-4 3.9L17.2 18 12 15.3 6.8 18 8 12.2 4 8.3l5.4-1.03L12 2Z" />
    ),
    handshake: (
      <path d="M2 12l4.5 4.5a2.5 2.5 0 0 0 3.54 0l1.06-1.06 1.06 1.06a2.5 2.5 0 0 0 3.54 0L20 12l-3.5-3.5-2.62 2.62-1.42-1.42 2.62-2.62L12 3 9.38 5.62l2.62 2.62-1.42 1.42-2.62-2.62L4 12Z" />
    ),
    redo: (
      <path d="M19 7v6h-6l2.2-2.2A5 5 0 1 1 11 6h2a7 7 0 1 0 2.05 13.66l.5-1.93A5 5 0 1 1 15.17 9L19 7Z" />
    ),
  }[kind || 'users'];
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0a0a0a">
        {iconPath}
      </svg>
    </div>
  );
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const Avatar: React.FC<{ name: string; src?: string }> = ({ name, src }) => {
  const [error, setError] = React.useState(false);
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return src && !error ? (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className="w-12 h-12 rounded-full object-cover ring-2"
      style={{ borderColor: GOLD }}
    />
  ) : (
    <div
      className="w-12 h-12 rounded-full grid place-items-center text-sm font-semibold"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `2px solid ${GOLD}`,
        color: GOLD,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

const StarRating: React.FC<{ rating?: number; label?: string }> = ({ rating = 5, label }) => {
  const r = clamp(Math.round(rating), 0, 5);
  return (
    <div className="flex items-center gap-1" aria-label={label || `Rated ${r} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < r} />
      ))}
    </div>
  );
};

export const Testimonials: React.FC<TestimonialsProps> = ({
  title = 'What Our Clients Say',
  subtitle = "Hear from satisfied investors and homeowners across Pakistan",
  testimonials = [
    {
      name: 'Ahmad Hassan',
      role: 'Property Investor, Lahore',
      project: 'Pearl One Courtyard',
      text:
        '“ABS Developers exceeded every expectation with their Shariah compliant approach. The transparency and Halal investment approach of ABS Developers gave us complete peace of mind. Dr. Subbayal\'s team delivered exactly what they promised. Burj Quaid is truly a masterpiece in modern architecture. From the initial consultation to project completion, their professionalism and attention to detail were remarkable.  Our investment in Pearl One Courtyard has been truly rewarding.”',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=180&auto=format&fit=crop',
    },
    {
      name: 'Muhammad Tariq',
      role: 'Business Owner, Karachi',
      project: 'Burj Quaid',
      text:
        "“The transparency and Halal investment approach of ABS Developers gave us complete peace of mind. Outstanding quality and exceptional service! The location in Bahria Town is perfect, and the amenities are world-class. The transparency and Halal investment approach of ABS Developers gave us complete peace of mind. Dr. Subbayal's team delivered exactly what they promised. Burj Quaid is truly a masterpiece in modern architecture.”",
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1558487661-9d4f01e2ad63?q=80&w=180&auto=format&fit=crop',
    },
    {
      name: 'Fatima Khan',
      role: 'Doctor, Islamabad',
      project: 'ABS Mall & Residency',
      text:
        '“Outstanding quality and exceptional service! The location in Bahria Town is perfect, and the amenities are world-class. The transparency and Halal investment approach of ABS Developers gave us complete peace of mind. Dr. Subbayal\'s team delivered exactly what they promised. Burj Quaid is truly a masterpiece in modern architecture. ABS Developers truly understands luxury living while maintaining Islamic values.”',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=180&auto=format&fit=crop',
    },
  ],
  stats = [
    { value: '5000+', label: 'Happy Clients', icon: 'users' },
    { value: '4.9/5', label: 'Average Rating', icon: 'star' },
    { value: '98%', label: 'Client Satisfaction', icon: 'handshake' },
    { value: '85%', label: 'Repeat Investors', icon: 'redo' },
  ],
  className = '',
}) => {
  return (
    <section
      aria-labelledby="testimonials-title"
      className={`relative py-20 md:py-24 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      }}
    >
      {/* subtle starry pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(212,175,55,0.12) 0.5px, transparent 0.5px)",
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            id="testimonials-title"
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

        {/* Testimonials grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t, idx) => (
            <article
              key={idx}
              className="group relative rounded-2xl p-6 md:p-8 border backdrop-blur transition transform hover:-translate-y-2"
              style={{
                background: 'rgba(26,26,26,0.75)',
                borderColor: 'rgba(212,175,55,0.25)',
                boxShadow: '0 0 0 0 rgba(212,175,55,0)',
              }}
            >
              <header className="flex items-center justify-between mb-4">
                <QuoteIcon />
                <StarRating rating={t.rating ?? 5} />
              </header>

              <p className="italic leading-relaxed text-gray-300">
                {t.text}
              </p>

              <footer className="mt-6 flex items-center gap-4">
                <Avatar name={t.name} src={t.avatarUrl} />
                <div className="min-w-0">
                  <h4
                    className="text-sm font-semibold truncate"
                    style={{ color: GOLD }}
                  >
                    {t.name}
                  </h4>
                  <p className="text-xs text-gray-400 -mt-0.5">{t.role}</p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
                      color: '#0a0a0a',
                    }}
                  >
                    {t.project}
                  </span>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Client stats */}
        {stats?.length > 0 && (
          <div
            className="grid gap-6 md:gap-8 mt-12 pt-8 border-t"
            style={{ borderColor: 'rgba(212,175,55,0.3)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl p-5 border transition hover:scale-[1.02]"
                style={{
                  background: 'rgba(26,26,26,0.6)',
                  borderColor: 'rgba(212,175,55,0.25)',
                }}
              >
                <CircleIcon kind={s.icon} />
                <div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: GOLD, fontFamily: 'Playfair Display, serif' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-300">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};