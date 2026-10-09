import React from 'react';
import { MaterialCard } from './MaterialCard';
import styles from './MaterialDrawer.module.css';

export function MaterialDrawer({ mode }: { mode: 'personal' | 'host' }) {
    const materials = [
        {
            id: '1',
            title: 'React 基礎教學',
            tags: ['React', 'Frontend'],
        },
        {
            id: '2',
            title: '日文 N2 單字',
            tags: ['日文'],
        },
        {
            id: '3',
            title: 'Next.js 教學',
            tags: ['Next.js', 'React'],
        },
    ];


    return (

        <div className={styles.materialDrawer} >
            <div className={styles.drawerHeader}>
                <div className={styles.drawerTitleRow}>
                    <span className={styles.drawerTitle} data-i18n="drawerTitle">📗 教材庫 (0)</span>
                    <div>
                        <div className="tooltip-wrapper tooltip-bottom">
                            <button className={`${styles.btnAddMat}`} id="btnAddMaterial" data-i18n="btnAddMaterial">+ 新增教材</button>
                            <div className="custom-tooltip" role="tooltip">
                                新增個人教材/課程
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.drawerSearchBox}>
                    <span className={styles.drawerSearchIcon}>🔍</span>
                    <input type="text" className={styles.drawerSearchInput} data-i18n-ph="phSearchMaterial" placeholder="搜尋影片名稱..." />
                </div>
                {/* Dropdown Multi-Select Tag Filter Container  */}
                <div className={styles.tagDropdownWrap}>
                    <div className='tooltip-wrapper'>
                        <button className={`${styles.tagDropdownBtn} `} type="button">
                            <span >🏷️ 標籤篩選 (全部)</span>
                            <span>▾</span>
                        </button>
                        <div className="custom-tooltip" role="tooltip">
                            勾選標籤進行多選篩選
                        </div>
                    </div>
                    <div className={styles.tagDropdownMenu}></div>
                </div>
            </div>
            <div className={styles.drawerList}>
                {materials.map((material) => (
                    <MaterialCard
                        key={material.id}
                        material={material}
                        mode={mode}
                    />
                ))}
            </div>
            <div className={styles.drawerFooterHint} data-i18n="drawerFooterHint">
                👆 拖曳卡片至日期即可排課
            </div>
        </div>


    );
}