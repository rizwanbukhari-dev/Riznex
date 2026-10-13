import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  AlertCircle, 
  FileArchive, 
  ArrowRight,
  Target,
  Sliders,
  Check,
  Info
} from 'lucide-react';
import { ImageItem, CompressionSettings, CompressionLevel, CompressionMode } from '../types';
import { 
  readFileToImageItem, 
  compressSingleImage, 
  downloadAllAsZip, 
  downloadSingleImage, 
  formatBytes,
  isValidImageFile 
} from '../utils/imageCompressor';
import confetti from 'canvas-confetti';

export const ImageCompressor: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressCount, setProgressCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compression Mode: 'standard' or 'target'
  const [mode, setMode] = useState<CompressionMode>('standard');
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [formatPreference, _setFormatPreference] = useState<'smart' | 'keep'>('smart');

  // Target Size (KB) settings
  const [targetKBInput, setTargetKBInput] = useState<string>('200');
  const [allowDownscale, setAllowDownscale] = useState<boolean>(true);
  const [targetError, setTargetError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // Handle file additions
  const handleFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const filesArray = Array.from(fileList);
    const validFiles = filesArray.filter(isValidImageFile);

    if (validFiles.length < filesArray.length) {
      setErrorMsg('Some files were ignored because only JPEG, PNG, and WebP are supported.');
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid image files (JPEG, PNG, or WebP).');
      return;
    }

    try {
      const loadedItems = await Promise.all(validFiles.map(readFileToImageItem));
      setImages((prev) => [...prev, ...loadedItems]);
      setIsCompleted(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error reading image files.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setIsCompleted(false);
    setErrorMsg(null);
    setTargetError(null);
  };

  // Run Compression
  const handleCompressAll = async () => {
    if (images.length === 0 || isProcessing) return;

    // Validate target KB if in target mode
    let parsedTargetKB = 200;
    if (mode === 'target') {
      parsedTargetKB = parseInt(targetKBInput.trim(), 10);
      if (isNaN(parsedTargetKB) || parsedTargetKB <= 0) {
        setTargetError('Please enter a valid target size greater than 0 KB (e.g. 100 KB, 200 KB).');
        return;
      }
      setTargetError(null);
    }

    setIsProcessing(true);
    setProgressCount(0);
    setErrorMsg(null);

    const settings: CompressionSettings = {
      mode,
      level,
      quality: level === 'recommended' ? 0.78 : level === 'high' ? 0.58 : 0.88,
      formatPreference,
      targetKB: parsedTargetKB,
      allowDownscale,
    };

    const updatedList: ImageItem[] = [];

    for (let i = 0; i < images.length; i++) {
      const current = images[i];
      setProgressCount(i + 1);

      try {
        const compressed = await compressSingleImage(current, settings);
        updatedList.push(compressed);
      } catch (err: any) {
        updatedList.push({
          ...current,
          status: 'error',
          errorMessage: err.message || 'Compression failed.',
        });
      }
    }

    setImages(updatedList);
    setIsProcessing(false);
    setIsCompleted(true);

    // Fire celebration confetti matching portfolio palette
    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#a78bfa', '#38bdf8', '#34d399', '#c4b5fd', '#818cf8'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleDownloadAll = async () => {
    await downloadAllAsZip(images);
  };

  // Calculations for total savings
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || img.originalSize), 0);
  const totalSavingsBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalSavingsPercentage = totalOriginalSize > 0 
    ? Math.round((totalSavingsBytes / totalOriginalSize) * 100) 
    : 0;

  const validTargetKB = parseInt(targetKBInput, 10);

  return (
    <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFilesAdded(e.target.files)}
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFilesAdded(e.target.files)}
      />

      {/* Global Error Alert */}
      {errorMsg && (
        <div style={{
          maxWidth: '820px',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#fca5a5',
          fontSize: '0.88rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <AlertCircle size={18} color="#f87171" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================
          STATE 1: EMPTY UPLOAD STATE
          ======================================================== */}
      {images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem 3rem' }}>
          {/* Subtle Tagline Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-purple)',
            marginBottom: '1rem',
          }}>
            <span style={{
              width: '18px',
              height: '2px',
              background: 'var(--accent-purple)',
              borderRadius: '2px',
              display: 'inline-block',
            }} />
            <span>High-Speed In-Browser Compression</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 800,
            color: 'var(--text-white)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '0.85rem',
          }}>
            Compress <span style={{
              background: 'var(--accent-gradient-text)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>IMAGE</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.75rem',
            lineHeight: 1.6,
          }}>
            Compress your images online and reduce file size while maintaining stunning visual quality. 100% private in your browser.
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              background: 'var(--bg-card)',
              border: '2px dashed var(--border-accent)',
              borderRadius: '24px',
              padding: '4rem 2rem',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.background = 'var(--bg-card-hover)';
              e.currentTarget.style.boxShadow = 'var(--shadow-purple-glow), var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <button
              type="button"
              className="btn-primary"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '1.15rem 3rem',
                borderRadius: '14px',
                pointerEvents: 'none',
                marginBottom: '1.25rem',
                gap: '0.8rem',
              }}
            >
              <Upload size={24} />
              <span>Select images</span>
            </button>

            <div style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              or drop images here
            </div>

            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              JPG, PNG, or WebP &bull; Select single or multiple images
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 2: REVIEW QUEUE (Images selected, configure mode)
          ======================================================== */}
      {images.length > 0 && !isCompleted && !isProcessing && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.5rem 0 3rem' }}>
          {/* Top Review Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-heading)' }}>
                Images Selected ({images.length})
              </h2>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total original size: <strong style={{ color: 'var(--accent-purple-light)', fontFamily: 'var(--font-mono)' }}>{formatBytes(totalOriginalSize)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => addMoreInputRef.current?.click()}
                className="btn-secondary"
                style={{ fontSize: '0.86rem', padding: '0.55rem 1rem' }}
              >
                <Plus size={16} />
                <span>Add more images</span>
              </button>

              <button
                onClick={clearAll}
                className="btn-secondary danger-clear-btn"
                style={{
                  fontSize: '0.86rem',
                  padding: '0.55rem 1rem',
                  color: '#fca5a5',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.08)',
                }}
              >
                <Trash2 size={16} />
                <span>Clear all</span>
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))',
            gap: '1.15rem',
            marginBottom: '2rem',
          }}>
            {images.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all var(--transition-normal)',
                }}
                className="image-queue-card"
              >
                <div style={{
                  height: '160px',
                  background: 'rgba(8, 9, 13, 0.85)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                  />

                  <button
                    onClick={() => removeImage(item.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'rgba(10, 12, 18, 0.85)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.2s ease',
                    }}
                    className="remove-img-btn"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ padding: '0.85rem 0.95rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: 'var(--text-white)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }} title={item.name}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {item.width} &times; {item.height} px
                    </div>
                  </div>

                  <div style={{
                    marginTop: '0.65rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Original:</span>
                    <span style={{ color: 'var(--accent-purple-light)', fontFamily: 'var(--font-mono)' }}>{formatBytes(item.originalSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Settings & Action Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-heading)' }}>
                  Compression Mode:
                </span>
                <div style={{
                  display: 'inline-flex',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px',
                  borderRadius: '10px',
                }}>
                  <button
                    onClick={() => { setMode('standard'); setTargetError(null); }}
                    style={{
                      padding: '0.5rem 1.1rem',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      background: mode === 'standard' ? 'var(--accent-gradient)' : 'transparent',
                      color: mode === 'standard' ? '#08090d' : 'var(--text-muted)',
                      boxShadow: mode === 'standard' ? '0 2px 10px rgba(167, 139, 250, 0.35)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <Sliders size={15} />
                    <span>Standard Quality</span>
                  </button>

                  <button
                    onClick={() => { setMode('target'); setTargetError(null); }}
                    style={{
                      padding: '0.5rem 1.1rem',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      background: mode === 'target' ? 'var(--accent-gradient)' : 'transparent',
                      color: mode === 'target' ? '#08090d' : 'var(--text-muted)',
                      boxShadow: mode === 'target' ? '0 2px 10px rgba(167, 139, 250, 0.35)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <Target size={15} />
                    <span>Target Size (KB)</span>
                  </button>
                </div>
              </div>

              {mode === 'target' && (
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--accent-emerald)',
                  background: 'var(--accent-emerald-subtle)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  fontWeight: 700,
                }}>
                  Iterative Size Optimizer
                </div>
              )}
            </div>

            {/* Mode 1: Standard Compression Settings */}
            {mode === 'standard' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.5rem' }}>
                    Quality Profile
                  </div>
                  <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'recommended', label: 'Recommended', desc: 'Best balance of quality and file size' },
                      { id: 'high', label: 'Extreme', desc: 'Smaller file size, higher compression' },
                      { id: 'light', label: 'Light', desc: 'Minimal compression, maximum quality' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setLevel(opt.id as CompressionLevel)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: level === opt.id ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                          color: level === opt.id ? '#08090d' : 'var(--text-secondary)',
                          border: '1px solid',
                          borderColor: level === opt.id ? 'var(--accent-purple)' : 'var(--border-subtle)',
                          boxShadow: level === opt.id ? 'var(--shadow-purple-glow)' : 'none',
                          transition: 'all var(--transition-fast)',
                        }}
                        title={opt.desc}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={handleCompressAll}
                  className="btn-primary"
                  style={{
                    fontSize: '1.15rem',
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    minWidth: '240px',
                  }}
                >
                  <span>Compress {images.length} {images.length === 1 ? 'Image' : 'Images'}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Mode 2: Target File Size (KB) Option */}
            {mode === 'target' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}>
                  {/* Target Input and Presets */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-white)',
                      marginBottom: '0.5rem',
                    }}>
                      Target size (KB)
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1.5px solid',
                        borderColor: targetError ? '#ef4444' : 'var(--border-accent)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'border-color 0.2s ease',
                      }}>
                        <input
                          type="number"
                          min="5"
                          step="10"
                          placeholder="e.g. 200"
                          value={targetKBInput}
                          onChange={(e) => {
                            setTargetKBInput(e.target.value);
                            setTargetError(null);
                          }}
                          style={{
                            width: '120px',
                            padding: '0.6rem 0.8rem',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: 'var(--text-white)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                        <span style={{
                          padding: '0.6rem 0.9rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--accent-purple-light)',
                          borderLeft: '1px solid var(--border-subtle)',
                        }}>
                          KB
                        </span>
                      </div>

                      {/* Quick Target Presets */}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {[50, 100, 200, 300, 500, 1000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setTargetKBInput(preset.toString());
                              setTargetError(null);
                            }}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              background: targetKBInput === preset.toString() ? 'var(--accent-purple-subtle)' : 'rgba(255, 255, 255, 0.04)',
                              color: targetKBInput === preset.toString() ? 'var(--accent-purple)' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: targetKBInput === preset.toString() ? 'var(--accent-purple)' : 'var(--border-subtle)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {preset < 1000 ? `${preset} KB` : '1 MB'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {targetError && (
                      <div style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {targetError}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Riznex iteratively adjusts quality in your browser to get as close as possible to your desired file size.
                    </div>

                    {/* Resize Dimensions Checkbox */}
                    <div style={{ marginTop: '0.95rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={allowDownscale}
                          onChange={(e) => setAllowDownscale(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                        />
                        <span>Auto-resize dimensions if needed to achieve small target</span>
                      </label>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: '1.65rem', marginTop: '2px' }}>
                        Recommended for very small targets (e.g. 50-100 KB) on high-resolution photos where quality alone is not enough.
                      </div>
                    </div>
                  </div>

                  {/* Big "Compress to Target Size" Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <button
                      onClick={handleCompressAll}
                      className="btn-primary"
                      style={{
                        fontSize: '1.15rem',
                        padding: '1.05rem 2.5rem',
                        borderRadius: '12px',
                        minWidth: '260px',
                      }}
                    >
                      <Target size={20} />
                      <span>Compress to Target Size</span>
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginRight: '4px', fontFamily: 'var(--font-mono)' }}>
                      Goal: &le; {validTargetKB || 200} KB per image
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 3: COMPRESSING IN PROGRESS
          ======================================================== */}
      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '4.5rem 1rem', maxWidth: '540px', margin: '0 auto' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            border: '4px solid rgba(167, 139, 250, 0.15)',
            borderTopColor: 'var(--accent-purple)',
            boxShadow: 'var(--shadow-purple-glow)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1.75rem',
          }} />

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.6rem', fontFamily: 'var(--font-heading)' }}>
            {mode === 'target' ? 'Optimizing to target file size...' : 'Compressing your images...'}
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            {mode === 'target' 
              ? `Iterating quality & encoding to reach ~${targetKBInput} KB (Image ${progressCount} of ${images.length})...`
              : `Processing image ${progressCount} of ${images.length} directly in your browser.`}
          </p>

          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(progressCount / images.length) * 100}%`,
              height: '100%',
              background: 'var(--accent-gradient)',
              boxShadow: '0 0 12px rgba(167, 139, 250, 0.6)',
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 4: RESULTS & DOWNLOADS (Complete)
          ======================================================== */}
      {isCompleted && !isProcessing && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.5rem 0 3.5rem' }}>
          {/* Success Banner */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid rgba(52, 211, 153, 0.35)',
            borderRadius: '20px',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 25px rgba(52, 211, 153, 0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            marginBottom: '2rem',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-emerald-subtle)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem',
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
              Your images have been compressed!
            </h2>

            {/* Total Savings Metrics */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.7rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-card)',
              margin: '1.15rem auto 1.75rem',
              fontSize: '0.98rem',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {formatBytes(totalOriginalSize)} &rarr; <strong style={{ color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>{formatBytes(totalCompressedSize)}</strong>
              </span>
              <span style={{
                color: totalSavingsPercentage > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontWeight: 700,
                background: totalSavingsPercentage > 0 ? 'var(--accent-emerald-subtle)' : 'rgba(255, 255, 255, 0.05)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: totalSavingsPercentage > 0 ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
              }}>
                {totalSavingsPercentage > 0 ? `-${totalSavingsPercentage}%` : 'Optimal size'}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadAll}
                className="btn-primary"
                style={{
                  fontSize: '1.05rem',
                  padding: '0.9rem 2.2rem',
                  borderRadius: '12px',
                }}
              >
                {images.length > 1 ? (
                  <>
                    <FileArchive size={20} />
                    <span>Download All Images (ZIP)</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Compressed Image</span>
                  </>
                )}
              </button>

              <button
                onClick={clearAll}
                className="btn-secondary"
                style={{ fontSize: '0.95rem', padding: '0.9rem 1.6rem', borderRadius: '12px' }}
              >
                <RotateCcw size={18} />
                <span>Compress More Images</span>
              </button>
            </div>
          </div>

          {/* Compressed Items List */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '1.15rem', fontFamily: 'var(--font-heading)' }}>
              Compression Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {images.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.95rem 1.15rem',
                    background: 'rgba(13, 15, 22, 0.75)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.55rem',
                    transition: 'border-color 0.2s ease',
                  }}
                  className="breakdown-row"
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                  }}>
                    {/* Left: Thumbnail & Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', minWidth: '220px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(8, 9, 13, 0.85)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <img
                          src={item.compressedUrl || item.previewUrl}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '46px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-white)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                          {item.compressedWidth || item.width} &times; {item.compressedHeight || item.height} px
                        </div>
                      </div>
                    </div>

                    {/* Middle: Before & After Size & Target Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>Original: <strong style={{ color: 'var(--text-secondary)' }}>{formatBytes(item.originalSize)}</strong></span>
                        <span style={{ margin: '0 0.5rem', color: 'var(--accent-purple)' }}>&rarr;</span>
                        <span>Final: <strong style={{ color: 'var(--text-white)' }}>{formatBytes(item.compressedSize || item.originalSize)}</strong></span>
                      </div>

                      {/* Target Achievement Status */}
                      {item.targetKB && (
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.22rem 0.7rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: item.targetAchieved ? 'var(--accent-emerald-subtle)' : 'rgba(245, 158, 11, 0.12)',
                          color: item.targetAchieved ? 'var(--accent-emerald)' : '#fbbf24',
                          border: '1px solid',
                          borderColor: item.targetAchieved ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {item.targetAchieved ? (
                            <>
                              <Check size={12} />
                              <span>Target Met (&le; {item.targetKB} KB)</span>
                            </>
                          ) : (
                            <>
                              <Info size={12} />
                              <span>Closest: {formatBytes(item.compressedSize || 0)}</span>
                            </>
                          )}
                        </span>
                      )}

                      {/* Savings Percentage */}
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        background: (item.savingsPercentage ?? 0) > 0 ? 'var(--accent-emerald-subtle)' : 'rgba(255, 255, 255, 0.05)',
                        color: (item.savingsPercentage ?? 0) > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        border: (item.savingsPercentage ?? 0) > 0 ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {(item.savingsPercentage ?? 0) > 0 ? `-${item.savingsPercentage}%` : 'Optimal'}
                      </span>
                    </div>

                    {/* Right: Individual Download */}
                    <div>
                      <button
                        onClick={() => downloadSingleImage(item)}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
                        title="Download this image"
                      >
                        <Download size={15} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Note if exists */}
                  {item.targetNote && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: item.targetAchieved ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                      background: item.targetAchieved ? 'var(--accent-emerald-subtle)' : 'rgba(255, 255, 255, 0.04)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      border: '1px solid',
                      borderColor: item.targetAchieved ? 'rgba(52, 211, 153, 0.2)' : 'var(--border-subtle)',
                    }}>
                      <Info size={12} />
                      <span>{item.targetNote}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS for hover micro-animations */}
      <style>{`
        .image-queue-card:hover {
          border-color: var(--border-accent) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.45), 0 0 16px rgba(167, 139, 250, 0.2) !important;
        }
        .remove-img-btn:hover {
          background: #ef4444 !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
          transform: scale(1.08);
        }
        .danger-clear-btn:hover {
          background: #ef4444 !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
          box-shadow: 0 0 16px rgba(239, 68, 68, 0.35) !important;
        }
        .breakdown-row:hover {
          border-color: var(--border-accent) !important;
        }
      `}</style>
    </div>
  );
};
