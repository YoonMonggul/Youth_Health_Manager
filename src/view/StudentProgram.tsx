"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import ProgramAddModal from '@/components/modals/ProgramAddModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgramStartModal from '@/components/modals/ProgramStartModal';
import ProgramEndModal from '@/components/modals/ProgramEndModal';
import ParticipantDetailModal from '@/components/modals/ParticipantDetailModal';

interface ProgramStart {
  id: number;
  program: { id: number; name: string; trendType?: string };
  startDate: string;
  endDate: string;
  isStarted: boolean;
  students?: { id: number }[];
  programName: string;
}

interface Student {
  id: number;
  name: string;
  schoolType: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  gender: 'male' | 'female';
}

interface WeeklyAverage {
  week: number;
  averageValue: number | null;
  participantCount: number;
  weekStartDate: string;
  weekEndDate: string;
}

interface WeeklyAverageData {
  programId: number;
  programName: string;
  trendType: string;
  totalWeeks: number;
  weeklyAverages: WeeklyAverage[];
}

// 프로그램 로그 인터페이스 추가
interface ProgramLog {
  id: number;
  programStartId: number;
  logType: 'START' | 'END' | 'STUDENT_ADD' | 'STUDENT_REMOVE' | 'NOTICE' | 'REMINDER' | 'CHECKUP' | 'MEASUREMENT' | 'OTHER';
  title: string;
  content: string;
  studentId?: number;
  studentName?: string;
  additionalData?: object;
  createdAt: Date;
  createdBy?: string;
}

