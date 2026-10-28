import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';
import styles from './Kanban.module.css';

interface ColumnProps {
    children: React.ReactNode;
    id: string;
    date: string;
    mode?: 'personal' | 'host';
    onOpenAddClass?: () => void;
}

export function Column({ children, id, date, mode = 'personal', onOpenAddClass }: ColumnProps) {
    const { ref } = useDroppable({
        id,
        type: 'column',
        accept: ['task', 'material'],
        collisionPriority: CollisionPriority.Low,
        disabled: mode === 'host',
    });

    return (
        <div className={styles.kanbanCol} ref={ref}>
            {/* 日期標題 */}
            <div className={styles.colHeader}>
                <div className={styles.colHeaderLeft}>
                    <div className={styles.colDateTitle}>
                        <span className={styles.dateText}>{date}</span>
                    </div>
                </div>
                <div className={styles.colCountBadge}>{React.Children.count(children)}</div>
            </div>
            <div className={styles.colBody}>{children}</div>
            {mode === 'personal' && (
                <div className={styles.colFooter}>
                    <div className="tooltip-wrapper">
                        <button
                            type="button"
                            className={`${styles.btnQuickAdd} tooltip`}
                            onClick={onOpenAddClass}
                        >
                            + 排入課程
                        </button>
                        <div className="custom-tooltip" role="tooltip">
                            新增當日排程
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
