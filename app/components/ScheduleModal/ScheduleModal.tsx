'use client';

import React, { useState, useEffect } from 'react';
import { MaterialData } from '../MaterialModal/MaterialModal';
import { RepeatType } from '../../lib/scheduleHelper';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    materialId?: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    repeat: RepeatType;
    monthlyDay?: number;
  }) => void;
  materials: MaterialData[];
  defaultDate?: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  materials,
  defaultDate,
}: ScheduleModalProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [monthlyDay, setMonthlyDay] = useState<number>(15);

  useEffect(() => {
    if (isOpen) {
      if (materials.length > 0) {
        setSelectedMaterialId(materials[0].id || '__custom__');
      } else {
        setSelectedMaterialId('__custom__');
      }
      setCustomTitle('');
      const initialDate =
        defaultDate ||
        (() => {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        })();
      setDate(initialDate);
      setStartTime('');
      setEndTime('');
      setRepeat('none');
      try {
        const dNum = initialDate ? new Date(initialDate).getDate() : 15;
        setMonthlyDay(dNum || 15);
      } catch {
        setMonthlyDay(15);
      }
    }
  }, [isOpen, defaultDate, materials]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('請選擇日期！');
      return;
    }

    let finalTitle = '';
    let finalMaterialId: string | undefined = undefined;

    if (selectedMaterialId === '__custom__') {
      if (!customTitle.trim()) {
        alert('請輸入自訂課程名稱！');
        return;
      }
      finalTitle = customTitle.trim();
    } else {
      const selectedMat = materials.find((m) => m.id === selectedMaterialId);
      finalTitle = selectedMat ? selectedMat.title : customTitle || '新排程';
      finalMaterialId = selectedMaterialId;
    }

    onSave({
      materialId: finalMaterialId,
      title: finalTitle,
      date,
      startTime,
      endTime,
      repeat,
      monthlyDay: repeat === 'monthly' ? Number(monthlyDay) || 15 : undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-hdr">
          <h3 data-i18n="modalScheduleTitle">排定課程</h3>
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
            <div className="form-group">
              <label data-i18n="lblSelectMaterial">選擇教材 *</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="form-control"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
                <option value="__custom__">➕ 自訂其他課程名稱...</option>
              </select>
            </div>

            {selectedMaterialId === '__custom__' && (
              <div className="form-group">
                <label>自訂課程名稱 *</label>
                <input
                  type="text"
                  className="form-control"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="例如：陳月卿起床操"
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label data-i18n="lblDate">日期 *</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label data-i18n="lblStartTime">開始時間</label>
                <input
                  type="time"
                  className="form-control"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label data-i18n="lblEndTime">結束時間</label>
                <input
                  type="time"
                  className="form-control"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label data-i18n="lblRepeat">重複週期規則</label>
              <select
                className="form-control"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
              >
                <option value="none" data-i18n="repeatNone">不重複（僅限當天）</option>
                <option value="daily" data-i18n="repeatDaily">每天重複</option>
                <option value="every2days" data-i18n="repeatEvery2Days">每 2 天重複</option>
                <option value="every3days" data-i18n="repeatEvery3Days">每 3 天重複</option>
                <option value="weekly" data-i18n="repeatWeekly">每週重複</option>
                <option value="every2weeks">每 2 週重複</option>
                <option value="monthly" data-i18n="repeatMonthly">每月固定幾號重複</option>
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
          <div className="modal-ftr">
            <button type="button" onClick={onClose} data-i18n="btnCancel">
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}
              data-i18n="btnSave"
            >
              確認排入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
