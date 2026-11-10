'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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

// 輔助函式：標準化取得教材所有分類標籤（自動處理陣列或字串、去除空格與逗點分隔）
function getMaterialTags(material: MaterialData): string[] {
    if (Array.isArray(material.tags)) {
        return material.tags.flatMap((t) =>
            typeof t === 'string' ? t.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean) : []
        );
    }
    if (typeof (material as any).tag === 'string') {
        return (material as any).tag.split(/[,，\s]+/).map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [activeTagFilterSet, setActiveTagFilterSet] = useState<Set<string>>(() => new Set(['ALL']));
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. 動態取得去重複後的標籤列表 (Deduplicated Tags)
    const tags = useMemo(() => {
        const set = new Set<string>();
        materials.forEach((m) => {
            getMaterialTags(m).forEach((t) => set.add(t));
        });
        return Array.from(set);
    }, [materials]);

    // 2. 當教材切換（例如切換至樓主模式或新增教材），自動清理不在清單中的標籤
    useEffect(() => {
        setActiveTagFilterSet((prev) => {
            if (prev.has('ALL')) return prev;
            const validTags = new Set(tags);
            const next = new Set<string>();
            prev.forEach((t) => {
                if (validTags.has(t)) next.add(t);
            });
            if (next.size === 0) {
                next.add('ALL');
            }
            return next;
        });
    }, [tags]);

    // 3. 點擊外部自動收合標籤下拉選單
    useEffect(() => {
        if (!isTagDropdownOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTagDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTagDropdownOpen]);

    // 4. 全部標籤切換處理
    const isAllChecked = activeTagFilterSet.has('ALL');

    function handleAllChange(checked: boolean) {
        if (checked) {
            setActiveTagFilterSet(new Set(['ALL']));
        } else {
            setActiveTagFilterSet(new Set(['ALL']));
        }
    }

    // 5. 個別標籤切換處理
    function handleTagChange(tag: string, checked: boolean) {
        setActiveTagFilterSet((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.delete('ALL');
                next.add(tag);
            } else {
                next.delete(tag);
                if (next.size === 0) {
                    next.add('ALL');
                }
            }
            return next;
        });
    }

    // 6. 下拉選單按鈕顯示文字
    const tagFilterLabel = useMemo(() => {
        if (activeTagFilterSet.has('ALL') || activeTagFilterSet.size === 0) {
            return '🏷️ 標籤篩選 (全部)';
        }
        return `🏷️ 標籤篩選 (已選 ${activeTagFilterSet.size} 項)`;
    }, [activeTagFilterSet]);

    // 7. 實現篩選：結合標籤篩選與關鍵字搜尋
    const filteredMaterials = useMemo(() => {
        return materials.filter((material) => {
            // 標籤比對
            const isAll = activeTagFilterSet.has('ALL') || activeTagFilterSet.size === 0;
            let matchesTag = isAll;
            if (!matchesTag) {
                const mTags = getMaterialTags(material);
                matchesTag = mTags.some((t) => activeTagFilterSet.has(t));
            }

            // 搜尋比對
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query || material.title.toLowerCase().includes(query);

            return matchesTag && matchesSearch;
        });
    }, [materials, activeTagFilterSet, searchQuery]);

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
                                    type="button"
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

                    {/* Dropdown Multi-Select Tag Filter Container */}
                    <div className={styles.tagDropdownWrap} ref={dropdownRef}>
                        <div className="tooltip-wrapper">
                            <button
                                type="button"
                                className={styles.tagDropdownBtn}
                                onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                            >
                                <span>{tagFilterLabel}</span>
                                <span>▾</span>
                            </button>
                            <div className="custom-tooltip" role="tooltip">
                                勾選標籤進行多選篩選
                            </div>
                        </div>
                        {isTagDropdownOpen && (
                            <div className={styles.tagDropdownMenu}>
                                <label className={styles.tagDropdownItem}>
                                    <input
                                        type="checkbox"
                                        checked={isAllChecked}
                                        onChange={(e) => handleAllChange(e.currentTarget.checked)}
                                    />
                                    <span>全部標籤</span>
                                </label>
                                {tags.map((tag) => (
                                    <label className={styles.tagDropdownItem} key={tag}>
                                        <input
                                            type="checkbox"
                                            checked={activeTagFilterSet.has(tag)}
                                            onChange={(e) => handleTagChange(tag, e.currentTarget.checked)}
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.drawerList}>
                    {materials.length === 0 && mode === 'personal' ? (
                        <div className={styles.emptyDrawerNotice}>
                            <p>目前尚無個人教材喔！😊</p>
                            <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>
                                點擊上方「+ 新增教材」，或至「✨ 樓主養成計畫」點擊 ⭐ 收藏教材！
                            </p>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className={styles.emptyDrawerNotice}>
                            <p>沒有符合篩選條件的教材</p>
                        </div>
                    ) : (
                        filteredMaterials.map((material) => (
                            <MaterialCard
                                key={material.id}
                                material={material}
                                mode={mode}
                                onDeleteMaterial={onDeleteMaterial}
                                onPlayMaterial={onPlayMaterial}
                                onCollectMaterial={onCollectMaterial}
                            />
                        ))
                    )}
                </div>
                <div className={styles.drawerFooterHint} data-i18n="drawerFooterHint">
                    👆 拖曳卡片至日期即可排課
                </div>
            </div>
        </>
    );
}
