import React from 'react';
import { useState } from "react";
import { MaterialCard } from './MaterialCard';
import styles from './MaterialDrawer.module.css';
import { MaterialData } from '../MaterialModal/MaterialModal';

interface MaterialDrawerProps {
    mode: 'personal' | 'host';
    materials: MaterialData[];
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onOpenAddMaterial: () => void;
    onDeleteMaterial: (id: string) => void;
    onPlayMaterial?: (material: MaterialData) => void;
    onCollectMaterial?: (material: MaterialData) => void;
}

export function MaterialDrawer({
    mode,
    materials,
    isCollapsed = false,
    onToggleCollapse,
    onOpenAddMaterial,
    onDeleteMaterial,
    onPlayMaterial,
    onCollectMaterial,
}: MaterialDrawerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const tags = materials.flatMap((material) => material.tags);
    const [isTagDropdownOpen, setIsTagDropdownOpen] =
        useState(false);
    const [activeTagFilterSet, setActiveTagFilterSet] =
        useState<Set<string>>(() => new Set(["ALL"]));
    const isAllChecked =
        activeTagFilterSet.has("ALL") ||
        activeTagFilterSet.size === 0;
    const filteredMaterials = materials.filter((material) =>
        material.title
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
    );
    function handleAllChange(checked: boolean) {
        setActiveTagFilterSet(
            checked ? new Set(["ALL"]) : new Set()
        );
    }
    function handleTagChange(tag: string, checked: boolean) {
        setActiveTagFilterSet((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.delete("ALL");
                next.add(tag);
            } else {
                next.delete(tag);

                if (next.size === 0) {
                    next.add("ALL");
                }
            }

            return next;
        });
    }
    return (
        <>
            {isCollapsed && (
                <button
                    type="button"
                    className={styles.drawerFloatingTab}
                    style={{ display: 'inline-flex' }}
                    onClick={onToggleCollapse}
                >
                    ◀ 📗 教材庫
                </button>
            )}
            <div className={`${styles.materialDrawer} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.drawerHeader}>
                    <div className={styles.drawerTitleRow}>
                        <span className={styles.drawerTitle} data-i18n="drawerTitle">
                            📗 教材庫 ({materials.length})
                        </span>
                        <div>
                            <div className="tooltip-wrapper tooltip-bottom">
                                <button
                                    className={styles.btnAddMat}
                                    onClick={onOpenAddMaterial}
                                >
                                    + 新增教材
                                </button>
                                <div className="custom-tooltip" role="tooltip">
                                    新增個人教材/課程
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.drawerSearchBox}>
                        <span className={styles.drawerSearchIcon}>🔍</span>
                        <input
                            id="searchMaterialInput"
                            type="text"
                            className={styles.drawerSearchInput}
                            placeholder="搜尋影片名稱..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        />
                    </div>
                    {/* Dropdown Multi-Select Tag Filter Container  */}
                    <div className={styles.tagDropdownWrap}>
                        <div className="tooltip-wrapper">
                            <button type="button"
                                className={`${styles.tagDropdownBtn} `}
                                onClick={() => setIsTagDropdownOpen((prev) => !prev)}>
                                <span>🏷️ 標籤篩選 (全部)</span>
                                <span>▾</span>
                            </button>
                            <div className="custom-tooltip" role="tooltip">
                                勾選標籤進行多選篩選
                            </div>
                        </div>
                        {isTagDropdownOpen && <div className={styles.tagDropdownMenu}>
                            <label className={styles.tagDropdownItem}>
                                <input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={(e) =>
                                        handleAllChange(e.currentTarget.checked)
                                    }
                                />

                                <span>全部標籤</span>
                            </label>
                            {tags.map((tag) => (
                                <label className={styles.tagDropdownItem} key={tag}>
                                    <input
                                        type="checkbox"
                                        checked={activeTagFilterSet.has(tag)}
                                        onChange={(e) =>
                                            handleTagChange(tag, e.currentTarget.checked)
                                        }
                                    />
                                    <span>{tag}</span>
                                </label>
                            ))}
                        </div>
                        }</div>
                </div>
                <div className={styles.drawerList}>
                    {filteredMaterials.map((material) => (
                        <MaterialCard
                            key={material.id}
                            material={material}
                            mode={mode}
                            onDeleteMaterial={onDeleteMaterial}
                            onPlayMaterial={onPlayMaterial}
                            onCollectMaterial={onCollectMaterial}
                        />
                    ))}
                </div>
                <div className={styles.drawerFooterHint} data-i18n="drawerFooterHint">
                    👆 拖曳卡片至日期即可排課
                </div>
            </div >
        </>
    );
}
