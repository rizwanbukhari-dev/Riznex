import React from 'react';
import { ShieldCheck, Layers } from 'lucide-react';
import { SocialBranding } from './SocialBranding';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto',
      padding: '2.5rem 0 2rem',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
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
              gap: '0.65rem',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            title="RizNex — Home"
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Layers size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                RizNex
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                Compress Smart. Save Space.
              </div>
            </div>
          </a>

          {/* Privacy statement */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: '#059669',
            background: '#ecfdf5',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0',
          }}>
            <ShieldCheck size={16} />
            <span>Files processed locally in your browser. Nothing uploaded to any server.</span>
          </div>
        </div>

        {/* Middle: Dedicated Creator Watermark & Clickable Social Profiles */}
        <div style={{
          padding: '1.5rem 0',
          borderTop: '1px solid #f3f4f6',
          borderBottom: '1px solid #f3f4f6',
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
          fontSize: '0.78rem',
          color: '#9ca3af',
        }}>
          <div>
            &copy; {new Date().getFullYear()} RizNex. Online image compression tool for JPG, PNG, and WebP.
          </div>
          <div>
            Fast &bull; Private &bull; Free
          </div>
        </div>
      </div>
    </footer>
  );
};
