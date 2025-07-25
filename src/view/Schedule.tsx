"use client"

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import ScheduleAddModal from '@/components/modals/ScheduleAddModal';

interface ProgramStart {
  id: number;
  programName: string;
  startDate: string;
  endDate: string;
  isStarted: boolean;
}

interface UserSchedule {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  note?: string;
}

// 달력 날짜 생성 함수 (2025년 3월 기준)
function getCalendarMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const matrix = [];
  let week = [];
  let day = 1 - firstDay.getDay();
  for (let i = 0; i < 6; i++) {
    week = [];
    for (let j = 0; j < 7; j++, day++) {
      const date = new Date(year, month, day);
      week.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: false,
      });
    }
    matrix.push(week);
  }
  return matrix;
}

// 날짜를 연-월-일 문자열로 변환
function ymd(date: Date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join('-');
}

export default function Schedule() {
  // 아코디언 상태
  const [openIdx, setOpenIdx] = useState([0]);
  // 달력 상태 (월 이동)
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const calendar = getCalendarMatrix(year, month);

  // 건강관리프로그램(시작중) 목록 상태
  const [programs, setPrograms] = useState<ProgramStart[]>([]);
  const [loading, setLoading] = useState(true);

  // 프로그램별 표시 여부 상태 (id: boolean)
  const [programVisibility, setProgramVisibility] = useState<{ [id: number]: boolean }>({});

  // 사용자 일정 목록 상태
  const [userSchedules, setUserSchedules] = useState<UserSchedule[]>([]); // 사용자 일정 목록
  const [loadingSchedules, setLoadingSchedules] = useState(true); // 사용자 일정 로딩

  // 일정등록 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 일정등록 모달 상태

  // 건강관리프로그램 불러오기
  useEffect(() => {
    async function fetchPrograms() {
      setLoading(true);
      try {
        const res = await fetch('/api/programs/program-starts');
        if (!res.ok) throw new Error('프로그램 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setPrograms(data.items || []);
        // 모든 프로그램을 기본적으로 표시(true)
        const visibility: { [id: number]: boolean } = {};
        (data.items || []).forEach((p: ProgramStart) => { visibility[p.id] = true; });
        setProgramVisibility(visibility);
      } catch {
        setPrograms([]);
        setProgramVisibility({});
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  // 사용자 일정 불러오기
  useEffect(() => {
    async function fetchSchedules() {
      setLoadingSchedules(true);
      try {
        const res = await fetch('/api/schedules');
        if (!res.ok) throw new Error('일정 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setUserSchedules(data.items || []);
      } catch {
        setUserSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    }
    fetchSchedules();
  }, []);

  // 일정 등록 핸들러 (등록 후 목록 갱신)
  async function handleAddSchedule(formData: { title: string; startDate: string; endDate: string; note?: string }) {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('일정 등록 실패');
      // 등록 후 일정 목록 새로고침
      const refreshed = await fetch('/api/schedules');
      const refreshedData = await refreshed.json();
      setUserSchedules(refreshedData.items || []);
      alert('일정이 등록되었습니다!');
    } catch (e) {
      alert('일정 등록 중 오류가 발생했습니다.');
    }
  }

  // 체크박스 토글 핸들러
  function handleProgramCheckbox(id: number) {
    setProgramVisibility(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex h-[100vh] bg-gray-100">
      {/* 좌측 일정관리 패널 */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">일정관리</span>
          <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* 건강관리프로그램 탭 */}
            <div className="mb-2">
              <button
                className="w-full flex items-center justify-between px-2 py-1 rounded text-sm bg-gray-100 font-semibold"
                onClick={() => setOpenIdx(openIdx.includes(0) ? openIdx.filter(i => i !== 0) : [...openIdx, 0])}
                type="button"
              >
                건강관리프로그램
                {openIdx.includes(0) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openIdx.includes(0) && (
                <ul className="bg-white border rounded mt-1">
                  {loading ? (
                    <li className="px-3 py-2 text-xs text-gray-400">로딩 중...</li>
                  ) : programs.length > 0 ? programs.map((p) => (
                    <li key={p.id} className="flex flex-col px-3 py-2 text-xs gap-1">
                      <div className="flex items-center gap-2">
                        {/* 체크박스: 표시 여부 제어 */}
                        <input
                          type="checkbox"
                          checked={!!programVisibility[p.id]}
                          onChange={() => handleProgramCheckbox(p.id)}
                          className="accent-blue-500"
                        />
                        <span className="font-medium text-blue-500">{p.programName}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 ml-6">{p.startDate} ~ {p.endDate}</div>
                    </li>
                  )) : (
                    <li className="px-3 py-2 text-xs text-gray-400">진행중인 프로그램이 없습니다.</li>
                  )}
                </ul>
              )}
            </div>
            {/* 사용자 일정 탭 */}
            <div className="mb-2">
              <button
                className="w-full flex items-center justify-between px-2 py-1 rounded text-sm bg-gray-100 font-semibold"
                onClick={() => setOpenIdx(openIdx.includes(1) ? openIdx.filter(i => i !== 1) : [...openIdx, 1])}
                type="button"
              >
                사용자 일정
                {openIdx.includes(1) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openIdx.includes(1) && (
                <ul className="bg-white border rounded mt-1">
                  {loadingSchedules ? (
                    <li className="px-3 py-2 text-xs text-gray-400">로딩 중...</li>
                  ) : userSchedules.length > 0 ? userSchedules.map((s) => (
                    <li key={s.id} className="flex flex-col px-3 py-2 text-xs gap-1">
                      <div className="font-medium text-blue-700">{s.title}</div>
                      <div className="text-[10px] text-gray-400">{s.startDate} ~ {s.endDate}</div>
                      {s.note && <div className="text-[10px] text-gray-500">{s.note}</div>}
                    </li>
                  )) : (
                    <li className="px-3 py-2 text-xs text-gray-400">등록된 일정이 없습니다.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 중앙 월별 일정 패널 */}
      <main className="flex-1 flex flex-col gap-2 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-xl">월별 일정</span>
          <button className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}>
            + 일정등록
          </button>
        </div>
        <div className="bg-white rounded border p-4 flex flex-col">
          {/* 달력 상단 컨트롤 */}
          <div className="flex items-center gap-2 mb-2">
            <button
              className="px-3 py-1 text-xs bg-gray-200 rounded"
              onClick={() => {
                if (month === 0) {
                  setYear(y => y - 1);
                  setMonth(11);
                } else {
                  setMonth(m => m - 1);
                }
              }}
            >
              ◀ 이전 달
            </button>
            <button
              className="px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded"
              onClick={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth());
              }}
            >
              오늘
            </button>
            <button
              className="px-3 py-1 text-xs bg-gray-200 rounded"
              onClick={() => {
                if (month === 11) {
                  setYear(y => y + 1);
                  setMonth(0);
                } else {
                  setMonth(m => m + 1);
                }
              }}
            >
              다음 달 ▶
            </button>
            <span className="font-semibold text-lg ml-4">{year}년 {month + 1}월</span>
          </div>
          {/* 달력 그리드 */}
          <div className="border rounded overflow-hidden">
            <table className="w-full text-center text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2">일</th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                  <th>토</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map((week, i) => (
                  <tr key={i}>
                    {week.map((cell, j) => (
                      <td
                        key={j}
                        className={`h-16 border border-gray-200 align-top relative ${cell.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-300"}`}
                      >
                        <div className="absolute top-1 left-1 text-xs font-semibold">
                          {cell.date.getMonth() === month ? (
                            <span className={
                              cell.date.getDate() === today.getDate() && cell.date.getMonth() === today.getMonth() && cell.date.getFullYear() === today.getFullYear()
                                ? 'relative'
                                : ''
                            }>
                              {cell.date.getDate() === today.getDate() && cell.date.getMonth() === today.getMonth() && cell.date.getFullYear() === today.getFullYear() ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs">
                                  {cell.date.getDate()}
                                </span>
                              ) : (
                                cell.date.getDate()
                              )}
                            </span>
                          ) : cell.date.getMonth() === month - 1 && cell.date.getDate() > 20 ? `${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일` : cell.date.getDate()}
                        </div>
                        {/* 프로그램 시작/종료일 마크: 표시 상태가 true인 프로그램만 */}
                        <div className="absolute left-1 right-1 bottom-1 flex flex-col gap-0.5 z-10">
                          {programs.filter(p => programVisibility[p.id]).map((p) => {
                            const start = new Date(p.startDate);
                            const end = new Date(p.endDate);
                            const d = cell.date;
                            const isStart = ymd(d) === ymd(start);
                            const isEnd = ymd(d) === ymd(end);
                            return (
                              <React.Fragment key={p.id}>
                                {isStart && (
                                  <div className="flex items-center gap-1" title={`시작: ${p.programName}`}>
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] text-blue-700 font-semibold">{p.programName} 시작</span>
                                  </div>
                                )}
                                {isEnd && (
                                  <div className="flex items-center gap-1" title={`종료: ${p.programName}`}>
                                    <span className="inline-block w-2 h-2 bg-red-500" style={{ borderRadius: 2 }} />
                                    <span className="text-[10px] text-red-700 font-semibold">{p.programName} 종료</span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 하단 주요일정 */}
        <div className="bg-white rounded border p-4 mt-2">
          <span className="font-semibold mb-2 block">주요일정</span>
          {/* 예시: 주요일정이 없을 때 */}
          <div className="text-xs text-gray-400">주요일정이 없습니다.</div>
        </div>
      </main>

      {/* 일정등록 모달 */}
      <ScheduleAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSchedule}
      />
    </div>
  );
} 