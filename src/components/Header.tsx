import React from 'react';
import { Layers, ShieldCheck, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header style={{
      background: 'var(--bg-nav)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
      transition: 'all 0.25s ease',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 1.25rem',
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Brand Logo & Tool Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="/"
            onClick={(e) => {
              if (onReset) {
                e.preventDefault();
                onReset();
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.65rem',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="RizNex — Homepage"
          >
            {/* Logo Mark with Portfolio Luminous Glow */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 18px rgba(167, 139, 250, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="header-logo-icon"
            >
              <Layers size={19} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-white)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}>
                RizNex
              </span>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--accent-purple)',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}>
                Compress Smart. Save Space.
              </span>
            </div>
          </a>

          <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

          {/* Active Tool Label & Free Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Compress Image
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--accent-purple)',
              background: 'var(--accent-purple-subtle)',
              padding: '0.18rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Free
            </span>
          </div>
        </div>

        {/* Right: Security Badge & Creator link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <a
            href="https://rizwanbukhari-1.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-accent)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            className="creator-header-link"
            title="Portfolio: Syed Rizwan Bukhari"
          >
            <span>Portfolio</span>
            <ExternalLink size={13} color="var(--accent-purple)" />
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-emerald)',
            background: 'var(--accent-emerald-subtle)',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 0 14px rgba(52, 211, 153, 0.15)',
          }}>
            <ShieldCheck size={14} />
            <span className="pulse-dot" aria-hidden="true" />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </div>

      <style>{`
        .header-logo-icon:hover {
          transform: scale(1.05) rotate(3deg);
          box-shadow: 0 0 24px rgba(167, 139, 250, 0.65) !important;
        }
        @media (min-width: 640px) {
          .creator-header-link {
            display: inline-flex !important;
          }
        }
        .creator-header-link:hover {
          background: var(--accent-purple) !important;
          color: #08090d !important;
          border-color: var(--accent-purple) !important;
          box-shadow: var(--shadow-purple-glow) !important;
          transform: translateY(-1px);
        }
        .creator-header-link:hover svg {
          stroke: #08090d !important;
        }
      `}</style>
    </header>
  );
};
