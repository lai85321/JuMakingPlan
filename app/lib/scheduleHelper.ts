export type RepeatType =
  | 'none'
  | 'daily'
  | 'every2days'
  | 'every3days'
  | 'weekly'
  | 'every2weeks'
  | 'monthly';

export interface ScheduleItem {
  id: string;
  materialId?: string;
  title: string;
  date: string; // ISO date 'YYYY-MM-DD'
  startTime?: string;
  endTime?: string;
  repeat?: RepeatType;
  monthlyDay?: number;
  excludedDates?: string[];
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function safeSetStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export function isScheduleActiveOnDate(sched: ScheduleItem, targetDateStr: string): boolean {
  if (!sched.date) return false;
  if (sched.excludedDates && sched.excludedDates.includes(targetDateStr)) {
    return false;
  }

  if (!sched.repeat || sched.repeat === 'none') {
    return sched.date === targetDateStr;
  }

  const baseD = new Date(sched.date + 'T00:00:00');
  const targetD = new Date(targetDateStr + 'T00:00:00');

  if (targetD < baseD) return false;

  const diffTime = targetD.getTime() - baseD.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  switch (sched.repeat) {
    case 'daily':
      return true;
    case 'every2days':
      return diffDays % 2 === 0;
    case 'every3days':
      return diffDays % 3 === 0;
    case 'weekly':
      return diffDays % 7 === 0;
    case 'every2weeks':
      return diffDays % 14 === 0;
    case 'monthly': {
      const targetDay = targetD.getDate();
      const schedDay = sched.monthlyDay || baseD.getDate();
      const maxDaysInTargetMonth = new Date(targetD.getFullYear(), targetD.getMonth() + 1, 0).getDate();
      const expectedDay = Math.min(schedDay, maxDaysInTargetMonth);
      return targetDay === expectedDay;
    }
    default:
      return sched.date === targetDateStr;
  }
}

export function getYouTubeIds(urls?: string[] | string | null): string[] {
  if (!urls) return [];
  const list = Array.isArray(urls) ? urls : [urls];
  const ids: string[] = [];
  list.forEach((item) => {
    if (!item) return;
    const match = item.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match && match[1]) ids.push(match[1]);
  });
  return ids;
}

