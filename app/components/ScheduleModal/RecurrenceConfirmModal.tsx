'use client';

import React from 'react';

interface RecurrenceConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  opt1Text: string;
  opt2Text: string;
  onOpt1: () => void;
  onOpt2: () => void;
}

export function RecurrenceConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  opt1Text,
  opt2Text,
  onOpt1,
  onOpt2,
}: RecurrenceConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-hdr">
          <h3>{title}</h3>
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
        <div className="modal-body" style={{ textAlign: 'center', padding: '1.2rem 1rem' }}>
          <p
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-dark, #2b2523)',
              lineHeight: 1.5,
              marginBottom: '1.2rem',
            }}
          >
            {message}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpt1();
              }}
              style={{
                backgroundColor: '#FFF8E1',
                color: '#B78103',
                border: '1px solid #FFE082',
                fontWeight: 800,
                padding: '0.65rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {opt1Text}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpt2();
              }}
              style={{
                backgroundColor: 'var(--primary-color, #4A3B32)',
                color: '#FFF',
                border: 'none',
                fontWeight: 800,
                padding: '0.65rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {opt2Text}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem',
                color: 'var(--text-muted, #7c7267)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              【取消】
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
