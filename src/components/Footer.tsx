import React from 'react';
import { ShieldCheck, Layers } from 'lucide-react';
import { SocialBranding } from './SocialBranding';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--bg-footer)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
      padding: '3rem 0 2rem',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.25rem',
      }}>
        {/* Top footer row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}>
          {/* Brand & Tagline */}
          <a 
            href="/"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            title="RizNex — Home"
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(167, 139, 250, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 800, 
                fontSize: '1.2rem', 
                color: 'var(--text-white)', 
                letterSpacing: '-0.02em', 
                lineHeight: 1.15 
              }}>
                RizNex
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 500 }}>
                Compress Smart. Save Space.
              </div>
            </div>
          </a>

          {/* Privacy statement matching portfolio emerald badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--accent-emerald)',
            background: 'var(--accent-emerald-subtle)',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 0 14px rgba(52, 211, 153, 0.1)',
          }}>
            <ShieldCheck size={16} />
            <span>Files processed locally in your browser. 100% private.</span>
          </div>
        </div>

        {/* Middle: Dedicated Creator Watermark & Clickable Social Profiles */}
        <div style={{
          padding: '1.75rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <SocialBranding variant="footer" />
        </div>

        {/* Bottom copyright */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-subtle)',
        }}>
          <div>
            &copy; {CURRENT_YEAR} RizNex. Online image compression tool for JPG, PNG, and WebP.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-purple)' }}>Fast</span>
            <span>&bull;</span>
            <span style={{ color: 'var(--accent-emerald)' }}>Private</span>
            <span>&bull;</span>
            <span style={{ color: 'var(--accent-blue)' }}>Free</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