export const HOST_MATERIALS = [
  {
    id: 'm_host_1',
    title: '陳月卿起床操',
    tags: ['晨起操'],
    urls: [
      'https://www.youtube.com/watch?v=89LSAiFcxUA',
      'https://www.youtube.com/watch?v=xs4RRbTv03E',
      'https://www.youtube.com/watch?v=VY45y26YU00',
      'https://www.youtube.com/watch?v=DmaTWrHggjk',
    ],
  },
  { id: 'm_host_2', title: '唤醒身体和加速代謝', tags: ['晨起操'], urls: ['https://www.youtube.com/watch?v=zy77H-75ots'] },
  { id: 'm_host_3', title: '早晨全身唤醒+拉筋运动', tags: ['伸展'], urls: ['https://www.youtube.com/watch?v=ZKt7ptUlhz8'] },
  { id: 'm_host_4', title: '10分鐘站立式燃脂運動', tags: ['燃脂'], urls: ['https://www.youtube.com/watch?v=GWJGjJYculI'] },
  { id: 'm_host_5', title: '古法经络操', tags: ['經絡'], urls: ['https://www.youtube.com/watch?v=cniKpr0jKgc'] },
  { id: 'm_host_6', title: '古法能量操', tags: ['經絡'], urls: ['https://www.youtube.com/watch?v=UMyneK_ERd0'] },
  { id: 'm_host_7', title: '拍打功', tags: ['經絡'], urls: ['https://www.youtube.com/watch?v=tjgH22RdH1Q'] },
  {
    id: 'm_host_8',
    title: '甩手功+預防血管堵塞',
    tags: ['經絡'],
    urls: [
      'https://www.youtube.com/watch?v=ze0LuL5-sKw',
      'https://www.youtube.com/watch?v=dnf6HaPxlbs',
    ],
  },
  { id: 'm_host_9', title: '古法健身1', tags: ['健身'], urls: ['https://www.youtube.com/watch?v=5HTrknosyxc'] },
  { id: 'm_host_10', title: '古法健身2', tags: ['健身'], urls: ['https://www.youtube.com/watch?v=2lRjLchJW3c'] },
  { id: 'm_host_11', title: '經典古法健身', tags: ['健身'], urls: ['https://www.youtube.com/watch?v=glJexaQx9C0'] },
  {
    id: 'm_host_12',
    title: '認知及記憶力訓練',
    tags: ['保健'],
    urls: [
      'https://www.youtube.com/watch?v=vk3r60n9cdM',
      'https://www.youtube.com/watch?v=IzwuxstXycY',
    ],
  },
  { id: 'm_host_13', title: '止鼾運動', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=28ofSywISDs'] },
  { id: 'm_host_14', title: '平衡訓練', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=298paJb7iAQ'] },
  { id: 'm_host_15', title: '足部運動', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=cySVUzskkLY'] },
  { id: 'm_host_16', title: '膝關節保養', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=S2EAkhB4XEk'] },
  { id: 'm_host_17', title: '吞嚥運動', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=MBqbod5Bb8s'] },
  { id: 'm_host_18', title: '聲帶運動', tags: ['保健'], urls: ['https://www.youtube.com/watch?v=lAkbUxtUAWE'] },
  { id: 'm_host_19', title: '爆汗操', tags: ['燃脂'], urls: ['https://www.youtube.com/watch?v=YeUM9JaqsxM'] },
  { id: 'm_host_20', title: '面部按摩', tags: ['保養'], urls: ['https://www.youtube.com/shorts/DSWdNEyrXk8'] },
  { id: 'm_host_21', title: '夜间版古法健身操', tags: ['健身'], urls: ['https://www.youtube.com/watch?v=7umL0JNvMqA'] },
  { id: 'm_host_22', title: '站立式全身燃脂運動', tags: ['燃脂'], urls: ['https://www.youtube.com/watch?v=hp89yY-e1eQ'] }
];

export function getHostSchedulesForDate(targetDateStr: string): ScheduleItem[] {
  const hostScheds: ScheduleItem[] = [];
  const d = new Date(targetDateStr + 'T00:00:00');
  const dayIdx = (d.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const iso = targetDateStr;

  hostScheds.push({
    id: `s_host_1_${iso}`,
    materialId: 'm_host_1',
    title: '陳月卿起床操',
    date: iso,
    startTime: '07:00',
    endTime: '07:30',
  });

  const matMap2 = [
    { id: 'm_host_2', title: '唤醒身体和加速代謝' },
    { id: 'm_host_3', title: '早晨全身唤醒+拉筋运动' },
    { id: 'm_host_4', title: '10分鐘站立式燃脂運動' },
    { id: 'm_host_5', title: '古法经络操' },
    { id: 'm_host_6', title: '古法能量操' },
    { id: 'm_host_7', title: '拍打功' },
    { id: 'm_host_8', title: '甩手功+預防血管堵塞' },
  ];
  const mat2 = matMap2[dayIdx];
  if (mat2) {
    hostScheds.push({
      id: `s_host_2_${iso}`,
      materialId: mat2.id,
      title: mat2.title,
      date: iso,
      startTime: '07:30',
      endTime: '08:00',
    });
  }

  if (dayIdx === 5) {
    hostScheds.push({
      id: `s_host_3_${iso}`,
      materialId: 'm_host_9',
      title: '古法健身1',
      date: iso,
      startTime: '08:15',
      endTime: '09:00',
    });
  }
  if (dayIdx === 6) {
    hostScheds.push({
      id: `s_host_3_${iso}`,
      materialId: 'm_host_10',
      title: '古法健身2',
      date: iso,
      startTime: '08:15',
      endTime: '09:00',
    });
  }

  if (dayIdx >= 5) {
    hostScheds.push({
      id: `s_host_4_${iso}`,
      materialId: 'm_host_11',
      title: '經典古法健身',
      date: iso,
      startTime: '10:00',
      endTime: '10:40',
    });
  }

  const matMap5 = [
    { id: 'm_host_12', title: '認知及記憶力訓練' },
    { id: 'm_host_13', title: '止鼾運動' },
    { id: 'm_host_14', title: '平衡訓練' },
    { id: 'm_host_15', title: '足部運動' },
    { id: 'm_host_16', title: '膝關節保養' },
  ];
  if (dayIdx <= 4 && matMap5[dayIdx]) {
    hostScheds.push({
      id: `s_host_5_${iso}`,
      materialId: matMap5[dayIdx].id,
      title: matMap5[dayIdx].title,
      date: iso,
      startTime: '13:00',
      endTime: '13:30',
    });
  }

  if (dayIdx === 5) {
    hostScheds.push({
      id: `s_host_6_${iso}`,
      materialId: 'm_host_17',
      title: '吞嚥運動',
      date: iso,
      startTime: '15:00',
      endTime: '15:30',
    });
  }
  if (dayIdx === 6) {
    hostScheds.push({
      id: `s_host_6_${iso}`,
      materialId: 'm_host_18',
      title: '聲帶運動',
      date: iso,
      startTime: '15:00',
      endTime: '15:30',
    });
  }

  if (dayIdx >= 5) {
    hostScheds.push({
      id: `s_host_7_${iso}`,
      materialId: 'm_host_19',
      title: '爆汗操',
      date: iso,
      startTime: '15:30',
      endTime: '16:00',
    });
  }

  hostScheds.push({
    id: `s_host_8_${iso}`,
    materialId: 'm_host_20',
    title: '面部按摩',
    date: iso,
    startTime: '21:00',
    endTime: '21:10',
  });

  if (dayIdx <= 4) {
    hostScheds.push({
      id: `s_host_9_${iso}`,
      materialId: 'm_host_19',
      title: '爆汗操',
      date: iso,
      startTime: '22:00',
      endTime: '22:30',
    });
  } else if (dayIdx === 5) {
    hostScheds.push({
      id: `s_host_9_${iso}`,
      materialId: 'm_host_21',
      title: '夜间版古法健身操',
      date: iso,
      startTime: '22:00',
      endTime: '22:30',
    });
  } else {
    hostScheds.push({
      id: `s_host_9_${iso}`,
      materialId: 'm_host_22',
      title: '站立式全身燃脂運動',
      date: iso,
      startTime: '22:00',
      endTime: '22:30',
    });
  }

  return hostScheds;
}

