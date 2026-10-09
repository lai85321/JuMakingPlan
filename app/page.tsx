"use client";

import { useState } from "react";
import { Kanban, type KanbanItems, type TaskItem } from "./components/Kanban/Kanban";
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import getMonday from "./lib/getMonday"
import { MaterialDrawer } from "./components/MaterialDrawer/MaterialDrawer";


export default function Home() {
  const [mode, setMode] = useState<'personal' | 'host'>('personal');
  const weekDates = [];
  let currentWeekStart = getMonday(new Date());
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    weekDates.push(d);
  }

  // Initial Kanban items
  const [items, setItems] = useState<KanbanItems>(() => {
    const initial: KanbanItems = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      initial[key] = [{ id: `task-${key}`, title: `task - ${key}`, time: '07:00' }];
    }
    return initial;
  });

  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation;
    if (source?.type === 'task') {
      setItems((prev) => move(prev, event));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

      if (targetColumnId && items[targetColumnId]) {
        const materialData = (source.data as any)?.material;
        const newTaskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newTask: TaskItem = {
          id: newTaskId,
          title: materialData?.title || '新任務',
          time: '07:00',
        };

        setItems((prev) => {
          const colList = prev[targetColumnId!] || [];
          let insertIndex = colList.length;
          if (target.type === 'task') {
            const idx = colList.findIndex((item) => item.id === target.id);
            if (idx !== -1) insertIndex = idx;
          }
          const updated = [...colList];
          updated.splice(insertIndex, 0, newTask);
          return {
            ...prev,
            [targetColumnId!]: updated,
          };
        });
      }
    } else if (source.type === 'task') {
      setItems((prev) => move(prev, event));
    }
  };

  // Update Week Range Display
  const isMobile = false//window.innerWidth <= 768;
  const startStr = isMobile
    ? `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()}`
    : `${weekDates[0].getFullYear()}/${String(weekDates[0].getMonth() + 1).padStart(2, '0')}/${String(weekDates[0].getDate()).padStart(2, '0')}`;
  const endStr = isMobile
    ? `${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`
    : `${weekDates[6].getFullYear()}/${String(weekDates[6].getMonth() + 1).padStart(2, '0')}/${String(weekDates[6].getDate()).padStart(2, '0')}`;
  return (
    <>
      {/* Header */}
      <header className="flex h-[56px] shrink-0 items-center justify-between whitespace-nowrap border-b border-[#D8C3AC] bg-[var(--bg-header)] px-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] z-10 overflow-visible">
        <div className="flex items-center gap-[0.6rem] shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-black text-[1.1rem] font-bold text-white">聚</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[var(--text-dark)] text-xl font-extrabold tracking-[-0.5px]" data-i18n="mainTitle">聚✨養成計畫</span>
            <span className="text-[#666] text-xs font-semibold tracking-[0.5px]">SOMETHING IN THE MAKING</span>
          </div>
        </div>

        <div className="flex items-center justify-center shrink-0">
          <div className="bg-[#D6C4B0] p-[3px] rounded-[20px] flex gap-[3px]">
            {/* <button id="btnViewScheduler" className="capsule-btn active" data-i18n="navScheduler">課程安排</button>
            <button id="btnViewTheme" className="capsule-btn" data-i18n="navTheme">主題收藏庫</button> */}
          </div>
        </div>

        <div className="flex items-center gap-[0.4rem] shrink-0">
          {/* <div class="font-btn-group">
            <button id="btnFontDec" aria-label="Decrease font size">A-</button>
            <button id="btnFontInc" aria-label="Increase font size">A+</button>
          </div> */}
          {/* <select id="langSelect" class="lang-select" aria-label="Language Selector">
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="es">Español</option>
          </select> */}
          <div className="tooltip-wrap">
            <button id="btnMember" className="hdr-icon-btn" aria-label="Member Center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <div id="tooltipMember" className="custom-tooltip" role="tooltip" data-i18n="tooltipMember">會員中心</div>
          </div>
          {/* <div class="tooltip-wrap">
            <button id="btnShare" class="share-btn" aria-label="Share">
              <svg viewBox="0 0 24 24">
                <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
              </svg>
            </button>
            <div id="tooltipShare" class="custom-tooltip" role="tooltip" data-i18n="tooltipShare">分享</div>
          </div> */}
          {/* <button id="btnGuideShowcase" class="hdr-btn hdr-btn-high-contrast btn-guide-showcase" data-i18n="btnGuideShowcase">
            <span style="font-size: 23px; line-height: 1; display: inline-block;">💁‍♀️</span><span>認識我們</span>
          </button> */}
        </div>
      </header>


      {/* <!-- View 1: Scheduler --> */}

      <div className="scheduler-controls">
        <div className="controls-left">
          <div className="date-picker-group">
            <button id="btnPrevWeek" aria-label="Previous week">&lt;</button>
            <span id="dateRangeDisplay" className="date-range-display">{startStr} - {endStr}</span>
            <button id="btnNextWeek" aria-label="Next week">&gt;</button>
          </div>
          <div className="classroom-pill-group">
            <select id="classroomSelect">
              {/* <option value="" selected disabled data-i18n="selectClassroom">去教室</option> */}
            </select>
            <button id="btnManageClassrooms" className="btn-pill-add" aria-label="Manage Classrooms">➕</button>
          </div>
          {/* 3. Renamed Host Plan Button */}
          <button id="btnHostPlan" className="btn-host-plan" data-i18n="btnHostPlan">✨ 看樓主的養成計畫</button>
        </div>
        <div className="controls-right">
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
      {/* <!-- Main Work Area --> */}
      <main>
        {/*Kanban */}
        <div className="view-content active">
          <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex-1 flex h-full overflow-hidden padding: 0.6rem; gap: 0.6rem; position: relative;">

              <Kanban weekStartDate={currentWeekStart} items={items} mode={mode} />
              <MaterialDrawer mode={mode}>

              </MaterialDrawer>
            </div>
          </DragDropProvider>
        </div>



      </main>


    </>
  )
}
