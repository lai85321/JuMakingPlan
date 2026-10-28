'use client';

import React, { useState, useEffect } from 'react';
import { RepeatType } from '../../lib/scheduleHelper';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { startTime: string; repeat: RepeatType; monthlyDay?: number }) => void;
  onDelete: () => void;
  initialData: {
    title?: string;
    startTime?: string;
    repeat?: RepeatType;
    monthlyDay?: number;
  } | null;
}

export function EditScheduleModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}: EditScheduleModalProps) {
  const [startTime, setStartTime] = useState<string>('');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [monthlyDay, setMonthlyDay] = useState<number>(15);

  useEffect(() => {
    if (isOpen && initialData) {
      setStartTime(initialData.startTime || '');
      setRepeat(initialData.repeat || 'none');
      setMonthlyDay(initialData.monthlyDay || 15);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      startTime,
      repeat,
      monthlyDay: repeat === 'monthly' ? Number(monthlyDay) || 15 : undefined,
    });
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-hdr">
          <h3>編輯排程時間與週期規則</h3>
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {initialData?.title && (
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--text-dark, #2b2523)',
                  marginBottom: '0.4rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  borderRadius: '6px',
                }}
              >
                課程：{initialData.title}
              </div>
            )}

            <div className="form-group">
              <label>播放時間（可留空代表無固定時間）</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>重複週期規則</label>
              <select
                className="form-control"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
              >
                <option value="none">不重複（僅限當天）</option>
                <option value="daily">每天重複</option>
                <option value="every2days">每 2 天重複</option>
                <option value="every3days">每 3 天重複</option>
                <option value="weekly">每週重複</option>
                <option value="every2weeks">每 2 週重複</option>
                <option value="monthly">每月固定幾號重複</option>
              </select>
            </div>

            {repeat === 'monthly' && (
              <div className="form-group">
                <label>每月幾號重複 (1 ~ 31)</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={31}
                  value={monthlyDay}
                  onChange={(e) => setMonthlyDay(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="modal-ftr"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <button
              type="button"
              onClick={onDelete}
              style={{
                color: '#D32F2F',
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
              }}
              data-tooltip="刪除此排程"
            >
              刪除此排程
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={onClose}>
                取消
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}
              >
                確認保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
