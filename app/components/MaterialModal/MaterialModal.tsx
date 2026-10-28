'use client';

import React, { useState, useEffect } from 'react';

export interface MaterialData {
    id?: string;
    title: string;
    tags: string[];
    urls: string[];
}

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MaterialData) => void;
    initialData?: MaterialData | null; // 若為 null / undefined 則為「新增」，有值則為「編輯」
}

export function MaterialModal({ isOpen, onClose, onSave, initialData }: MaterialModalProps) {
    const [title, setTitle] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [urlList, setUrlList] = useState<string[]>(['']);

    // 當開啟 Modal 或切換 initialData 時初始化表單
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setTagInput(initialData.tags?.join(', ') || '');
                setUrlList(initialData.urls && initialData.urls.length > 0 ? initialData.urls : ['']);
            } else {
                // 新增模式重設為預設值
                setTitle('');
                setTagInput('');
                setUrlList(['']);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // 網址欄位操作：動態增、刪、改
    const handleUrlChange = (idx: number, val: string) => {
        setUrlList((prev) => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
    };

    const addUrlField = () => {
        setUrlList((prev) => [...prev, '']);
    };

    const removeUrlField = (idx: number) => {
        setUrlList((prev) => prev.filter((_, i) => i !== idx));
    };

    // 儲存送出
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('請填寫課程名稱！');
            return;
        }

        const parsedTags = tagInput.trim()
            ? tagInput
                .split(/[,，\s]+/)
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
            : ['通用'];

        const filteredUrls = urlList.map((u) => u.trim()).filter((u) => u.length > 0);

        onSave({
            id: initialData?.id,
            title: title.trim(),
            tags: parsedTags,
            urls: filteredUrls,
        });

        onClose();
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                {/* Modal 標題區 */}
                <div className="modal-hdr">
                    <h3>{initialData ? '編輯教材 / 課程' : '新增教材 / 課程'}</h3>
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

                {/* 表單內容 */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>課程 / 影片標題 *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="例如：陳月卿起床操"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>影片 / 資源網址（支援多集網址 +）</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {urlList.map((url, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={url}
                                            onChange={(e) => handleUrlChange(idx, e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            style={{ flex: 1 }}
                                        />
                                        {idx === urlList.length - 1 && (
                                            <button
                                                type="button"
                                                className="btn-url-add"
                                                onClick={addUrlField}
                                                title="新增多集網址"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                ➕
                                            </button>
                                        )}
                                        {urlList.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-url-del"
                                                onClick={() => removeUrlField(idx)}
                                                title="刪除此網址"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>自訂分類標籤（以逗號或空格分隔多個標籤）</label>
                            <input
                                type="text"
                                className="form-control"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="例如：晨起操, 伸展, 有氧"
                            />
                        </div>
                    </div>

                    {/* 按鈕區 */}
                    <div className="modal-ftr">
                        <button type="button" onClick={onClose}>
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}
                        >
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
