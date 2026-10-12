import React from 'react';
import { Layers, ShieldCheck, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 1.25rem',
        height: '62px',
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
              gap: '0.6rem',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="RizNex — Homepage"
          >
            {/* Logo Mark */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}>
              <Layers size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}>
                RizNex
              </span>
              <span style={{
                fontSize: '0.7rem',
                color: '#6b7280',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}>
                Compress Smart. Save Space.
              </span>
            </div>
          </a>

          <div style={{ width: '1px', height: '22px', background: '#e5e7eb' }} />

          {/* Active Tool Label & Free Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#1f2937',
              letterSpacing: '-0.01em',
            }}>
              Compress Image
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#2563eb',
              background: '#eff6ff',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
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
              gap: '0.35rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#6b7280',
              textDecoration: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
            }}
            className="creator-header-link"
            title="Portfolio: Syed Rizwan Bukhari"
          >
            <span>Portfolio</span>
            <ExternalLink size={12} color="#a855f7" />
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#059669',
            background: '#ecfdf5',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0',
          }}>
            <ShieldCheck size={14} />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .creator-header-link {
            display: inline-flex !important;
          }
        }
        .creator-header-link:hover {
          background: #f3f4f6 !important;
          color: #7c3aed !important;
          border-color: #c4b5fd !important;
        }
      `}</style>
    </header>
  );
};
