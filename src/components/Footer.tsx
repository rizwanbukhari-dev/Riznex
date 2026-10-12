import React from 'react';
import { ShieldCheck, Layers } from 'lucide-react';

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
        gap: '1.5rem',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Layers size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', letterSpacing: '-0.02em' }}>
                Riznex
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                Compress Smart. Save Space.
              </div>
            </div>
          </div>

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
            <span>Files are processed locally in your browser. Nothing is uploaded to any server.</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid #f3f4f6',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: '#9ca3af',
        }}>
          <div>
            &copy; {new Date().getFullYear()} Riznex. Online image compression tool for JPG, PNG, and WebP.
          </div>
          <div>
            Fast &bull; Private &bull; Free
          </div>
        </div>
      </div>
    </footer>
  );
};
