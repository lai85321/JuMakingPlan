import React from 'react';
import { Column } from './KanbanColumn';
import { Item } from './KanbanCard';
import styles from './Kanban.module.css';

export interface TaskItem {
    id: string;
    scheduleId?: string;
    dateIso?: string;
    title: string;
    time?: string;
    endTime?: string;
    materialId?: string;
    repeat?: string;
    monthlyDay?: number;
    completed?: boolean;
}

export type KanbanItems = Record<string, TaskItem[]>;

interface WeeklyCalendarProps {
    weekStartDate: Date;
    items: KanbanItems;
    mode: 'personal' | 'host';
    onDeleteCard: (id: string, dateIso?: string) => void;
    onToggleComplete?: (id: string, dateIso?: string) => void;
    onEditCard?: (id: string, dateIso?: string) => void;
    onOpenAddClass?: (dateIso: string) => void;
    onPlayVideo?: (task: TaskItem) => void;
}

export function Kanban({
    weekStartDate,
    items,
    mode,
    onDeleteCard,
    onToggleComplete,
    onEditCard,
    onOpenAddClass,
    onPlayVideo,
}: WeeklyCalendarProps) {
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        weekDates.push(d);
    }

    const dayNames = [
        '週日',
        '週一',
        '週二',
        '週三',
        '週四',
        '週五',
        '週六',
    ];

    return (
        <div className={styles.kanbanScrollWrapper}>
            <div className={styles.kanbanBoard}>
                {weekDates.map((date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const key = `${y}-${m}-${day}`;
                    const title = `${date.getMonth() + 1}/${date.getDate()} ${dayNames[date.getDay()]}`;
                    const columnTasks = items[key] || [];

                    return (
                        <Column
                            key={key}
                            id={key}
                            date={title}
                            mode={mode}
                            onOpenAddClass={() => onOpenAddClass?.(key)}
                        >
                            {columnTasks.map((task, index) => (
                                <Item
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    time={task.time}
                                    column={key}
                                    index={index}
                                    mode={mode}
                                    completed={task.completed}
                                    onDeleteCard={(id) => onDeleteCard(id, key)}
                                    onToggleComplete={(id) => onToggleComplete?.(id, key)}
                                    onEditCard={(id) => onEditCard?.(id, key)}
                                    onPlayVideo={() => onPlayVideo?.(task)}
                                />
                            ))}
                        </Column>
                    );
                })}
            </div>
        </div>
    );
}
