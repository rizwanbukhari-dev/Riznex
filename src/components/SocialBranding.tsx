import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface SocialBrandingProps {
  variant?: 'footer' | 'standalone';
}

export const SocialBranding: React.FC<SocialBrandingProps> = ({ variant: _variant = 'footer' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.25rem',
      width: '100%',
    }}>
      {/* 1. Creator Watermark matching Syed Rizwan Bukhari's dark portfolio theme */}
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          padding: '0.55rem 1.35rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 4px 20px -2px rgba(167, 139, 250, 0.25), 0 2px 8px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
        }}
        className="watermark-container"
      >
        {/* Brand Link: RizNex -> Homepage */}
        <a
          href="/"
          className="watermark-brand-link"
          aria-label="RizNex Homepage"
          title="RizNex — Homepage"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '0.95rem',
            letterSpacing: '-0.02em',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          <Sparkles size={14} color="var(--accent-purple)" />
          <span>RizNex</span>
        </a>

        {/* Separator */}
        <span style={{ color: 'rgba(167, 139, 250, 0.35)', fontWeight: 300, fontSize: '0.85rem' }}>
          |
        </span>

        {/* Creator Link -> Portfolio */}
        <a
          href="https://rizwanbukhari-1.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="watermark-creator-link"
          aria-label="Built by Syed Rizwan Bukhari — Open developer portfolio"
          title="Visit Syed Rizwan Bukhari's Developer Portfolio"
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
        >
          <span>Built by <strong style={{ color: 'var(--accent-purple-light)' }}>Syed Rizwan Bukhari</strong></span>
          <ExternalLink size={13} color="var(--accent-purple)" />
        </a>
      </div>

      {/* 2. All Four Clickable Social Media Platforms */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
      }}>
        {/* Instagram Profile */}
        <a
          href="https://www.instagram.com/rizwanbukhari.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn"
          aria-label="Visit Syed Rizwan Bukhari on Instagram (@rizwanbukhari.dev)"
          title="Instagram: @rizwanbukhari.dev"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
          </svg>
        </a>

        {/* GitHub Profile */}
        <a
          href="https://github.com/rizwanbukhari-dev"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn"
          aria-label="Visit Syed Rizwan Bukhari on GitHub (@rizwanbukhari-dev)"
          title="GitHub: @rizwanbukhari-dev"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
        </a>

        {/* LinkedIn Profile */}
        <a
          href="https://www.linkedin.com/in/rizwan-bukahri-dev-9a9bba441/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn"
          aria-label="Connect with Syed Rizwan Bukhari on LinkedIn"
          title="LinkedIn: Syed Rizwan Bukhari"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>

        {/* Facebook Profile */}
        <a
          href="https://www.facebook.com/profile.php?id=61594112017570"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-btn"
          aria-label="Visit Syed Rizwan Bukhari on Facebook (Rizwan Bukhari Dev)"
          title="Facebook: Rizwan Bukhari Dev"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </a>
      </div>

      {/* Scoped CSS for hover animations and purple glowing styling matching portfolio */}
      <style>{`
        .watermark-container:hover {
          border-color: var(--accent-purple) !important;
          box-shadow: 0 0 24px rgba(167, 139, 250, 0.4), 0 4px 14px rgba(0, 0, 0, 0.7) !important;
          transform: translateY(-2px);
        }
        .watermark-brand-link:hover {
          opacity: 0.9;
        }
        .watermark-creator-link:hover {
          color: #ffffff !important;
        }
        .social-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-accent);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          backdrop-filter: blur(8px);
        }
        .social-icon-btn:hover {
          background: var(--accent-purple);
          color: #08090d !important;
          border-color: var(--accent-purple);
          transform: translateY(-3px);
          box-shadow: var(--shadow-purple-glow);
        }
        .social-icon-btn:hover svg {
          stroke: #08090d;
        }
        .social-icon-btn:active {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
