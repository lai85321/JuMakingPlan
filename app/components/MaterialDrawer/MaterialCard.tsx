import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/react';
import styles from './MaterialDrawer.module.css';


interface Material {
    id: string;
    title: string;
    tags?: string[];
    tag?: string;
}

interface MaterialCardProps {
    material: Material;
    mode: 'personal' | 'host';
}


export function MaterialCard({ material, mode }: MaterialCardProps) {
    const displayTagStr =
        material.tags && material.tags.length > 0
            ? material.tags.join(', ')
            : material.tag || '通用';

    const { ref } = useDraggable({
        id: `material-${material.id}`,
        disabled: mode === 'host',
        type: 'material',
        data: { material },
    });
    return (
        <div ref={ref} className={styles.materialCard}>


            <div className={styles.matInfo}>
                <div className={styles.matTitle}> {material.title}</div>
                <div className={styles.matMeta}>{displayTagStr}</div>
            </div>
            {mode === 'host' ? (
                <div className="tooltip-wrapper">
                    <button
                        className={styles.btnCollectStar}
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: collectHostMaterial(material.id)
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
                        className={styles.cardBtnIcon}
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: deleteMaterial(material.id)
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