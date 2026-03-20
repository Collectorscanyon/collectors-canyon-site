import { useState } from 'react'

const BADGE_STYLES = {
  accent: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black',
  gold: 'bg-gradient-to-r from-yellow-600 to-amber-500 text-black',
  muted: 'bg-canyon-elevated text-canyon-muted border border-canyon-border',
  blue: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  green: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
}

const TIER_GLOW = {
  'World Championship': 'shadow-[0_0_60px_rgba(212,130,58,0.4)]',
  'Vintage Grail': 'shadow-[0_0_50px_rgba(212,130,58,0.3)]',
  'Championship': 'shadow-[0_0_50px_rgba(212,130,58,0.35)]',
  'Neo': 'shadow-[0_0_40px_rgba(138,43,226,0.3)]',
  'Shining': 'shadow-[0_0_40px_rgba(255,215,0,0.25)]',
  'Gold Star': 'shadow-[0_0_50px_rgba(255,215,0,0.4)]',
  'Crown': 'shadow-[0_0_80px_rgba(212,130,58,0.5)]',
}

export default function FeaturedCard({
  title,
  subtitle,
  grade,
  collection,
  badge,
  badgeVariant = 'accent',
  videoUrl,
  imageUrl,
  description,
  tier = 'Featured',
  size = 'default', // 'default' | 'large' | 'small'
}) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: 'w-64 flex-shrink-0',
    default: 'w-80 flex-shrink-0',
    large: 'w-96 flex-shrink-0',
  }

  const hasVideo = videoUrl && !videoError
  const hasImage = imageUrl && !hasVideo

  return (
    <div
      className={`
        ${sizeClasses[size]}
        group relative rounded-2xl overflow-hidden
        glass-card-hover card-glow
        transition-all duration-500 ease-out
        ${TIER_GLOW[tier] || 'shadow-[0_0_30px_rgba(212,130,58,0.15)]'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video / Image Layer */}
      <div className="relative aspect-[5/7] overflow-hidden bg-canyon-dark">
        
        {/* Loading skeleton */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 bg-gradient-to-br from-canyon-elevated to-canyon-dark animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-canyon-accent/30 border-t-canyon-accent animate-spin" />
            </div>
          </div>
        )}

        {/* Video */}
        {hasVideo && (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`
              absolute inset-0 w-full h-full object-contain
              transition-opacity duration-700
              ${videoLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}

        {/* Image fallback */}
        {hasImage && (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Placeholder card art when nothing */}
        {!hasVideo && !hasImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-canyon-card to-canyon-dark">
            <div className="w-32 h-44 rounded-xl bg-gradient-to-br from-canyon-elevated to-canyon-border border border-canyon-border flex items-center justify-center">
              <span className="text-4xl">🌟</span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-canyon-deep/90 via-transparent to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-60'}
        `} />

        {/* Grade pill — bottom left */}
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-1 rounded-full bg-canyon-deep/80 backdrop-blur-sm border border-canyon-border text-canyon-sand text-sm font-bold tracking-wide">
            {grade}
          </div>
        </div>

        {/* Tier glow line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-canyon-accent/50 to-transparent" />
      </div>

      {/* Info Panel */}
      <div className="p-5 space-y-3">
        
        {/* Badge + Collection */}
        <div className="flex items-center justify-between">
          {badge && (
            <span className={`canyon-badge ${BADGE_STYLES[badgeVariant] || BADGE_STYLES.accent}`}>
              {badge}
            </span>
          )}
          {collection && (
            <span className="text-xs text-canyon-dim font-medium tracking-wide uppercase">
              {collection}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-canyon-text leading-tight group-hover:text-canyon-accent-glow transition-colors duration-300">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-canyon-muted">{subtitle}</p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-canyon-dim leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Accent border glow on hover */}
      <div className={`
        absolute inset-0 rounded-2xl pointer-events-none
        bg-gradient-to-br from-canyon-accent/10 to-transparent
        transition-opacity duration-500
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  )
}
