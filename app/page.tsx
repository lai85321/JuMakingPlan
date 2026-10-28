"use client";

import { useState, useEffect, useMemo } from "react";
import { Kanban, type KanbanItems, type TaskItem } from "./components/Kanban/Kanban";
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import getMonday from "./lib/getMonday";
import { MaterialDrawer } from "./components/MaterialDrawer/MaterialDrawer";
import { MaterialModal, type MaterialData } from './components/MaterialModal/MaterialModal';
import {
  ScheduleModal,
  EditScheduleModal,
  RecurrenceConfirmModal,
} from './components/ScheduleModal';
import { VideoModal } from './components/VideoModal';
import {
  type ScheduleItem,
  type RepeatType,
  formatDateISO,
  isScheduleActiveOnDate,
  getHostSchedulesForDate,
  HOST_MATERIALS,
  safeGetStorage,
  safeSetStorage,
} from './lib/scheduleHelper';

export default function Home() {
  const [mode, setMode] = useState<'personal' | 'host'>('personal');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekStart]);

  // 教材庫列表
  const [materials, setMaterials] = useState<MaterialData[]>(() => {
    const fallback: MaterialData[] = [
      { id: '1', title: 'React 基礎教學', tags: ['React', 'Frontend'], urls: [] },
      { id: '2', title: '日文 N2 單字', tags: ['日文'], urls: [] },
      { id: '3', title: '陳月卿起床操', tags: ['晨起操'], urls: ['https://www.youtube.com/watch?v=89LSAiFcxUA'] },
    ];
    return safeGetStorage('user_materials', fallback);
  });

  useEffect(() => {
    safeSetStorage('user_materials', materials);
  }, [materials]);

  // 排程資料
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const today = formatDateISO(new Date());
    const fallback: ScheduleItem[] = [
      {
        id: 's_default_1',
        materialId: '1',
        title: 'React 基礎教學',
        date: today,
        startTime: '07:00',
        endTime: '07:30',
        repeat: 'none',
      },
      {
        id: 's_default_2',
        materialId: '2',
        title: '日文 N2 單字',
        date: today,
        startTime: '08:00',
        endTime: '08:30',
        repeat: 'daily',
      },
    ];
    return safeGetStorage('user_schedules', fallback);
  });

  useEffect(() => {
    safeSetStorage('user_schedules', schedules);
  }, [schedules]);

  // 完成紀錄 (key: `${schedId}_${dateIso}`)
  const [completions, setCompletions] = useState<Record<string, boolean>>(() => {
    return safeGetStorage('user_completions', {});
  });

  useEffect(() => {
    safeSetStorage('user_completions', completions);
  }, [completions]);

  // 看板任務列表 (依據 schedules 與日期動態計算)
  const [items, setItems] = useState<KanbanItems>({});

  // 抽屜與彈窗狀態
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialData | null>(null);

  // 新增排程 Modal 狀態
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState<string>('');

  // 編輯排程時間與週期 Modal 狀態
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editingTargetDate, setEditingTargetDate] = useState<string>('');

  // 週期排程變更確認 Dialog 狀態
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [recurrenceModalConfig, setRecurrenceModalConfig] = useState<{
    title: string;
    message: string;
    opt1Text: string;
    opt2Text: string;
    onOpt1: () => void;
    onOpt2: () => void;
  }>({
    title: '',
    message: '',
    opt1Text: '',
    opt2Text: '',
    onOpt1: () => {},
    onOpt2: () => {},
  });

  // 影片播放器 Modal 狀態
  const [videoModalData, setVideoModalData] = useState<{
    isOpen: boolean;
    title: string;
    urls: string[];
  }>({
    isOpen: false,
    title: '',
    urls: [],
  });

  // 同步計算每週各欄位的任務
  useEffect(() => {
    const newItems: KanbanItems = {};
    for (const d of weekDates) {
      const iso = formatDateISO(d);
      if (mode === 'host') {
        const hostScheds = getHostSchedulesForDate(iso);
        newItems[iso] = hostScheds.map((hs) => ({
          id: `${hs.id}`,
          scheduleId: hs.id,
          dateIso: iso,
          title: hs.title,
          time: hs.startTime,
          completed: false, // 樓主模式僅供閱覽
        }));
      } else {
        const active = schedules.filter((s) => isScheduleActiveOnDate(s, iso));
        active.sort((a, b) => {
          if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
          if (a.startTime && !b.startTime) return -1;
          if (!a.startTime && b.startTime) return 1;
          return 0;
        });
        newItems[iso] = active.map((s) => ({
          id: `${s.id}__${iso}`,
          scheduleId: s.id,
          dateIso: iso,
          title: s.title,
          time: s.startTime || '',
          repeat: s.repeat,
          monthlyDay: s.monthlyDay,
          completed: !!completions[`${s.id}_${iso}`],
        }));
      }
    }
    setItems(newItems);
  }, [schedules, weekDates, mode, completions]);

  const toggleDrawer = () => {
    setIsDrawerCollapsed((prev) => !prev);
  };

  // 拖曳過境時微調順序
  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation;
    if (source?.type === 'task') {
      setItems((prev) => move(prev, event));
    }
  };

  // 拖曳結束：調整排程（教材拖入或跨日移動）
  const handleDragEnd = (event: DragEndEvent) => {
    if (mode === 'host') return; // 樓主模式僅供閱覽，不可拖曳調整排程
    const { source, target, canceled } = event.operation;
    if (canceled || !source || !target) return;

    if (source.type === 'material') {
      let targetColumnId: string | null = null;
      if (target.type === 'column') {
        targetColumnId = String(target.id);
      } else if (target.type === 'task') {
        for (const [colId, list] of Object.entries(items)) {
          if (list.some((item) => item.id === target.id)) {
            targetColumnId = colId;
            break;
          }
        }
      }

      if (targetColumnId) {
        const materialData = (source.data as any)?.material as MaterialData | undefined;
        const newSchedule: ScheduleItem = {
          id: `s_${Date.now()}`,
          materialId: materialData?.id,
          title: materialData?.title || '新任務',
          date: targetColumnId,
          startTime: '',
          endTime: '',
          repeat: 'none',
        };

        setSchedules((prev) => [...prev, newSchedule]);
      }
    } else if (source.type === 'task') {
      let targetColumnId: string | null = null;
      if (target.type === 'column') {
        targetColumnId = String(target.id);
      } else if (target.type === 'task') {
        for (const [colId, list] of Object.entries(items)) {
          if (list.some((item) => item.id === target.id)) {
            targetColumnId = colId;
            break;
          }
        }
      }

      const sourceTaskId = String(source.id);
      const [scheduleId, sourceDateIso] = sourceTaskId.split('__');

      if (targetColumnId && sourceDateIso && targetColumnId !== sourceDateIso) {
        // 任務被拖曳至不同日期：調整排程日期
        const sched = schedules.find((s) => s.id === scheduleId);
        if (sched) {
          const isRecurring = sched.repeat && sched.repeat !== 'none';
          if (isRecurring) {
            // 週期排程：將原日期排除，並於新目標日期建立單日排程
            const movedSched: ScheduleItem = {
              id: `s_${Date.now()}`,
              materialId: sched.materialId,
              title: sched.title,
              date: targetColumnId,
              startTime: sched.startTime,
              endTime: sched.endTime,
              repeat: 'none',
            };
            setSchedules((prev) => [
              ...prev.map((s) => {
                if (s.id !== scheduleId) return s;
                const excluded = s.excludedDates || [];
                if (!excluded.includes(sourceDateIso)) {
                  return { ...s, excludedDates: [...excluded, sourceDateIso] };
                }
                return s;
              }),
              movedSched,
            ]);
          } else {
            // 非週期排程：直接變更排定日期
            setSchedules((prev) =>
              prev.map((s) => (s.id === scheduleId ? { ...s, date: targetColumnId! } : s))
            );
          }
        }
      } else {
        // 同一日期欄位內順序調整
        setItems((prev) => move(prev, event));
      }
    }
  };

  // 教材保存與刪除
  const handleSaveMaterial = (data: MaterialData) => {
    if (data.id) {
      setMaterials((prev) =>
        prev.map((item) => (item.id === data.id ? { ...item, ...data } : item))
      );
    } else {
      const newMaterial: MaterialData = {
        ...data,
        id: `mat-${Date.now()}`,
      };
      setMaterials((prev) => [newMaterial, ...prev]);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('確定要刪除這項教材嗎？')) {
      setMaterials((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // --- 排程 新增/修改/刪除/完成狀態 操作 ---

  // 開啟新增排程 Modal
  const handleOpenAddSchedule = (dateIso?: string) => {
    if (mode === 'host') return;
    const initialDate = dateIso || formatDateISO(new Date());
    setSelectedDateForSchedule(initialDate);
    setIsScheduleModalOpen(true);
  };

  // 保存新增排程
  const handleSaveSchedule = (data: {
    materialId?: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    repeat: RepeatType;
    monthlyDay?: number;
  }) => {
    const newSchedule: ScheduleItem = {
      id: `s_${Date.now()}`,
      materialId: data.materialId,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      repeat: data.repeat,
      monthlyDay: data.monthlyDay,
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  // 點擊卡片 ✏️ 開啟編輯排程時間與週期規則
  const handleEditCard = (id: string, dateIso?: string) => {
    if (mode === 'host') return;
    const targetDate = dateIso || id.split('__')[1] || formatDateISO(new Date());
    const scheduleId = id.split('__')[0];
    const sched = schedules.find((s) => s.id === scheduleId);
    if (!sched) return;

    setEditingSchedule(sched);
    setEditingTargetDate(targetDate);
    setIsEditScheduleModalOpen(true);
  };

  // 保存編輯排程時間與週期規則
  const handleSaveEditSchedule = (data: {
    startTime: string;
    repeat: RepeatType;
    monthlyDay?: number;
  }) => {
    if (!editingSchedule) return;

    const scheduleId = editingSchedule.id;
    const targetDate = editingTargetDate;
    const isOriginalRecurring = editingSchedule.repeat && editingSchedule.repeat !== 'none';

    if (isOriginalRecurring) {
      setIsEditScheduleModalOpen(false);
      setRecurrenceModalConfig({
        title: '編輯週期課程',
        message: '這是一門週期性重複的課程，請問您希望如何套用變更？',
        opt1Text: '【僅修改本日】',
        opt2Text: '【變更本日及往後所有週期】',
        onOpt1: () => {
          // 1. 本日加入排除名單
          // 2. 本日新增獨立非重複排程
          const newSingleSched: ScheduleItem = {
            id: `s_${Date.now()}`,
            materialId: editingSchedule.materialId,
            title: editingSchedule.title,
            date: targetDate,
            startTime: data.startTime,
            endTime: editingSchedule.endTime || '',
            repeat: 'none',
          };

          setSchedules((prev) => [
            ...prev.map((s) => {
              if (s.id !== scheduleId) return s;
              const excluded = s.excludedDates || [];
              if (!excluded.includes(targetDate)) {
                return { ...s, excludedDates: [...excluded, targetDate] };
              }
              return s;
            }),
            newSingleSched,
          ]);
        },
        onOpt2: () => {
          setSchedules((prev) =>
            prev.map((s) => {
              if (s.id !== scheduleId) return s;
              return {
                ...s,
                startTime: data.startTime,
                repeat: data.repeat,
                monthlyDay: data.repeat === 'monthly' ? data.monthlyDay : undefined,
              };
            })
          );
        },
      });
      setIsRecurrenceModalOpen(true);
    } else {
      setSchedules((prev) =>
        prev.map((s) => {
          if (s.id !== scheduleId) return s;
          return {
            ...s,
            startTime: data.startTime,
            repeat: data.repeat,
            monthlyDay: data.repeat === 'monthly' ? data.monthlyDay : undefined,
          };
        })
      );
      setIsEditScheduleModalOpen(false);
    }
  };

  // 從編輯 Modal 內點擊「刪除此排程」
  const handleDeleteFromEditModal = () => {
    if (!editingSchedule) return;
    const scheduleId = editingSchedule.id;
    const targetDate = editingTargetDate;
    setIsEditScheduleModalOpen(false);
    handleDeleteCard(scheduleId, targetDate);
  };

  // 刪除排程（支援週期排程確認）
  const handleDeleteCard = (id: string, dateIso?: string) => {
    if (mode === 'host') return;
    const targetDate = dateIso || id.split('__')[1] || formatDateISO(new Date());
    const scheduleId = id.split('__')[0];
    const sched = schedules.find((s) => s.id === scheduleId);
    if (!sched) return;

    const isRecurring = sched.repeat && sched.repeat !== 'none';

    if (isRecurring) {
      setRecurrenceModalConfig({
        title: '刪除週期課程',
        message: '這是一門週期性重複的課程，請問您希望如何處理刪除？',
        opt1Text: '【僅刪除本日】',
        opt2Text: '【刪除此週期（往後不再重複）】',
        onOpt1: () => {
          setSchedules((prev) =>
            prev.map((s) => {
              if (s.id !== scheduleId) return s;
              const excluded = s.excludedDates || [];
              if (!excluded.includes(targetDate)) {
                return { ...s, excludedDates: [...excluded, targetDate] };
              }
              return s;
            })
          );
        },
        onOpt2: () => {
          setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
        },
      });
      setIsRecurrenceModalOpen(true);
    } else {
      if (confirm('確定要刪除這項排程嗎？')) {
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      }
    }
  };

  // 切換完成狀態
  const handleToggleComplete = (id: string, dateIso?: string) => {
    if (mode === 'host') return; // 樓主模式僅供閱覽，不可標記完成
    const targetDate = dateIso || id.split('__')[1] || formatDateISO(new Date());
    const scheduleId = id.split('__')[0];
    const key = `${scheduleId}_${targetDate}`;

    setCompletions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 切換週次
  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // 切換 樓主養成計畫 / 個人行事曆
  const handleToggleHostPlan = () => {
    setMode((prev) => (prev === 'personal' ? 'host' : 'personal'));
  };

  // 播放任務對應的影片
  const handlePlayVideoFromTask = (task: TaskItem) => {
    const allMaterials = [...materials, ...HOST_MATERIALS];
    const found =
      allMaterials.find((m) => m.id === task.materialId) ||
      allMaterials.find((m) => m.title.trim() === task.title.trim());

    setVideoModalData({
      isOpen: true,
      title: found?.title || task.title,
      urls: found?.urls || [],
    });
  };

  // 播放教材對應的影片
  const handlePlayVideoFromMaterial = (material: MaterialData) => {
    setVideoModalData({
      isOpen: true,
      title: material.title,
      urls: material.urls || [],
    });
  };

  // 收藏樓主教材至個人教材庫
  const handleCollectHostMaterial = (hostMat: MaterialData) => {
    const hostUrls = hostMat.urls || [];
    const isDuplicate = materials.some(
      (m) =>
        m.title.trim() === hostMat.title.trim() ||
        (m.urls && hostUrls.length > 0 && m.urls.some((u) => hostUrls.includes(u)))
    );

    if (isDuplicate) {
      alert('此教材已在您的個人教材庫中囉！');
      return;
    }

    const cloned: MaterialData = {
      id: `mat-${Date.now()}`,
      title: hostMat.title,
      tags: hostMat.tags ? [...hostMat.tags] : ['通用'],
      urls: [...hostUrls],
    };

    setMaterials((prev) => [cloned, ...prev]);
    alert('已成功收藏至個人教材庫！');
  };

  // 計算本週任務數量與已完成數量
  let totalCount = 0;
  let completedCount = 0;
  for (const date of weekDates) {
    const key = formatDateISO(date);
    const dayTasks = items[key] || [];
    totalCount += dayTasks.length;
    completedCount += dayTasks.filter((task) => task.completed).length;
  }

  // 週範圍文字呈現
  const startStr = `${weekDates[0].getFullYear()}/${String(weekDates[0].getMonth() + 1).padStart(2, '0')}/${String(weekDates[0].getDate()).padStart(2, '0')}`;
  const endStr = `${weekDates[6].getFullYear()}/${String(weekDates[6].getMonth() + 1).padStart(2, '0')}/${String(weekDates[6].getDate()).padStart(2, '0')}`;

  return (
    <>
      {/* Header */}
      <header className="flex h-[56px] shrink-0 items-center justify-between whitespace-nowrap border-b border-[#D8C3AC] bg-[var(--bg-header)] px-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] z-10 overflow-visible">
        <div className="hdr-left">
          <div className="logo-container">
            <div className="logo-box">聚</div>
            <div className="logo-text" data-i18n="mainTitle">
              ✨養成計畫
            </div>
          </div>
          <div className="view-capsule">
            <button
              className="capsule-btn active"
              id="btnViewScheduler"
              data-i18n="navScheduler"
              data-tooltip="切換至週看板視圖"
            >
              週看板
            </button>
            <button
              className="capsule-btn"
              id="btnViewTheme"
              data-i18n="navTheme"
              data-tooltip="切換至主題收藏庫"
            >
              主題收藏庫
            </button>
          </div>
        </div>

        <div className="hdr-right">
          <div className="font-btn-group">
            <div className="tooltip-wrapper tooltip-bottom">
              <button id="btnFontDec">A-</button>
              <div className="custom-tooltip" role="tooltip" data-i18n="tooltipLanguage">
                縮小字型
              </div>
            </div>
            <div className="tooltip-wrapper tooltip-bottom">
              <button id="btnFontInc">A+</button>
              <div className="custom-tooltip" role="tooltip" data-i18n="tooltipLanguage">
                放大字型
              </div>
            </div>
          </div>
          <div className="tooltip-wrapper tooltip-bottom">
            <select className="lang-select" id="langSelect" defaultValue="zh-TW">
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
            </select>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipLanguage">
              切換介面語言 / Switch Language
            </div>
          </div>
          <div className="tooltip-wrapper tooltip-bottom">
            <button className="hdr-icon-btn" id="btnMember">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
              會員中心
            </div>
          </div>
          <div className="tooltip-wrapper tooltip-bottom">
            <button className="share-btn" id="btnShare">
              <svg viewBox="0 0 24 24">
                <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
              </svg>
            </button>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
              分享
            </div>
          </div>
          <div className="tooltip-wrapper tooltip-bottom tooltip-right">
            <button className="hdr-icon-btn" id="btnVoiceIntro">
              <svg viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </button>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
              欸？為什麼我們做這個？
            </div>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="control-bar">
        <div className="ctrl-left">
          <div className="week-nav-group">
            <div className="tooltip-wrapper">
              <button
                type="button"
                className="week-nav-btn"
                id="btnPrevWeek"
                onClick={handlePrevWeek}
                data-tooltip="上一週"
              >
                &lt;
              </button>
              <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
                上一週
              </div>
            </div>
            <span className="week-range-text" id="weekRangeDisplay">
              {startStr} - {endStr}
            </span>
            <div className="tooltip-wrapper">
              <button
                type="button"
                className="week-nav-btn"
                id="btnNextWeek"
                onClick={handleNextWeek}
                data-tooltip="下一週"
              >
                &gt;
              </button>
              <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
                下一週
              </div>
            </div>
          </div>

          <div className="progress-stats-box">
            <span data-i18n="completedProgressLabel">本週累計完成：</span>
            <span className="progress-highlight" id="lblCompletedCount">
              {completedCount}
            </span>{' '}
            / <span id="lblTotalCount">{totalCount}</span>{' '}
            <span data-i18n="videoUnit">部影片</span>
          </div>

          {/* 切換樓主計畫 / 個人行事曆 */}
          <button
            type="button"
            id="btnHostPlan"
            className="btn-host-plan"
            onClick={handleToggleHostPlan}
            style={
              mode === 'host'
                ? { backgroundColor: '#4A3B32', color: '#FFFFFF' }
                : undefined
            }
          >
            {mode === 'personal' ? '✨ 看樓主的養成計畫' : '🔙 回我的行事曆'}
          </button>
        </div>

        <div className="ctrl-right">
          <div className="tooltip-wrapper">
            <button
              type="button"
              className="btn-drawer-pill"
              id="btnToggleDrawer"
              onClick={toggleDrawer}
            >
              {isDrawerCollapsed ? '◀ 展開教材庫' : '收起教材庫 ▶'}
            </button>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
              收合或展開右側教材庫
            </div>
          </div>
          <div className="tooltip-wrapper tooltip-right">
            <button id="btnSupportUs" className="btn-support-pill" data-i18n="btnSupportUs">
              💛 小小支持
            </button>
            <div className="custom-tooltip" role="tooltip" data-i18n="tooltipSupport">
              喜歡這個工具嗎？歡迎給我們一點小鼓勵 😊
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      <main>
        <div className="view-content active">
          <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex-1 flex h-full overflow-hidden padding: 0.6rem; gap: 0.6rem; position: relative;">
              <Kanban
                weekStartDate={weekStart}
                items={items}
                mode={mode}
                onDeleteCard={handleDeleteCard}
                onToggleComplete={handleToggleComplete}
                onEditCard={handleEditCard}
                onOpenAddClass={handleOpenAddSchedule}
                onPlayVideo={handlePlayVideoFromTask}
              />

              <MaterialDrawer
                mode={mode}
                materials={mode === 'host' ? HOST_MATERIALS : materials}
                isCollapsed={isDrawerCollapsed}
                onToggleCollapse={toggleDrawer}
                onOpenAddMaterial={() => {
                  setEditingMaterial(null);
                  setIsMaterialModalOpen(true);
                }}
                onDeleteMaterial={handleDeleteMaterial}
                onPlayMaterial={handlePlayVideoFromMaterial}
                onCollectMaterial={handleCollectHostMaterial}
              />
            </div>
          </DragDropProvider>
        </div>
      </main>

      {/* 教材維護 Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        initialData={editingMaterial}
        onClose={() => setIsMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
      />

      {/* 排定課程 Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        materials={materials}
        defaultDate={selectedDateForSchedule}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
      />

      {/* 編輯排程時間與週期規則 Modal */}
      <EditScheduleModal
        isOpen={isEditScheduleModalOpen}
        initialData={
          editingSchedule
            ? {
                title: editingSchedule.title,
                startTime: editingSchedule.startTime,
                repeat: editingSchedule.repeat,
                monthlyDay: editingSchedule.monthlyDay,
              }
            : null
        }
        onClose={() => setIsEditScheduleModalOpen(false)}
        onSave={handleSaveEditSchedule}
        onDelete={handleDeleteFromEditModal}
      />

      {/* 週期排程變更確認 Modal */}
      <RecurrenceConfirmModal
        isOpen={isRecurrenceModalOpen}
        title={recurrenceModalConfig.title}
        message={recurrenceModalConfig.message}
        opt1Text={recurrenceModalConfig.opt1Text}
        opt2Text={recurrenceModalConfig.opt2Text}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onOpt1={recurrenceModalConfig.onOpt1}
        onOpt2={recurrenceModalConfig.onOpt2}
      />

      {/* 影片播放器 Modal */}
      <VideoModal
        isOpen={videoModalData.isOpen}
        title={videoModalData.title}
        urls={videoModalData.urls}
        onClose={() => setVideoModalData((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
