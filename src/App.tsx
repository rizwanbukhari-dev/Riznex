import React from 'react';
import './App.css';
import { Header } from './components/Header';
import { ImageCompressor } from './components/ImageCompressor';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-body)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Ambient Background Radial Glows & Grid Pattern (Matches Portfolio) */}
      <div className="bg-glow-orb bg-glow-1" aria-hidden="true" />
      <div className="bg-glow-orb bg-glow-2" aria-hidden="true" />
      <div className="bg-glow-orb bg-glow-3" aria-hidden="true" />
      <div className="bg-grid-pattern" aria-hidden="true" />

      {/* Main Content Hierarchy */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem 1.25rem 3.5rem' }}>
          <ImageCompressor />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
