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
      background: '#f8fafc',
    }}>
      <Header />
      <main style={{ flex: 1, padding: '1.5rem 1.25rem 3rem' }}>
        <ImageCompressor />
      </main>
      <Footer />
    </div>
  );
}

export default App;
