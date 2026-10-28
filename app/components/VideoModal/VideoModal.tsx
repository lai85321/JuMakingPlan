'use client';

import React, { useState, useEffect } from 'react';
import { getYouTubeIds } from '../../lib/scheduleHelper';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  urls: string[];
}

export function VideoModal({ isOpen, onClose, title, urls }: VideoModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 當開啟或切換影片時，預設重設為第 1 部
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, urls]);

  // 若未開啟，直接回傳 null 以卸載 iframe 並停止播放聲音
  if (!isOpen) return null;

  const ids = getYouTubeIds(urls);
  const currentId = ids[activeIndex] || ids[0];
  const currentUrl = urls[activeIndex] || urls[0];

  return (
    <div className="modal-overlay active video-modal-overlay" onClick={onClose}>
      <div className="modal-box video-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-hdr">
          <h3>🎬 影片播放器 — {title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="關閉視窗"
            data-tooltip="關閉視窗"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {ids.length > 0 ? (
            <div className="video-player-container">
              <iframe
                key={currentId}
                src={`https://www.youtube.com/embed/${currentId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                backgroundColor: '#1E1E1E',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CCC',
                gap: '0.8rem',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>🎬</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>尚無可播放的 YouTube 影片網址</p>
            </div>
          )}

          {/* Playlist & External link bar */}
          <div className="video-playlist-bar">
            {ids.length > 1 ? (
              <div className="video-playlist">
                {ids.map((id, i) => (
                  <button
                    key={`${id}_${i}`}
                    type="button"
                    className={`playlist-item ${activeIndex === i ? 'active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    第 {i + 1} 部
                  </button>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #7c7267)' }}>
                {ids.length === 1 ? '單集內容' : ''}
              </span>
            )}

            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-external-link"
              >
                🔗 在 YouTube 開啟
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
