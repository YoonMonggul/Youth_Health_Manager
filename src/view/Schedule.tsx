"use client"

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

// 더미 일정 카테고리 데이터
const scheduleCategories = [
  {
    title: "학사 일정",
    items: [
      { label: "기본", checked: true, color: "blue" },
    ],
  },
  {
    title: "건강관리프로그램",
    items: [
      { label: "비만", checked: true, color: "red" },
    ],
  },
];

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

export default function Schedule() {
  // 아코디언 상태
  const [openIdx, setOpenIdx] = useState([0, 1]);
  // 달력 상태(2025년 3월)
  const year = 2025;
  const month = 2; // 0-indexed (3월)
  const calendar = getCalendarMatrix(year, month);

  return (
    <div className="flex h-[100vh] bg-gray-100">
      {/* 좌측 일정관리 패널 */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">일정관리</span>
          <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {scheduleCategories.map((cat, idx) => (
              <div key={cat.title} className="mb-2">
                <button
                  className="w-full flex items-center justify-between px-2 py-1 rounded text-sm bg-gray-100 font-semibold"
                  onClick={() => setOpenIdx(openIdx.includes(idx) ? openIdx.filter(i => i !== idx) : [...openIdx, idx])}
                  type="button"
                >
                  {cat.title}
                  {openIdx.includes(idx) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openIdx.includes(idx) && (
                  <ul className="bg-white border rounded mt-1">
                    {cat.items.map((item) => (
                      <li key={item.label} className="flex items-center px-3 py-2 text-xs gap-2">
                        <input type="checkbox" checked={item.checked} readOnly className="accent-blue-500" />
                        <span className={`font-medium ${item.color === "red" ? "text-red-500" : "text-blue-500"}`}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 중앙 월별 일정 패널 */}
      <main className="flex-1 flex flex-col gap-2 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-xl">월별 일정</span>
          <button className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">+ 일정등록</button>
        </div>
        <div className="bg-white rounded border p-4 flex flex-col">
          {/* 달력 상단 컨트롤 */}
          <div className="flex items-center gap-4 mb-2">
            <button className="px-3 py-1 text-xs bg-gray-200 rounded">오늘</button>
            <span className="font-semibold text-lg">2025년 3월</span>
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
                          {cell.date.getMonth() === month ? cell.date.getDate() : cell.date.getMonth() === month - 1 && cell.date.getDate() > 20 ? `${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일` : cell.date.getDate()}
                        </div>
                        {/* 예시 일정 표시 */}
                        {cell.date.getMonth() === month && cell.date.getDate() === 1 && (
                          <div className="absolute top-6 left-1 text-[10px] text-gray-500">3월1일</div>
                        )}
                        {cell.date.getMonth() === month && cell.date.getDate() >= 5 && cell.date.getDate() <= 19 && (
                          <div className="absolute top-8 left-0 right-0 h-0.5 bg-red-500" />
                        )}
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
    </div>
  );
} 