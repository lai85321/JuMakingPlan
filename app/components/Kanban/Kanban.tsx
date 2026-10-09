import React from 'react';
import { Column } from './KanbanColumn';
import { Item } from './KanbanCard';
import styles from './Kanban.module.css';

export interface TaskItem {
    id: string;
    title: string;
    time?: string;
}

export type KanbanItems = Record<string, TaskItem[]>;

interface WeeklyCalendarProps {
    weekStartDate: Date;
    items: KanbanItems;
    mode: 'personal' | 'host';
}

export function Kanban({ weekStartDate, items, mode }: WeeklyCalendarProps) {
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
                    const key = date.toISOString().split('T')[0];
                    const title = `${date.getMonth() + 1}/${date.getDate()} ${dayNames[date.getDay()]}`;
                    const columnTasks = items[key] || [];

                    return (
                        <Column
                            key={key}
                            id={key}
                            date={title}
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
                                />
                            ))}
                        </Column>
                    );
                })}
            </div>
        </div>
    );
}