export default function StudentProgram() {
  // 목업 데이터
  const [selectedTab, setSelectedTab] = useState(0); // 첫 번째 탭으로 초기화
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  // 최근 시작한 프로그램 6개를 상단 박스에 표시
  const [runningProgramStarts, setRunningProgramStarts] = useState<ProgramStart[]>([]);
  
  // 주차별 평균값 데이터 상태
  const [weeklyAverageData, setWeeklyAverageData] = useState<WeeklyAverageData | null>(null);
  const [loadingWeeklyData, setLoadingWeeklyData] = useState(false);

  // 프로그램 로그 상태 추가
  const [programLogs, setProgramLogs] = useState<ProgramLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 화면 수정 드롭다운 상태 및 체크박스 상태
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [programChecks, setProgramChecks] = useState({
    저체중: true,
    정상체중: true,
    과체중: true,
    비만: true,
    복부비만양호: true,
    복부비만주의: true,
  });
  const editBtnRef = useRef<HTMLButtonElement>(null);

  // 최근 프로그램 목록 메모이제이션
  const recentPrograms = useMemo(() => {
    return runningProgramStarts
      .slice()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [runningProgramStarts]);

  // 선택된 프로그램 메모이제이션
  const selectedProgram = useMemo(() => {
    return recentPrograms[selectedTab] || null;
  }, [recentPrograms, selectedTab]);

  // 6개 미만이면 빈 박스 채우기
  const summaryTabs = useMemo(() => {
    const tabs: Array<{
      label: string;
      value: string;
      isProgram: boolean;
      programIndex?: number;
    }> = [];
    
    // 실제 프로그램들 추가 (showAllPrograms에 따라 다르게 표시)
    const programsToShow = showAllPrograms ? recentPrograms : recentPrograms.slice(0, 6);
    
    programsToShow.forEach((prog, idx) => {
      tabs.push({
        label: prog.programName || prog.program?.name || '프로그램',
        value: `${prog.students?.length ?? 0}명`,
        isProgram: true,
        programIndex: idx
      });
    });
    
    // 빈 박스 추가 로직 수정
    if (!showAllPrograms) {
      // 첫 번째 줄에서만 빈 박스 추가 (6개 미만일 때)
      if (recentPrograms.length < 6) {
        const emptySlots = 6 - recentPrograms.length;
        for (let i = 0; i < emptySlots; i++) {
          tabs.push({
            label: '프로그램 시작',
            value: '+',
            isProgram: false
          });
        }
      }
    } else {
      // 전체 보기 모드에서는 모든 줄에 6개씩 맞춤
      const totalSlots = Math.ceil(recentPrograms.length / 6) * 6;
      const emptySlots = totalSlots - recentPrograms.length;
      for (let i = 0; i < emptySlots; i++) {
        tabs.push({
          label: '프로그램 시작',
          value: '+',
          isProgram: false
        });
      }
    }
    
    return tabs;
  }, [recentPrograms, showAllPrograms]);

  function handleCheckChange(key: keyof typeof programChecks) {
    setProgramChecks(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function handleDropdownBlur(e: React.FocusEvent<HTMLDivElement>) {
    // 드롭다운 바깥 클릭 시 닫기
    if (!e.currentTarget.contains(e.relatedTarget)) setEditDropdownOpen(false);
  }

  // 캐러셀 상태: 1~6주차 (설명/메모용)
  const [currentWeek, setCurrentWeek] = useState(0); // 0~5
  const weekLabels = ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차'];
  // 예시 설명/메모 데이터 (실제 데이터로 교체)
  const weekNotes = [
    '1주차: 식습관 개선 교육',
    '2주차: 운동 습관 만들기',
    '3주차: 건강 체크',
    '4주차: 스트레스 관리',
    '5주차: 가족과 함께 실천',
    '6주차: 마무리 및 평가',
  ];
  function prevWeek() {
    setCurrentWeek((prev) => (prev > 0 ? prev - 1 : weekLabels.length - 1));
  }
  function nextWeek() {
    setCurrentWeek((prev) => (prev < weekLabels.length - 1 ? prev + 1 : 0));
  }

  // 진행중인 프로그램 목록 불러오기
  const fetchRunningProgramStarts = useCallback(async () => {
    try {
      const res = await fetch('/api/programs/program-starts');
      if (!res.ok) throw new Error('진행중인 프로그램 조회 실패');
      const data = await res.json();
      setRunningProgramStarts(data.items || []);
    } catch {
      setRunningProgramStarts([]);
    }
  }, []);

  // 주차별 평균값 데이터 불러오기
  const fetchWeeklyAverageData = useCallback(async (programId: number, trendType: string = 'BMI') => {
    if (!programId) return;
    
    try {
      setLoadingWeeklyData(true);
      const res = await fetch(`/api/programs/program-starts/${programId}/weekly-averages?trendType=${trendType}`);
      if (!res.ok) throw new Error('주차별 평균값 조회 실패');
      const data = await res.json();
      setWeeklyAverageData(data);
    } catch (error) {
      console.error('주차별 평균값 조회 오류:', error);
      setWeeklyAverageData(null);
    } finally {
      setLoadingWeeklyData(false);
    }
  }, []);

  // 프로그램 로그 데이터 불러오기
  const fetchProgramLogs = useCallback(async (programStartId?: number) => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams();
      if (programStartId) {
        params.append('programStartId', programStartId.toString());
      }
      params.append('limit', '10'); // 최근 10개 로그만 표시
      
      const res = await fetch(`/api/programs/program-logs?${params}`);
      if (!res.ok) throw new Error('프로그램 로그 조회 실패');
      const data = await res.json();
      setProgramLogs(data.items || []);
    } catch (error) {
      console.error('프로그램 로그 조회 오류:', error);
      setProgramLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchRunningProgramStarts();
  }, [fetchRunningProgramStarts]);

  // 프로그램이 로드될 때 selectedTab 자동 조정
  useEffect(() => {
    if (recentPrograms.length > 0 && selectedTab >= recentPrograms.length) {
      setSelectedTab(0); // 선택된 탭이 유효하지 않으면 첫 번째 탭으로
    }
  }, [recentPrograms.length, selectedTab]);

  // 선택된 프로그램이 변경될 때 주차별 평균값 데이터와 로그 불러오기
  useEffect(() => {
    if (selectedProgram && selectedProgram.id) {
      const trendType = selectedProgram.program?.trendType || 'BMI';
      fetchWeeklyAverageData(selectedProgram.id, trendType);
      fetchProgramLogs(selectedProgram.id);
    } else {
      setWeeklyAverageData(null);
      setProgramLogs([]); // 로그 초기화
    }
  }, [selectedProgram?.id, selectedProgram?.program?.trendType, fetchWeeklyAverageData, fetchProgramLogs]);

  // 학년별/성별 카운트 유틸
  function getGradeLabel(schoolType: string, grade: number) {
    if (schoolType === 'elementary') return `초${grade}`;
    if (schoolType === 'middle') return `중${grade}`;
    if (schoolType === 'high') return `고${grade}`;
    return '';
  }
  const gradeOrder = [
    ...Array.from({ length: 6 }, (_, i) => `초${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `중${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `고${i + 1}`)
  ];

  // 선택된 프로그램의 학생 목록
  const selectedStudents: Student[] = useMemo(() => {
    return (selectedProgram?.students as Student[]) || [];
  }, [selectedProgram?.students]);

  // 학년별 인원수 집계
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gradeOrder.forEach(label => (counts[label] = 0));
    selectedStudents.forEach(s => {
      const label = getGradeLabel(s.schoolType, s.grade);
      if (label in counts) counts[label]++;
    });
    return counts;
  }, [selectedStudents]);

  // 성별 인원수 집계
  const { maleCount, femaleCount } = useMemo(() => {
    let male = 0, female = 0;
    selectedStudents.forEach(s => {
      if (s.gender === 'male') male++;
      else if (s.gender === 'female') female++;
    });
    return { maleCount: male, femaleCount: female };
  }, [selectedStudents]);

  // 학년별 그래프 y축 레이블 계산
  const maxGradeCount = Math.max(...Object.values(gradeCounts));
  const yStep = Math.max(1, Math.ceil(maxGradeCount / 5));
  const yTicks = Array.from({ length: 6 }, (_, i) => yStep * (5 - i));
  const yMax = yTicks[0] || 1; // y축 최상단 값
  const GRAPH_HEIGHT = 240; // px

  // 변화율 추이 그래프 제목 (trendType에 따라)
  function getTrendTypeLabel(trendType?: string) {
    if (trendType === 'WAIST') return '허리둘레 변화율 추이';
    return 'BMI 변화율 추이';
  }

  // 그래프 데이터 계산
  function getGraphData() {
    if (!weeklyAverageData || !weeklyAverageData.weeklyAverages.length) {
      return { values: [], maxValue: 0, minValue: 0 };
    }

    const values = weeklyAverageData.weeklyAverages
      .filter(w => w.averageValue !== null)
      .map(w => w.averageValue as number);

    if (values.length === 0) {
      return { values: [], maxValue: 0, minValue: 0 };
    }

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    // 최소 범위 보장 (값이 모두 같을 때)
    const adjustedMaxValue = range === 0 ? maxValue + 1 : maxValue + (range * 0.1);
    const adjustedMinValue = range === 0 ? Math.max(0, minValue - 1) : minValue - (range * 0.1);

    return {
      values: weeklyAverageData.weeklyAverages.map(w => w.averageValue),
      maxValue: adjustedMaxValue,
      minValue: adjustedMinValue
    };
  }

  // 로그 타입에 따른 아이콘과 색상 반환
  function getLogTypeInfo(logType: string) {
    switch (logType) {
      case 'START':
        return { icon: '▶️', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'END':
        return { icon: '⏹️', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'NOTICE':
        return { icon: '📢', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'REMINDER':
        return { icon: '💬', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'CHECKUP':
        return { icon: '🏥', color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'MEASUREMENT':
        return { icon: '📊', color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
      case 'STUDENT_ADD':
        return { icon: '➕', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'STUDENT_REMOVE':
        return { icon: '➖', color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { icon: '📝', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(date: Date | string) {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F7F8FA]">
      {/* 상단 화면 수정 버튼 */}
      <div className="flex justify-end mt-4 mb-1 px-2 relative">
        {recentPrograms.length > 6 && (
          <button
            ref={editBtnRef}
            type="button"
            className="border rounded px-3 py-1 h-8 text-xs font-medium bg-white hover:bg-gray-50 shadow-sm"
            onClick={() => setShowAllPrograms(!showAllPrograms)}
          >
            {showAllPrograms ? '프로그램 접기' : '프로그램 전체 보기'}
          </button>
        )}
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
      <div className="grid grid-cols-6 gap-1.5 mb-2">
        {summaryTabs.map((tab, idx) => (
          <div
            key={idx}
            className={`rounded-lg px-3 py-2 text-center font-bold text-base shadow-sm border cursor-pointer whitespace-pre-line transition-all duration-200 ${
              tab.isProgram
                ? selectedTab === idx
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-[#F3F4F6] text-gray-900 border-gray-200 hover:bg-gray-100"
                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
            }`}
            onClick={() => {
              if (tab.isProgram && tab.programIndex !== undefined) {
                setSelectedTab(tab.programIndex);
              } else {
                setIsStartModalOpen(true);
              }
            }}
          >
            <div className="truncate" title={tab.label}>{tab.label}</div>
            <div className={`text-xl mt-0.5 ${!tab.isProgram ? 'text-green-600 font-bold' : ''}`}>{tab.value}</div>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-7"
                onClick={() => setIsParticipantModalOpen(true)}
              >
                대상자 상세보기
              </Button>
            </div>
            {/* 성별 그래프 + 학년별 막대그래프를 flex로 배치 */}
            <div className="flex items-end flex-1">
              {/* 학년별 막대그래프 */}
              <div className="flex flex-row items-end h-40 flex-1">
                {/* y축 레이블 */}
                <div className="flex flex-col justify-between h-full mr-2 py-2">
                  {yTicks.map((tick, i) => (
                    <div key={tick} style={{ height: i === 0 ? 0 : '48px' }} className="flex items-end">
                      <span className="text-xs text-gray-400" style={{ display: 'inline-block', minWidth: 18 }}>{tick}</span>
                    </div>
                  ))}
                </div>
                {/* 막대그래프 */}
                <div className="flex items-end gap-4 h-full flex-1" style={{ height: `${GRAPH_HEIGHT}px` }}>
                  {gradeOrder.map(label => (
                    <div key={label} className="flex flex-col items-center w-6">
                      <div
                        className="bg-gray-400 rounded-t-md transition-all duration-300"
                        style={{ height: `${(gradeCounts[label] / yMax) * GRAPH_HEIGHT}px`, width: '100%' }}
                      />
                      <div className="text-xs text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 성별 그래프 */}
              <div className="flex flex-col items-center w-20 ml-2">
                <div className="font-semibold text-xs mb-2">성별</div>
                <div className="flex items-end gap-4 h-32">
                  {[{ label: '남자', value: maleCount }, { label: '여자', value: femaleCount }].map(item => (
                    <div key={item.label} className="flex flex-col items-center w-8">
                      <div className="bg-gray-400 rounded-t-md" style={{ height: `${item.value * 12}px`, width: '100%' }} />
                      <div className="text-xs text-gray-500 mt-1">{item.label}</div>
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
            {/* 캐러셀+파이차트 flex row */}
            <div className="flex flex-row items-center gap-6">
              {/* 캐러셀: 주차별 설명/메모 */}
              <div className="flex flex-col items-center min-w-[220px] max-w-[220px] h-24 justify-center">
                <div className="flex items-center gap-2 mb-2 w-full justify-center">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={prevWeek}
                    aria-label="이전 주차"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex flex-col items-center w-full">
                    <div className="mb-1 font-bold text-lg break-keep">{weekLabels[currentWeek]}</div>
                    <div className="text-xs text-gray-500 text-center break-words w-full">{weekNotes[currentWeek]}</div>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={nextWeek}
                    aria-label="다음 주차"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              {/* 파이 차트 6개는 항상 한 번에 보임 (기존 코드 유지) */}
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
          {/* 변화율 추이 그래프 (BMI 등) */}
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">{getTrendTypeLabel(selectedProgram?.program?.trendType)}</h3>
              <span className="text-xs text-gray-500">
                {weeklyAverageData ? `${weeklyAverageData.totalWeeks}주간 평균 ${getTrendTypeLabel(selectedProgram?.program?.trendType).replace('변화율 추이', '')}` : '데이터 로딩 중...'}
              </span>
            </div>
            {/* 실제 데이터 기반 그래프 */}
            {loadingWeeklyData ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (() => {
              const graphData = getGraphData();
              const { values, maxValue, minValue } = graphData;
              
              if (!values.length || values.every(v => v === null)) {
                return (
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    <div className="text-center">
                      <div className="text-sm font-medium">측정 데이터가 없습니다</div>
                      <div className="text-xs mt-1">프로그램 참여자들의 측정 데이터를 확인해주세요</div>
                    </div>
                  </div>
                );
              }

              const width = 400;
              const height = 160;
              const leftPad = 40;
              const bottomPad = 30;
              const topPad = 20;
              const graphW = width - leftPad - 20;
              const graphH = height - topPad - bottomPad;
              
              // 점 좌표 계산
              const points = values.map((v, i) => {
                if (v === null) return null;
                const x = leftPad + (graphW / (values.length - 1)) * i;
                const y = topPad + graphH - ((v - minValue) / (maxValue - minValue)) * graphH;
                return [x, y, v];
              }).filter(p => p !== null) as [number, number, number][];

              if (points.length === 0) {
                return (
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    <div className="text-center">
                      <div className="text-sm font-medium">유효한 데이터가 없습니다</div>
                    </div>
                  </div>
                );
              }

              // polyline points string
              const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');
              
              return (
                <svg width={width} height={height} className="w-full h-40">
                  {/* x축 */}
                  <line x1={leftPad} y1={topPad + graphH} x2={leftPad + graphW} y2={topPad + graphH} stroke="#e5e7eb" strokeWidth="2" />
                  
                  {/* x축 레이블 */}
                  {values.map((_, i) => (
                    <text 
                      key={i} 
                      x={leftPad + (graphW / (values.length - 1)) * i} 
                      y={topPad + graphH + 18} 
                      fontSize="11" 
                      textAnchor="middle" 
                      fill="#888"
                    >
                      {i + 1}주차
                    </text>
                  ))}
                  
                  {/* 선그래프 */}
                  {points.length > 1 && (
                    <polyline points={polyline} fill="none" stroke="#38BDF8" strokeWidth="3" />
                  )}
                  
                  {/* 점 */}
                  {points.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="5" fill="#38BDF8" stroke="#fff" strokeWidth="2" />
                  ))}
                  
                  {/* 값 텍스트 */}
                  {points.map(([x, y, value], i) => (
                    <text key={i} x={x} y={y - 10} fontSize="12" textAnchor="middle" fill="#38BDF8">
                      {value}
                    </text>
                  ))}
                </svg>
              );
            })()}
          </div>

          {/* 프로그램 운영 이력 */}
          <div className="bg-white rounded-lg shadow p-3 h-full flex-1 flex flex-col">
            <div className="font-semibold text-base mb-2">프로그램 운영 이력</div>
            {loadingLogs ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : programLogs.length > 0 ? (
              <ul className="space-y-2 overflow-y-auto flex-1">
                {programLogs.map((log) => {
                  const logInfo = getLogTypeInfo(log.logType);
                  return (
                    <li key={log.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg">{logInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{log.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatDate(log.createdAt)}</div>
                          {log.studentName && (
                            <div className="text-xs text-blue-600 mt-1">학생: {log.studentName}</div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7 ml-2 flex-shrink-0">상세보기</Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500">
                <div className="text-center">
                  <div className="text-sm font-medium">운영 이력이 없습니다</div>
                  <div className="text-xs mt-1">프로그램을 시작하면 이력이 표시됩니다</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측 하단 메시지 보내기/시작 버튼 */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-row gap-3">
        <Button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-base font-bold" onClick={() => setIsProgramModalOpen(true)}>프로그램 추가</Button>
        <Button className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-base font-bold" onClick={() => setIsStartModalOpen(true)}>프로그램 시작</Button>
        <Button className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg text-base font-bold" onClick={() => setIsEndModalOpen(true)}>프로그램 종료</Button>
      </div>

      <ProgramAddModal isOpen={isProgramModalOpen} onClose={() => setIsProgramModalOpen(false)} onSubmit={async (data) => { alert('임시 등록: ' + JSON.stringify(data)); setIsProgramModalOpen(false); }} editingId={null} />
      <ProgramStartModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSubmit={async ({ programId, programName, studentIds, startDate, endDate }) => {
          try {
            const res = await fetch('/api/programs/program-starts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ programId, programName, studentIds, startDate, endDate })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || '시작 실패');
            }
            alert('프로그램이 시작되었습니다.');
            await fetchRunningProgramStarts();
            setIsStartModalOpen(false);
          } catch (e: unknown) {
            if (e instanceof Error) {
              alert(e.message);
            } else {
              alert('시작 중 오류 발생');
            }
          }
        }}
      />
      <ProgramEndModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onSubmit={async ({ programStartId, reason }) => {
          try {
            const res = await fetch(`/api/programs/program-starts/${programStartId}/end`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || '종료 실패');
            }
            alert('프로그램이 종료되었습니다.');
            await fetchRunningProgramStarts();
            setIsEndModalOpen(false);
          } catch (e: unknown) {
            if (e instanceof Error) {
              alert(e.message);
            } else {
              alert('종료 중 오류 발생');
            }
          }
        }}
        programStarts={runningProgramStarts.filter(p => p.isStarted !== false)}
      />
      
      {/* 참여자 상세보기 모달 */}
      <ParticipantDetailModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        programName={selectedProgram?.programName || selectedProgram?.program?.name || '프로그램'}
        participants={selectedStudents}
      />
    </div>
  );
} 