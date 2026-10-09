"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useState } from 'react';
import styles from './Kanban.module.css';
interface ItemProps {
    id: string;
    column: string;
    index: number;
    title?: string;
    time?: string;
    mode: 'personal' | 'host';
}

export function Item({ id, column, index, title, time = '07:00', mode }: ItemProps) {
    const { ref } = useSortable({
        id,
        index,
        group: column,
        type: 'task',
        accept: ['task'],
        disabled: mode === 'host',
    });

    let [isCompleted, setIsCompleted] = useState(false);
    return (

        <div className={`${styles.kanbanCard} ${isCompleted ? styles.completed : ''}`} ref={ref}>
            <div className={styles.cardTop}>
                <div className="flex items-center gap-1">
                    <span className={styles.cardTimeTag}> {time} </span>
                </div>
                <div className={styles.cardActions}>
                    <div className="tooltip-wrapper">
                        <button className={`${styles.cardBtnIcon} tooltip`} >✏️</button>
                        <div className="custom-tooltip" role="tooltip">
                            編輯時間與週期
                        </div>
                    </div>
                    <div className="tooltip-wrapper">
                        <button className={`${styles.cardBtnIcon} tooltip`} >✕</button>
                        <div className="custom-tooltip" role="tooltip">
                            刪除排程
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.cardTitle}>{title || id}</div>

            <div className={styles.cardBottom}>
                <div className="toolTip-wrapper">
                    <button className={`${styles.chkCompleteBtn} ${isCompleted ? styles.active : ''} tooltip`} onClick={() => setIsCompleted(!isCompleted)}>
                        {isCompleted ? '✓' : ''}
                    </button>
                    <div className="custom-tooltip" role="tooltip">
                        標記完成狀態
                    </div>
                </div>
            </div>
        </div>
    );
}
