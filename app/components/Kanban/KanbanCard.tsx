"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import styles from './Kanban.module.css';

interface ItemProps {
    id: string;
    column: string;
    index: number;
    title?: string;
    time?: string;
    mode: 'personal' | 'host';
    completed?: boolean;
    onDeleteCard: (id: string) => void;
    onToggleComplete?: (id: string) => void;
    onEditCard?: (id: string) => void;
    onPlayVideo?: () => void;
}

export function Item({
    id,
    column,
    index,
    title,
    time = '',
    mode,
    completed = false,
    onDeleteCard,
    onToggleComplete,
    onEditCard,
    onPlayVideo,
}: ItemProps) {
    const { ref } = useSortable({
        id,
        index,
        group: column,
        type: 'task',
        accept: ['task'],
        disabled: mode === 'host',
    });

    return (
        <div className={`${styles.kanbanCard} ${completed ? styles.completed : ''}`} ref={ref}>
            <div className={styles.cardTop}>
                <div className="flex items-center gap-1">
                    {time && time !== 'none' ? <span className={styles.cardTimeTag}> {time} </span> : null}
                </div>
                {mode === 'personal' && (
                    <div className={styles.cardActions}>
                        <div className="tooltip-wrapper">
                            <button
                                type="button"
                                className={`${styles.cardBtnIcon} tooltip`}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCard?.(id);
                                }}
                            >
                                ✏️
                            </button>
                            <div className="custom-tooltip" role="tooltip">
                                編輯時間與週期
                            </div>
                        </div>
                        <div className="tooltip-wrapper">
                            <button
                                type="button"
                                className={styles.cardBtnIcon}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (id) {
                                        onDeleteCard(id);
                                    }
                                }}
                            >
                                ✕
                            </button>
                            <div className="custom-tooltip" role="tooltip">
                                刪除排程
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div
                className={styles.cardTitle}
                title={`點擊播放影片：${title || id}`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onPlayVideo?.();
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    onPlayVideo?.();
                }}
            >
                {title || id}
            </div>

            <div className={styles.cardBottom}>
                <div className="toolTip-wrapper">
                    <button
                        type="button"
                        disabled={mode === 'host'}
                        className={`${styles.chkCompleteBtn} ${completed ? styles.active : ''} tooltip`}
                        style={mode === 'host' ? { cursor: 'not-allowed', opacity: 0.55 } : undefined}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (mode === 'host') return;
                            if (id) {
                                onToggleComplete?.(id);
                            }
                        }}
                    >
                        {completed ? '✓' : ''}
                    </button>
                    <div className="custom-tooltip" role="tooltip">
                        {mode === 'host' ? '樓主計畫僅供閱覽' : '標記完成狀態'}
                    </div>
                </div>
            </div>
        </div>
    );
}
