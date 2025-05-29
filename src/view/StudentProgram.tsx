"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import ProgramAddModal from '@/components/modals/ProgramAddModal';

export default function StudentProgram() {
  // 목업 데이터
  const [selectedTab, setSelectedTab] = useState(3); // 비만도 과체중 탭 활성화
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const summaryTabs = [
    { label: "전체", value: "00명" },
    { label: "자세불균형\n기초인식", value: "00명" },
    { label: "자세불균형\n습관개선", value: "00명" },
    { label: "비만도\n과체중", value: "00명" },
    { label: "비만도\n비만", value: "00명" },
  ];

  // 화면 수정 드롭다운 상태 및 체크박스 상태
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [programChecks, setProgramChecks] = useState({
    자세불균형기초인식: true,
    자세불균형습관개선: true,
    비만도과체중: true,
    비만도비만: true,
  });
  const editBtnRef = useRef<HTMLButtonElement>(null);

  function handleCheckChange(key: keyof typeof programChecks) {
    setProgramChecks(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function handleDropdownBlur(e: React.FocusEvent<HTMLDivElement>) {
    // 드롭다운 바깥 클릭 시 닫기
    if (!e.currentTarget.contains(e.relatedTarget)) setEditDropdownOpen(false);
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F8FA]">
      {/* 상단 화면 수정 버튼 */}
      <div className="flex justify-end mt-4 mb-1 px-2 relative">
        <button
          ref={editBtnRef}
          type="button"
          className="border rounded px-3 py-1 h-8 text-xs font-medium bg-white hover:bg-gray-50 shadow-sm"
          onClick={() => setEditDropdownOpen(v => !v)}
        >
          화면 수정
        </button>
        {editDropdownOpen && (
          <div
            tabIndex={-1}
            onBlur={handleDropdownBlur}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 px-2 flex flex-col gap-1"
          >
            {Object.keys(programChecks).map(key => (
              <label key={key} className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={programChecks[key as keyof typeof programChecks]}
                  onChange={() => handleCheckChange(key as keyof typeof programChecks)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm">{key}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 상단 통계 요약 */}
      <div className="flex gap-1.5 mb-2">
        {summaryTabs.map((tab, idx) => (
          <div
            key={tab.label}
            className={`flex-1 rounded-lg px-3 py-2 text-center font-bold text-base shadow-sm border cursor-pointer whitespace-pre-line ${
              selectedTab === idx
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-[#F3F4F6] text-gray-900 border-gray-200"
            }`}
            onClick={() => setSelectedTab(idx)}
          >
            <div>{tab.label}</div>
            <div className="text-xl mt-0.5">{tab.value}</div>
          </div>
        ))}
      </div>

      {/* 메인 그리드 */}
      <div className="grid grid-cols-12 gap-4 px-2 pb-8">
        {/* 좌측: 프로그램 대상자 현황 */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-base">프로그램 참여자 현황</div>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">대상자 상세보기</Button>
            </div>
            {/* 성별 그래프 + 학년별 막대그래프를 flex로 배치 */}
            <div className="flex items-end flex-1">
              {/* 학년별 막대그래프 */}
              <div className="flex items-end gap-4 h-40 flex-1">
                {[60, 70, 50, 65, 40, 30, 20, 15, 10, 5, 3, 2].map((v, i) => (
                  <div key={i} className="flex flex-col items-center w-6">
                    <div className="bg-gray-400 rounded-t-md" style={{ height: `${v * 1.5}px`, width: '100%' }} />
                    <div className="text-xs text-gray-500 mt-1">{i < 6 ? `초${i+1}` : i < 9 ? `중${i-5}` : `고${i-8}`}</div>
                  </div>
                ))}
              </div>
              {/* 성별 그래프 */}
              <div className="flex flex-col items-center w-20 ml-2">
                <div className="font-semibold text-xs mb-2">성별</div>
                <div className="flex items-end gap-4 h-32">
                  {[60, 50].map((v, i) => (
                    <div key={i} className="flex flex-col items-center w-8">
                      <div className="bg-gray-400 rounded-t-md" style={{ height: `${v * 1.5}px`, width: '100%' }} />
                      <div className="text-xs text-gray-500 mt-1">{i === 0 ? '남자' : '여자'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 프로그램 진행현황 및 참여율 */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-base">프로그램 진행현황 및 참여율</div>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">콘텐츠 상세보기</Button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="mb-1">
                  <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded font-bold">진행중</span>
                </div>
                <div className="font-bold text-lg mb-1">3주차</div>
                <div className="text-xs text-gray-500">과체중을 줄이는 방법, 식사 관리</div>
              </div>
              <div className="flex gap-4 flex-1 justify-end">
                {[95, 80, 60, 0, 0, 0].map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="#F3F4F6" />
                      <circle
                        cx="28" cy="28" r="24"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={2 * Math.PI * 24 * (1 - v / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s' }}
                      />
                      <text x="50%" y="54%" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0ea5e9">{v}%</text>
                    </svg>
                    <div className="text-xs mt-1">{i+1}주차</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 성별 현황, 기간별 참여, 운영 이력 */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* 프로그램 기간별 참여 현황 */}
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-base">프로그램 기간별 참여 현황</div>
              <select className="border rounded px-2 py-1 text-xs">
                <option>일별</option>
                <option>주별</option>
              </select>
            </div>
            {/* 선그래프 목업 */}
            <div className="flex-1 flex items-end">
              <svg width="100%" height="120" viewBox="0 0 320 120">
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  points="0,80 40,60 80,70 120,50 160,60 200,40 240,60 280,50 320,80"
                />
                {/* 점 */}
                {[80, 60, 70, 50, 60, 40, 60, 50, 80].map((y, i) => (
                  <circle key={i} cx={i*40} cy={y} r="4" fill="#38BDF8" stroke="#fff" strokeWidth="2" />
                ))}
                {/* x축 레이블 */}
                {['10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '10.16'].map((d, i) => (
                  <text key={i} x={i*40+10} y={110} fontSize="11" fill="#888">{d}</text>
                ))}
              </svg>
            </div>
          </div>

          {/* 프로그램 운영 이력 */}
          <div className="bg-white rounded-lg shadow p-3 h-full flex-1 flex flex-col">
            <div className="font-semibold text-base mb-2">프로그램 운영 이력</div>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <div>
                  <div className="text-sm">과체중 프로그램 시작 안내</div>
                  <div className="text-xs text-gray-400">2025. 10. 01 PM 2:00</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">상세보기</Button>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <div className="text-sm">과체중 프로그램 독려 안내</div>
                  <div className="text-xs text-gray-400">2025. 10. 10 PM 2:00</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">상세보기</Button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 우측 하단 메시지 보내기 버튼 */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-base font-bold" onClick={() => setIsProgramModalOpen(true)}>프로그램 추가</Button>
      </div>

      <ProgramAddModal isOpen={isProgramModalOpen} onClose={() => setIsProgramModalOpen(false)} onSubmit={(data) => { alert('임시 등록: ' + JSON.stringify(data)); setIsProgramModalOpen(false); }} />
    </div>
  );
} 