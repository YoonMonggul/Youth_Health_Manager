"use client"

import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";

// 더미 데이터 정의
const groupList = [
  { name: "비만도 과체중", count: 50 },
  { name: "비만도 비만", count: 55 },
  { name: "복부비만 양호", count: 21 },
];
const memberList = Array.from({ length: 21 }, (_, i) => `이름${i + 1}`);
const donutData = [
  { name: "정상체중", value: 10, color: "#38bdf8" },
  { name: "저체중", value: 5, color: "#a3e635" },
  { name: "과체중", value: 20, color: "#fbbf24" },
  { name: "비만", value: 15, color: "#ef4444" },
];
const barData = [
  { name: "1학년", value: 20 },
  { name: "2학년", value: 30 },
  { name: "3학년", value: 40 },
  { name: "4학년", value: 60 },
  { name: "5학년", value: 70 },
  { name: "6학년", value: 80 },
];
const genderBarData = [
  { name: "남자", value: 60 },
  { name: "여자", value: 40 },
];
const lineData = [
  { date: "10.10", value: 100 },
  { date: "10.11", value: 120 },
  { date: "10.12", value: 150 },
  { date: "10.13", value: 170 },
  { date: "10.14", value: 160 },
  { date: "10.15", value: 180 },
  { date: "10.16", value: 140 },
];

export default function HealthGroup() {
  // 드롭다운 상태 관리
  const [openGroup, setOpenGroup] = React.useState(0);

  return (
    <div className="flex h-[100vh] bg-gray-100">
      {/* 좌측 그룹 리스트 */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">대상그룹</span>
          <button className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-500 flex items-center gap-1" disabled>
            설정
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="font-semibold text-sm mb-2">비만도 과체중 (50)</div>
            <ul className="mb-2">
              {memberList.map((name) => (
                <li key={name} className="text-xs py-1 px-2 hover:bg-gray-50 rounded cursor-pointer">{name}</li>
              ))}
            </ul>
            {/* 하위 그룹 드롭다운 */}
            {groupList.slice(1).map((g, idx) => (
              <div key={g.name} className="mb-1">
                <button
                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs bg-gray-100 ${openGroup === idx + 1 ? "font-bold" : ""}`}
                  onClick={() => setOpenGroup(openGroup === idx + 1 ? -1 : idx + 1)}
                  type="button"
                >
                  {g.name} ({g.count})
                  {openGroup === idx + 1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {openGroup === idx + 1 && (
                  <ul className="bg-white border rounded mt-1">
                    {memberList.slice(0, 5).map((name) => (
                      <li key={name} className="text-xs py-1 px-3 hover:bg-gray-50 cursor-pointer">{name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 중앙 그룹 정보 */}
      <main className="flex-1 flex flex-col gap-2 p-4">
        <div className="grid grid-cols-3 gap-4 mb-2">
          {/* 그룹 현황(도넛) */}
          <section className="bg-white rounded border p-4 flex flex-col items-center">
            <div className="font-semibold mb-2">그룹 현황</div>
            <PieChart width={160} height={160}>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
              >
                {donutData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="mt-2 text-center text-sm">
              <span className="font-bold text-lg text-red-500">과체중 50명</span>
              <span className="ml-2 text-xs text-gray-400">00%</span>
              <div className="text-xs text-gray-500 mt-1">BMI 평균 24.00</div>
            </div>
          </section>

          {/* 그룹 분포(바차트) */}
          <section className="bg-white rounded border p-4">
            <div className="font-semibold mb-2">그룹 분포</div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <div className="text-xs text-gray-500 mb-1">학년별</div>
                <BarChart width={120} height={80} data={barData}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </div>
              <div className="w-1/2">
                <div className="text-xs text-gray-500 mb-1">성별</div>
                <BarChart width={80} height={80} data={genderBarData}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar dataKey="value" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </div>
            </div>
          </section>

          {/* 프로그램 현황 */}
          <section className="bg-white rounded border p-4 flex flex-col items-center">
            <div className="font-semibold mb-2">프로그램 현황</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded">진행중</span>
              <span className="font-bold text-lg">2주차</span>
            </div>
            <div className="text-xs text-gray-700 mb-2">과체중을 줄이는 적절음</div>
            <button className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-500 mb-2" disabled>금주차 상세보기</button>
            <ul className="text-xs text-gray-500 list-disc pl-4 text-left">
              <li>1주차 | 과체중, 어떤 문제가 있을까?</li>
              <li>2주차 | 과체중을 줄이는 적절음</li>
              <li>3주차 | 과체중을 줄이는 방법, 식사 관리</li>
              <li>4주차 | 재미있는 운동으로 체중 관리</li>
              <li>5주차 | 하루 30분 운동의 중요성</li>
              <li>6주차 | 나의 변화 점검</li>
            </ul>
          </section>
        </div>

        {/* 하단 현황/이슈/이력 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 프로그램 참여 현황 */}
          <section className="bg-white rounded border p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">프로그램 참여 현황</span>
              <button className="text-xs text-gray-400 border px-2 py-0.5 rounded" disabled>기간별 ▼</button>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={lineData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 200]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* 성장기록 변화 현황 */}
          <section className="bg-white rounded border p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">성장기록 변화 현황</span>
              <button className="text-xs text-gray-400 border px-2 py-0.5 rounded" disabled>기간별 ▼</button>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={lineData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 200]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#f472b6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* 주요 이슈 사항 */}
          <section className="bg-white rounded border p-4">
            <div className="font-semibold mb-2">주요 이슈 사항</div>
            <ul className="text-xs text-gray-500 list-disc pl-4">
              <li>프로그램 참여 현황에 대한 이슈</li>
              <li>성장 기록 변화 현황에 대한 이슈</li>
            </ul>
          </section>
        </div>

        {/* 프로그램 운영 이력 */}
        <div className="grid grid-cols-3 gap-4 mt-2">
          <section className="bg-white rounded border p-4 col-span-2">
            <div className="font-semibold mb-2">프로그램 운영 이력</div>
            <ul className="text-xs text-gray-500">
              <li>과체중 프로그램 시작 안내 <span className="ml-2 text-gray-400">2025. 05. 01 PM 2:00</span></li>
              <li>과체중 프로그램 독려 안내 <span className="ml-2 text-gray-400">2025. 05. 01 PM 2:00</span></li>
            </ul>
          </section>
          <section className="bg-white rounded border p-4 flex flex-col justify-end">
            <button className="ml-auto text-xs bg-blue-600 text-white px-4 py-2 rounded shadow">메시지 보내기</button>
          </section>
        </div>
      </main>
    </div>
  );
} 