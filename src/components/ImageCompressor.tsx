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
  const [formatPreference, setFormatPreference] = useState<'smart' | 'keep'>('smart');

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

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#4f46e5', '#10b981', '#38bdf8'],
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
    <div style={{ width: '100%' }}>
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
          gap: '0.6rem',
          padding: '0.85rem 1.1rem',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          fontSize: '0.88rem',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================
          STATE 1: EMPTY UPLOAD STATE
          ======================================================== */}
      {images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem 3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            marginBottom: '0.85rem',
          }}>
            Compress IMAGE
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#4b5563',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.5,
          }}>
            Compress your images online and reduce file size while maintaining good visual quality.
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              background: '#eff6ff',
              border: '2px dashed #93c5fd',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#e0f2fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.background = '#eff6ff';
            }}
          >
            <button
              type="button"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '1.1rem 2.8rem',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                pointerEvents: 'none',
                marginBottom: '1rem',
              }}
            >
              <Upload size={24} />
              <span>Select images</span>
            </button>

            <div style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: '#4b5563',
              marginBottom: '0.5rem',
            }}>
              or drop images here
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
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
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem 0 3rem' }}>
          {/* Top Review Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827' }}>
                Images Selected ({images.length})
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                Total original size: <strong>{formatBytes(totalOriginalSize)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => addMoreInputRef.current?.click()}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
              >
                <Plus size={16} />
                <span>Add more images</span>
              </button>

              <button
                onClick={clearAll}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: '#dc2626' }}
              >
                <Trash2 size={16} />
                <span>Clear all</span>
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {images.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{
                  height: '160px',
                  background: '#f8fafc',
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
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                    }}
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ padding: '0.75rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }} title={item.name}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {item.width} &times; {item.height} px
                    </div>
                  </div>

                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#374151',
                  }}>
                    <span>Original:</span>
                    <span>{formatBytes(item.originalSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Settings & Action Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', marginRight: '0.85rem' }}>
                  Compression Mode:
                </span>
                <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => { setMode('standard'); setTargetError(null); }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: mode === 'standard' ? '#ffffff' : 'transparent',
                      color: mode === 'standard' ? '#2563eb' : '#64748b',
                      boxShadow: mode === 'standard' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sliders size={15} />
                    <span>Standard Quality</span>
                  </button>

                  <button
                    onClick={() => { setMode('target'); setTargetError(null); }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: mode === 'target' ? '#ffffff' : 'transparent',
                      color: mode === 'target' ? '#2563eb' : '#64748b',
                      boxShadow: mode === 'target' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Target size={15} />
                    <span>Target Size (KB)</span>
                  </button>
                </div>
              </div>

              {mode === 'target' && (
                <div style={{ fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 600 }}>
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
                gap: '1.25rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>
                    Quality Profile
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { id: 'recommended', label: 'Recommended', desc: 'Best balance of quality and file size' },
                      { id: 'high', label: 'Extreme', desc: 'Smaller file size, higher compression' },
                      { id: 'light', label: 'Light', desc: 'Minimal compression, maximum quality' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setLevel(opt.id as CompressionLevel)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          background: level === opt.id ? '#2563eb' : '#f3f4f6',
                          color: level === opt.id ? '#ffffff' : '#4b5563',
                          border: '1px solid',
                          borderColor: level === opt.id ? '#2563eb' : '#e5e7eb',
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
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    padding: '0.95rem 2.4rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    minWidth: '240px',
                    justifyContent: 'center',
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
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '0.45rem',
                    }}>
                      Target size (KB)
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1.5px solid',
                        borderColor: targetError ? '#dc2626' : '#2563eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
                            padding: '0.55rem 0.75rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            color: '#111827',
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                        <span style={{
                          padding: '0.55rem 0.85rem',
                          background: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#475569',
                          borderLeft: '1px solid #e2e8f0',
                        }}>
                          KB
                        </span>
                      </div>

                      {/* Quick Target Presets */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[50, 100, 200, 300, 500, 1000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setTargetKBInput(preset.toString());
                              setTargetError(null);
                            }}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: targetKBInput === preset.toString() ? '#eff6ff' : '#f8fafc',
                              color: targetKBInput === preset.toString() ? '#2563eb' : '#4b5563',
                              border: '1px solid',
                              borderColor: targetKBInput === preset.toString() ? '#93c5fd' : '#e5e7eb',
                            }}
                          >
                            {preset < 1000 ? `${preset} KB` : '1 MB'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {targetError && (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                        {targetError}
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45 }}>
                      Riznex iteratively adjusts quality in your browser to get as close as possible to your desired file size.
                    </div>

                    {/* Resize Dimensions Checkbox */}
                    <div style={{ marginTop: '0.85rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.84rem', color: '#374151', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={allowDownscale}
                          onChange={(e) => setAllowDownscale(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span>Auto-resize dimensions if needed to achieve small target</span>
                      </label>
                      <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginLeft: '1.55rem', marginTop: '2px' }}>
                        Recommended for very small targets (e.g. 50-100 KB) on high-resolution photos where quality alone is not enough.
                      </div>
                    </div>
                  </div>

                  {/* Big "Compress to Target Size" Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <button
                      onClick={handleCompressAll}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        padding: '1rem 2.4rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        minWidth: '260px',
                        justifyContent: 'center',
                      }}
                    >
                      <Target size={20} />
                      <span>Compress to Target Size</span>
                    </button>
                    <span style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '0.4rem', marginRight: '4px' }}>
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '4px solid #dbeafe',
            borderTopColor: '#2563eb',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1.5rem',
          }} />

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
            {mode === 'target' ? 'Optimizing to target file size...' : 'Compressing your images...'}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            {mode === 'target' 
              ? `Iterating quality & encoding to reach ~${targetKBInput} KB (Image ${progressCount} of ${images.length})...`
              : `Processing image ${progressCount} of ${images.length} directly in your browser.`}
          </p>

          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(progressCount / images.length) * 100}%`,
              height: '100%',
              background: '#2563eb',
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 4: RESULTS & DOWNLOADS (Complete)
          ======================================================== */}
      {isCompleted && !isProcessing && (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem 0 3.5rem' }}>
          {/* Success Banner */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #a7f3d0',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
            marginBottom: '2rem',
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
              Your images have been compressed!
            </h2>

            {/* Total Savings Metrics */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8fafc',
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              margin: '1rem auto 1.5rem',
              fontSize: '0.95rem',
            }}>
              <span style={{ color: '#6b7280' }}>
                {formatBytes(totalOriginalSize)} &rarr; <strong style={{ color: '#111827' }}>{formatBytes(totalCompressedSize)}</strong>
              </span>
              <span style={{
                color: totalSavingsPercentage > 0 ? '#059669' : '#6b7280',
                fontWeight: 700,
                background: totalSavingsPercentage > 0 ? '#ecfdf5' : '#f3f4f6',
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
              }}>
                {totalSavingsPercentage > 0 ? `-${totalSavingsPercentage}%` : 'Optimal size'}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadAll}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  padding: '0.85rem 2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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
                style={{ fontSize: '0.95rem', padding: '0.85rem 1.5rem' }}
              >
                <RotateCcw size={18} />
                <span>Compress More Images</span>
              </button>
            </div>
          </div>

          {/* Compressed Items List */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
              Compression Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {images.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}>
                    {/* Left: Thumbnail & Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '220px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <img
                          src={item.compressedUrl || item.previewUrl}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '44px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                          {item.compressedWidth || item.width} &times; {item.compressedHeight || item.height} px
                        </div>
                      </div>
                    </div>

                    {/* Middle: Before & After Size & Target Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                        <span>Original: <strong>{formatBytes(item.originalSize)}</strong></span>
                        <span style={{ margin: '0 0.5rem' }}>&rarr;</span>
                        <span style={{ color: '#111827' }}>Final: <strong>{formatBytes(item.compressedSize || item.originalSize)}</strong></span>
                      </div>

                      {/* Target Achievement Status */}
                      {item.targetKB && (
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: item.targetAchieved ? '#ecfdf5' : '#fffbeb',
                          color: item.targetAchieved ? '#059669' : '#b45309',
                          border: '1px solid',
                          borderColor: item.targetAchieved ? '#a7f3d0' : '#fde68a',
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
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        background: (item.savingsPercentage ?? 0) > 0 ? '#ecfdf5' : '#f3f4f6',
                        color: (item.savingsPercentage ?? 0) > 0 ? '#059669' : '#6b7280',
                      }}>
                        {(item.savingsPercentage ?? 0) > 0 ? `-${item.savingsPercentage}%` : 'Optimal'}
                      </span>
                    </div>

                    {/* Right: Individual Download */}
                    <div>
                      <button
                        onClick={() => downloadSingleImage(item)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
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
                      fontSize: '0.74rem',
                      color: item.targetAchieved ? '#059669' : '#4b5563',
                      background: item.targetAchieved ? '#f0fdf4' : '#f8fafc',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
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
    </div>
  );
};
