import React from 'react';
import { useDraggable } from '@dnd-kit/react';
import styles from './MaterialDrawer.module.css';
import { MaterialData } from '../MaterialModal/MaterialModal';

interface MaterialCardProps {
    material: MaterialData;
    mode: 'personal' | 'host';
    onDeleteMaterial: (id: string) => void;
    onPlayMaterial?: (material: MaterialData) => void;
    onCollectMaterial?: (material: MaterialData) => void;
}

export function MaterialCard({
    material,
    mode,
    onDeleteMaterial,
    onPlayMaterial,
    onCollectMaterial,
}: MaterialCardProps) {
    const displayTagStr =
        material.tags && material.tags.length > 0
            ? material.tags.join(', ')
            : '通用';

    const { ref } = useDraggable({
        id: `material-${material.id}`,
        disabled: mode === 'host',
        type: 'material',
        data: { material },
    });

    return (
        <div
            ref={ref}
            className={styles.materialCard}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onPlayMaterial?.(material);
            }}
        >
            <div
                className={styles.matInfo}
                style={{ cursor: 'pointer' }}
                title="點擊預覽影片"
                onClick={(e) => {
                    e.stopPropagation();
                    onPlayMaterial?.(material);
                }}
            >
                <div className={styles.matTitle}>{material.title}</div>
                <div className={styles.matMeta}>{displayTagStr}</div>
            </div>
            {mode === 'host' ? (
                <div className="tooltip-wrapper">
                    <button
                        type="button"
                        className={styles.btnCollectStar}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCollectMaterial?.(material);
                        }}
                    >
                        ⭐ 收藏
                    </button>
                    <div className="custom-tooltip" role="tooltip">
                        收藏至個人教材庫
                    </div>
                </div>
            ) : (
                <div className="tooltip-wrapper">
                    <button
                        type="button"
                        className={styles.cardBtnIcon}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (material.id) {
                                onDeleteMaterial(material.id);
                            }
                        }}
                    >
                        ✕
                    </button>
                    <div className="custom-tooltip" role="tooltip">
                        刪除教材
                    </div>
                </div>
            )}
        </div>
    );
}
