"use client"

import { useState, useEffect, useMemo } from "react";
import { Layout } from '@/components/Layout';
import { Student } from "@/models/Student";
import { Growth } from "@/models/Growth";
// import { Health } from "@/models/health"; // 사용하지 않는 타입 제거
import { Search, Camera } from "lucide-react";

export default function HealthIndividual() {
  // 학생 목록 상태
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeClass, setActiveClass] = useState<{ grade: number; classNumber: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // 건강 구분 필터링 상태 추가
  const [activeHealthFilter, setActiveHealthFilter] = useState<string | null>(null);

  // 성장 데이터 상태
  const [growthData, setGrowthData] = useState<Growth[]>([]);
  const [loadingGrowth, setLoadingGrowth] = useState<boolean>(false);

  // 성별에 따른 평균 키 데이터 (x: 나이, y: 키)
  const femaleHeightData = [
    { age: 7, height: 121 },
    { age: 8, height: 126.9 },
    { age: 9, height: 133.2 },
    { age: 10, height: 139.7 },
    { age: 11, height: 146 },
    { age: 12, height: 153 },
    { age: 13, height: 157.5 },
    { age: 14, height: 159.5 },
    { age: 15, height: 160.9 },
    { age: 16, height: 161.3 },
    { age: 17, height: 161.4 },
    { age: 18, height: 161.9 }
  ];

  // 남성 평균 키 데이터 (추정치)
  const maleHeightData = [
    { age: 7, height: 122.5 },
    { age: 8, height: 128.7 },
    { age: 9, height: 134.3 },
    { age: 10, height: 140.5 },
    { age: 11, height: 146.4 },
    { age: 12, height: 153.2 },
    { age: 13, height: 161.5 },
    { age: 14, height: 167.2 },
    { age: 15, height: 171.0 },
    { age: 16, height: 172.9 },
    { age: 17, height: 173.8 },
    { age: 18, height: 174.6 }
  ];

  // 체중 기본 데이터
  const weightData = [
    { age: 7, weight: 25.3 },
    { age: 8, weight: 29.3 },
    { age: 9, weight: 33.8 },
    { age: 10, weight: 39.2 },
    { age: 11, weight: 45.1 },
    { age: 12, weight: 50.5 },
    { age: 13, weight: 56.1 },
    { age: 14, weight: 62.3 },
    { age: 15, weight: 66.1 },
    { age: 16, weight: 70.0 },
    { age: 17, weight: 72.0 },
    { age: 18, weight: 73.3 }
  ];

  // API에서 학생 목록 가져오기
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/students');
        if (!response.ok) {
          throw new Error('학생 데이터를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const studentList = data.students || [];
        setStudents(studentList);
        
        // 전체 학생 탭이 기본 (activeClass를 null로)
        setActiveClass(null);
        setSelectedStudent(null);
        setGrowthData([]);
      } catch (error) {
        console.error('학생 목록 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  // 학생의 건강검진 데이터 가져오기
  const fetchHealthData = async (studentId: number) => {
    try {
      setLoadingGrowth(true);
      const response = await fetch(`/api/health-checkups?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error('건강검진 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log(`학생 ID ${studentId}의 건강 데이터:`, data.items);
    } catch (error) {
      console.error('건강검진 데이터 로딩 오류:', error);
    } finally {
      setLoadingGrowth(false);
    }
  };

  // 학생의 성장 데이터 가져오기
  const fetchGrowthData = async (studentId: number) => {
    try {
      setLoadingGrowth(true);
      console.log(`성장 데이터 요청 URL: /api/growths?studentId=${studentId}&limit=5&sort=measurementDate,desc`);
      const response = await fetch(`/api/growths?studentId=${studentId}&limit=5&sort=measurementDate,desc`);
      if (!response.ok) {
        throw new Error('성장 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log(`학생 ID ${studentId}의 성장 데이터:`, data.items);
      // 날짜 오름차순으로 정렬하여 그래프에서 왼쪽에서 오른쪽으로 시간 순서 표현
      setGrowthData(data.items ? [...data.items].reverse() : []);
    } catch (error) {
      console.error('성장 데이터 로딩 오류:', error);
      setGrowthData([]);
    } finally {
      setLoadingGrowth(false);
    }
  };

  // const calculateBMI = (height: number, weight: number): number => {
  //   const heightInMeters = height / 100; // cm를 m로 변환
  //   return weight / (heightInMeters * heightInMeters);
  // };

  // 클래스별 학생 필터링
  const filteredStudentsByClass = activeClass 
    ? students.filter(student => 
        student.grade === activeClass.grade && 
        student.classNumber === activeClass.classNumber
      )
    : students;

  // 건강 구분별 학생 필터링 (임시로 모든 학생 표시)
  const filteredStudentsByHealth = useMemo(() => {
    if (!activeHealthFilter) return filteredStudentsByClass;
    
    // 임시 구현: 학생 ID를 기반으로 랜덤하게 필터링
    // 실제로는 각 학생의 성장 데이터를 미리 로드해야 함
    return filteredStudentsByClass.filter(student => {
      const studentId = student.id;
      const hash = studentId % 6; // 0-5 범위의 값
      
      switch (activeHealthFilter) {
        case '저체중':
          return hash === 0;
        case '정상체중':
          return hash === 1;
        case '과체중':
          return hash === 2;
        case '비만':
          return hash === 3;
        case '복부비만양호':
          return hash === 4;
        case '복부비만의심':
          return hash === 5;
        case '데이터미등록':
          return hash >= 6; // 실제로는 성장 데이터가 없는 학생들
        default:
          return true;
      }
    });
  }, [filteredStudentsByClass, activeHealthFilter]);

  // 각 건강 구분별 인원수 계산
  const healthCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '저체중': 0,
      '정상체중': 0,
      '과체중': 0,
      '비만': 0,
      '복부비만양호': 0,
      '복부비만의심': 0,
      '데이터미등록': 0
    };
    
    filteredStudentsByClass.forEach(student => {
      const studentId = student.id;
      const hash = studentId % 6;
      
      switch (hash) {
        case 0:
          counts['저체중']++;
          break;
        case 1:
          counts['정상체중']++;
          break;
        case 2:
          counts['과체중']++;
          break;
        case 3:
          counts['비만']++;
          break;
        case 4:
          counts['복부비만양호']++;
          break;
        case 5:
          counts['복부비만의심']++;
          break;
        default:
          counts['데이터미등록']++;
          break;
      }
    });
    
    return counts;
  }, [filteredStudentsByClass]);

  // 검색 기능
  const filteredStudents = filteredStudentsByHealth.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 클래스 변경 핸들러
  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setActiveClass({ grade: student.grade, classNumber: student.classNumber });
    
    // 선택한 학생의 건강검진 데이터와 성장 데이터 가져오기
    await fetchHealthData(student.id);
    await fetchGrowthData(student.id);
  };
  
  // 학생의 성장 데이터 중 가장 최근 데이터 가져오기
  const getLatestGrowthData = (): Growth | null => {
    if (growthData.length === 0) return null;
    
    // 측정일 기준으로 정렬
    const sorted = [...growthData].sort((a, b) => 
      new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
    );
    
    return sorted[0];
  };
  
  // 최신 성장 데이터
  const latestGrowth = getLatestGrowthData();

  // 생년월일 포맷팅 함수
  const formatBirthDate = (birthDate: Date): string => {
    if (!birthDate) return "0000. 00. 00";
    const date = new Date(birthDate);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  // 학생의 현재 나이 계산 (생년월일로부터)
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 디버깅용 콘솔 로그
  useEffect(() => {
    if (selectedStudent) {
      console.log('선택된 학생:', selectedStudent);
      console.log('학생 출생일:', selectedStudent.birthDate);
      
      if (selectedStudent.birthDate) {
        const age = calculateAge(selectedStudent.birthDate);
        console.log('계산된 나이:', age);
      } else {
        console.log('출생일 정보가 없습니다.');
      }
    }
    
    console.log('성장 데이터:', growthData);
    console.log('최신 성장 데이터:', latestGrowth);
  }, [selectedStudent, growthData, latestGrowth]);

  return (
    <Layout pageTitle="개별 건강관리">
      <div className="flex h-[calc(100vh-144px)] bg-white rounded-md shadow">
        {/* 왼쪽 학생 목록 패널 */}
        <div className="w-[200px] border-r border-gray-200 flex flex-col">
          <div className="relative p-3 border-b border-gray-200">
            <div className="absolute inset-y-0 left-3 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 py-2 text-sm border border-gray-300 rounded-md"
              placeholder="학생 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div>
                <div className="py-2 px-4 bg-gray-100 flex justify-between items-center cursor-pointer border-b border-gray-200 relative group">
                  <span className="text-sm font-medium">
                    {activeHealthFilter 
                      ? `${activeHealthFilter} (${filteredStudentsByHealth.length})`
                      : `전체 학생 (${students.length})`}
                  </span>
                  <span>▼</span>
                  
                  {/* 건강 구분 선택 드롭다운 */}
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                    <div 
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => setActiveHealthFilter(null)}
                    >
                      전체 학생 ({students.length})
                    </div>
                    {['저체중', '정상체중', '과체중', '비만', '복부비만양호', '복부비만의심', '데이터미등록'].map((category) => (
                      <div 
                        key={category}
                        className={`py-2 px-4 hover:bg-gray-100 cursor-pointer text-sm ${
                          activeHealthFilter === category ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setActiveHealthFilter(category)}
                      >
                        {category} ({healthCategoryCounts[category]})
                      </div>
                    ))}
                  </div>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <li 
                        key={student.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedStudent?.id === student.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="text-sm font-medium">{student.name}</div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500 text-center">
                      {searchTerm ? '검색 결과가 없습니다.' : '학생 목록이 비어 있습니다.'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* 오른쪽 상세 정보 패널 */}
        <div className="flex-1 flex flex-col">
          {selectedStudent ? (
            <div className="flex-1 overflow-y-auto">
              {/* 상단 탭 메뉴와 버튼들 모두 제거 */}
              {/* <div className="border-b border-gray-200">
                <div className="flex justify-between items-center px-4">
                  <div className="flex">
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-500">{formattedDate}</span>
                    <button className="px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
                      편집
                    </button>
                    <button className="px-4 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600">
                      내보기 ↓
                    </button>
                  </div>
                </div>
              </div> */}
              
              <div className="p-4">
              {/* 기본 정보 패널 */}
                <div className="mb-4 bg-white rounded-md border border-gray-200">
                  <div className="grid grid-cols-12 p-4">
                    {/* 프로필 이미지 */}
                    <div className="col-span-2">
                      <div className="w-24 h-32 bg-gray-200 rounded-md flex justify-center items-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* 기본 정보 */}
                    <div className="col-span-5 pl-4">
                      <div className="grid grid-cols-4 gap-y-4 text-sm">
                        <div className="font-medium">이름</div>
                        <div className="col-span-3">{selectedStudent.name}</div>
                        
                        <div className="font-medium">성별</div>
                        <div className="col-span-3">{selectedStudent.gender === 'male' ? '남' : '여'}</div>
                        
                        <div className="font-medium">생년월일</div>
                        <div className="col-span-3">{formatBirthDate(selectedStudent.birthDate)}</div>
                        
                        <div className="font-medium">주소</div>
                        <div className="col-span-3">{selectedStudent.address || '세종특별자치시 한누리대로 2154'}</div>

                        <div className="font-medium">진행 프로그램</div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            건강 프로그램
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 보호자 정보 */}
                    <div className="col-span-5 pl-4">
                      <div className="grid grid-cols-4 gap-y-4 text-sm">
                        <div className="font-medium">보호자</div>
                        <div className="col-span-3">{selectedStudent.parentName || '김아름'}</div>
                        
                        <div className="font-medium">관계</div>
                        <div className="col-span-3">
                          {selectedStudent.parentRelation === 'father' ? '아버지' : 
                           selectedStudent.parentRelation === 'mother' ? '어머니' : '모'}
                        </div>
                        
                        <div className="font-medium">연락처</div>
                        <div className="col-span-3">{selectedStudent.parentContact || '01012345678'}</div>
                        
                        <div className="font-medium">건강구분</div>
                        <div className="col-span-3">
                          {latestGrowth && (
                            <>
                              <span className={`${
                                selectedStudent.gender === 'male' ? (
                                  Number(latestGrowth.bmi) < 14.7 ? 'text-blue-500' :
                                  Number(latestGrowth.bmi) < 21.2 ? 'text-green-500' :
                                  Number(latestGrowth.bmi) < 23.1 ? 'text-yellow-500' :
                                  'text-red-500'
                                ) : (
                                  Number(latestGrowth.bmi) < 14.4 ? 'text-blue-500' :
                                  Number(latestGrowth.bmi) < 20.6 ? 'text-green-500' :
                                  Number(latestGrowth.bmi) < 22.4 ? 'text-yellow-500' :
                                  'text-red-500'
                                )
                              }`}>
                                {selectedStudent.gender === 'male' ? (
                                  Number(latestGrowth.bmi) < 14.7 ? '저체중' :
                                  Number(latestGrowth.bmi) < 21.2 ? '정상체중' :
                                  Number(latestGrowth.bmi) < 23.1 ? '과체중' :
                                  '비만'
                                ) : (
                                  Number(latestGrowth.bmi) < 14.4 ? '저체중' :
                                  Number(latestGrowth.bmi) < 20.6 ? '정상체중' :
                                  Number(latestGrowth.bmi) < 22.4 ? '과체중' :
                                  '비만'
                                )}
                              </span>
                              {latestGrowth.waistCircumference && latestGrowth.height && (
                                <>
                                  ,{" "}
                                  <span className={`${
                                    (Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)) < 0.43 
                                    ? 'text-green-500' 
                                    : 'text-red-500'
                                  }`}>
                                    복부비만{(Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)) < 0.43 ? '양호' : '의심'}
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주요 건강 항목 */}
                <div className="mb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">주요건강 항목</h3>
                  </div>
                  
                  <div className="grid grid-cols-12 p-6">
                    {loadingGrowth ? (
                      <div className="col-span-12 flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : latestGrowth ? (
                      <>
                        {/* 키 정보 */}
                        <div className="col-span-6 flex flex-col items-center justify-center px-6">
                          {/* 키 정보 상단 카드 */}
                          <div className="w-full mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-700 mb-0.5">
                                {Number(latestGrowth.height).toFixed(1)}cm
                              </div>
                              <div className="text-xs text-blue-600 font-medium mb-0.5">
                                키
                              </div>
                              <div className="text-xs text-gray-600">
                                또래평균 {selectedStudent.gender === 'female' 
                                  ? femaleHeightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.height.toFixed(1)
                                  : maleHeightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.height.toFixed(1)}cm
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                              </div>
                              </div>
                            </div>
                            
                          {/* 키 그래프 */}
                          <div className="w-full bg-white rounded-lg border border-gray-100 p-2">
                            <svg width="100%" height="320" viewBox="0 0 400 400" preserveAspectRatio="none">
                              <g transform="translate(40, 20)">
                                {/* Y축 선 */}
                                <line x1="0" y1="0" x2="0" y2="320" stroke="#e5e7eb" strokeWidth="1.5" />
                                {/* X축 선 */}
                                <line x1="0" y1="320" x2="320" y2="320" stroke="#e5e7eb" strokeWidth="1.5" />
                                
                                {/* 날짜 x축 레이블 - 만 나이로 변경 */}
                                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age, i) => (
                                  <text 
                                    key={i} 
                                    x={i * 26.6} 
                                    y="340" 
                                    fontSize="11" 
                                    textAnchor="middle"
                                    fill="#666"
                                  >
                                    {age}
                                  </text>
                                ))}
                                
                                {/* 그래프 구역 영역 - 참고 영역 */}
                                <path
                                  d="M0,310 C40,300 80,290 120,270 S200,240 240,200 S280,160 320,130"
                                  fill="#f0f9ff"
                                  opacity="0.3"
                                />
                                
                                {/* 성별에 따른 고정 성장 그래프 */}
                                {selectedStudent && (
                                  <path
                                    d={selectedStudent.gender === 'female' 
                                      ? femaleHeightData.map((point, i) => {
                                          // 7세를 x=0, 18세를 x=320으로 스케일링
                                          const x = ((point.age - 7) / 11) * 320;
                                          // 100cm를 y=320, 180cm를 y=0으로 스케일링
                                          const y = 320 - ((point.height - 100) / 80) * 320;
                                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                        }).join(' ')
                                      : maleHeightData.map((point, i) => {
                                          const x = ((point.age - 7) / 11) * 320;
                                          const y = 320 - ((point.height - 100) / 80) * 320;
                                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                        }).join(' ')
                                    }
                                    fill="none"
                                    stroke={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                )}
                                
                                {/* 키 그래프에서 현재 사용자 데이터 포인트 */}
                                {selectedStudent && latestGrowth && (
                                  <>
                                    {/* 현재 나이와 키에 해당하는 데이터 포인트 */}
                                    <circle
                                      cx={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      cy={320 - ((Number(latestGrowth.height) - 100) / 80) * 320}
                                      r="6"
                                      fill={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                    
                                    {/* 키 값 텍스트 표시 */}
                                    <text
                                      x={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y={320 - ((Number(latestGrowth.height) - 100) / 80) * 320 - 12}
                                      fontSize="12"
                                      fontWeight="bold"
                                      textAnchor="middle"
                                      fill={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                    >
                                      {Number(latestGrowth.height).toFixed(1)}
                                    </text>
                                    
                                    {/* 현재 위치 표시선 */}
                                    <line
                                      x1={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y1={320 - ((Number(latestGrowth.height) - 100) / 80) * 320}
                                      x2={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y2="320"
                                      stroke={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                      strokeWidth="1.5"
                                      strokeDasharray="4,4"
                                    />
                                  </>
                                )}
                                
                                {/* Y축 값 레이블 */}
                                <text x="-10" y="0" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">180</text>
                                <text x="-10" y="80" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">160</text>
                                <text x="-10" y="160" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">140</text>
                                <text x="-10" y="240" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">120</text>
                                <text x="-10" y="320" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">100</text>
                              </g>
                            </svg>
                              </div>
                              </div>
                        
                        {/* 체중 정보 */}
                        <div className="col-span-6 flex flex-col items-center justify-center px-6">
                          {/* 체중 정보 상단 카드 */}
                          <div className="w-full mb-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                            <div className="text-center">
                              <div className="text-xl font-bold text-purple-700 mb-0.5">
                                {Number(latestGrowth.weight).toFixed(1)}kg
                            </div>
                              <div className="text-xs text-purple-600 font-medium mb-0.5">
                                체중
                              </div>
                              <div className="text-xs text-gray-600">
                                또래평균 {weightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.weight.toFixed(1)}kg
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          {/* 체중 그래프 */}
                          <div className="w-full bg-white rounded-lg border border-gray-100 p-2">
                            {/* y축 0~100kg로 맞춤 */}
                            {(() => {
                              const minWeight = 0;
                              const maxWeight = 100;
                              const graphHeight = 320;
                              return (
                                <svg width="100%" height={graphHeight} viewBox="0 0 400 400" preserveAspectRatio="none">
                                  <g transform="translate(40, 20)">
                                    {/* Y축 선 */}
                                    <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#e5e7eb" strokeWidth="1.5" />
                                    {/* X축 선 */}
                                    <line x1="0" y1={graphHeight} x2="320" y2={graphHeight} stroke="#e5e7eb" strokeWidth="1.5" />
                                    
                                    {/* 날짜 x축 레이블 - 만 나이로 변경 */}
                                    {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age, i) => (
                                      <text 
                                        key={i} 
                                        x={i * 26.6} 
                                        y={graphHeight + 20} 
                                        fontSize="11" 
                                        textAnchor="middle"
                                        fill="#666"
                                      >
                                        {age}
                                      </text>
                                    ))}
                                    
                                    {/* 체중 기본 데이터 경로 수정 (0~100kg) */}
                                    <path
                                      d={weightData.map((point, i) => {
                                        const x = ((point.age - 7) / 11) * 320;
                                        const y = graphHeight - ((point.weight - minWeight) / (maxWeight - minWeight)) * graphHeight;
                                        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#c084fc"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    
                                    {/* 체중 그래프에서 현재 사용자 데이터 포인트 */}
                                    {selectedStudent && latestGrowth && (
                                      <>
                                        {/* 현재 나이와 체중에 해당하는 데이터 포인트 */}
                                        <circle
                                          cx={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                          cy={graphHeight - ((Number(latestGrowth.weight) - minWeight) / (maxWeight - minWeight)) * graphHeight}
                                          r="6"
                                          fill="#c084fc"
                                          stroke="white"
                                          strokeWidth="2"
                                        />
                                        
                                        {/* 체중 값 텍스트 표시 */}
                                        <text
                                          x={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                          y={graphHeight - ((Number(latestGrowth.weight) - minWeight) / (maxWeight - minWeight)) * graphHeight - 12}
                                          fontSize="12"
                                          fontWeight="bold"
                                          textAnchor="middle"
                                          fill="#c084fc"
                                        >
                                          {Number(latestGrowth.weight).toFixed(1)}
                                        </text>
                                        
                                        {/* 현재 위치 표시선 */}
                                        <line
                                          x1={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                          y1={graphHeight - ((Number(latestGrowth.weight) - minWeight) / (maxWeight - minWeight)) * graphHeight}
                                          x2={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                          y2={graphHeight}
                                          stroke="#c084fc"
                                          strokeWidth="1.5"
                                          strokeDasharray="4,4"
                                        />
                                      </>
                                    )}
                                    
                                    {/* Y축 값 레이블 (0~100, 20 단위) */}
                                    <text x="-10" y="0" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">100</text>
                                    <text x="-10" y={graphHeight * 0.2} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">80</text>
                                    <text x="-10" y={graphHeight * 0.4} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">60</text>
                                    <text x="-10" y={graphHeight * 0.6} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">40</text>
                                    <text x="-10" y={graphHeight * 0.8} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">20</text>
                                    <text x="-10" y={graphHeight} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">0</text>
                                  </g>
                                </svg>
                              );
                            })()}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-12 py-12 text-center text-gray-500">
                        <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
                        <div className="text-sm">성장 데이터를 등록해주세요</div>
                      </div>
                    )}
                          </div>
                        </div>
                        
                {/* BMI와 허리둘레 판단 박스 */}
                {selectedStudent && latestGrowth && (
                  <div className="grid grid-cols-2 gap-6 mt-6 mb-4">
                    {/* BMI 판단 박스 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-semibold text-blue-700">비만도</span>
                          </div>
                          <span className="text-xs text-blue-600">
                            {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </span>
                              </div>
                            </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-600">BMI</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Number(latestGrowth.bmi).toFixed(1)}
                          </div>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute h-full transition-all duration-300 rounded-full"
                                    style={{ 
                              width: `${Math.min(100, (Number(latestGrowth.bmi) / 30) * 100)}%`,
                              backgroundColor: 
                                selectedStudent.gender === 'male' ? (
                                  Number(latestGrowth.bmi) < 14.7 ? '#3b82f6' :
                                  Number(latestGrowth.bmi) < 21.2 ? '#22c55e' :
                                  Number(latestGrowth.bmi) < 23.1 ? '#eab308' :
                                  '#ef4444'
                                ) : (
                                  Number(latestGrowth.bmi) < 14.4 ? '#3b82f6' :
                                  Number(latestGrowth.bmi) < 20.6 ? '#22c55e' :
                                  Number(latestGrowth.bmi) < 22.4 ? '#eab308' :
                                  '#ef4444'
                                )
                            }}
                          />
                              </div>
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                          <span className="text-blue-600">저체중</span>
                          <span className="text-green-600">정상</span>
                          <span className="text-yellow-600">과체중</span>
                          <span className="text-red-600">비만</span>
                              </div>
                            </div>
                          </div>
                          
                    {/* 허리둘레 판단 박스 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-sm font-semibold text-purple-700">복부비만</span>
                          </div>
                          <span className="text-xs text-purple-600">
                            {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-600">허리둘레</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {latestGrowth.waistCircumference ? Number(latestGrowth.waistCircumference).toFixed(1) : '-'} cm
                          </div>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute h-full transition-all duration-300 rounded-full"
                            style={{ 
                              width: `${latestGrowth.waistCircumference && latestGrowth.height ? 
                                Math.min(100, ((Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)) / 0.43) * 100) : 0}%`,
                              backgroundColor: 
                                !latestGrowth.waistCircumference || !latestGrowth.height ? '#e5e7eb' :
                                (Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)) < 0.43 ? '#22c55e' : // 양호
                                '#ef4444' // 의심
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                          <span className="text-green-600">양호</span>
                          <span className="text-red-600">의심</span>
                        </div>
                        {latestGrowth.waistCircumference && latestGrowth.height && (
                          <div className="mt-2 text-xs text-gray-600 text-center">
                            비율: {(Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                  </div>
                )}
                
                {/* 성장기록 */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">성장기록</h3>
                  </div>
                  
                  {loadingGrowth ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : growthData.length > 0 ? (
                    <div className="grid grid-cols-3 gap-6 p-6">
                      {/* 키 측정 그래프 */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-blue-700">키 (cm)</h4>
                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            최근: {Number(growthData[growthData.length - 1]?.height || 0).toFixed(1)}cm
                          </div>
                        </div>
                        <div className="h-64">
                          <svg width="100%" height="100%" viewBox="0 0 500 480" preserveAspectRatio="none">
                            {/* 배경 그라데이션 */}
                            <defs>
                              <linearGradient id="heightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#dbeafe', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: '#dbeafe', stopOpacity: 0.1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* 배경 영역 */}
                            <rect x="50" y="30" width="420" height="420" fill="url(#heightGradient)" rx="4" />
                            
                            {/* Y축 선 */}
                            <line x1="50" y1="30" x2="50" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="50" y1="450" x2="470" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="2,2">
                              <line x1="50" y1="120" x2="470" y2="120" />
                              <line x1="50" y1="200" x2="470" y2="200" />
                              <line x1="50" y1="280" x2="470" y2="280" />
                              <line x1="50" y1="360" x2="470" y2="360" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                              {growthData.map((data, index) => {
                              const x = 120 + (index * 80);
                              const y = 450 - ((Number(data.height) - 100) / 80) * 420;
                                return (
                                <g key={data.id}>
                                  {/* 데이터 포인트 그림자 */}
                                  <circle cx={x + 1} cy={y + 1} r="8" fill="rgba(0,0,0,0.1)" />
                                  {/* 데이터 포인트 */}
                                  <circle cx={x} cy={y} r="7" fill="#3b82f6" stroke="white" strokeWidth="2" />
                                  
                                  {/* 연결선 */}
                                  {index < growthData.length - 1 && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={120 + ((index + 1) * 80)}
                                      y2={450 - ((Number(growthData[index + 1].height) - 100) / 80) * 420}
                                      stroke="#3b82f6" 
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                  )}
                                  
                                  {/* 값 표시 */}
                                    <text 
                                      x={x} 
                                    y={y - 20}
                                    fontSize="13"
                                    fontWeight="bold"
                                      textAnchor="middle" 
                                    fill="#3b82f6"
                                    >
                                    {Number(data.height).toFixed(1)}
                                    </text>
                                  
                                  {/* 날짜 표시 */}
                                    <text 
                                      x={x} 
                                    y="470"
                                    fontSize="11"
                                      textAnchor="middle" 
                                    fill="#6b7280"
                                    >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                    </text>
                                  </g>
                                );
                              })}

                            {/* Y축 값 레이블 */}
                            <text x="45" y="30" fontSize="11" textAnchor="end" fill="#6b7280">180</text>
                            <text x="45" y="120" fontSize="11" textAnchor="end" fill="#6b7280">160</text>
                            <text x="45" y="200" fontSize="11" textAnchor="end" fill="#6b7280">140</text>
                            <text x="45" y="280" fontSize="11" textAnchor="end" fill="#6b7280">120</text>
                            <text x="45" y="360" fontSize="11" textAnchor="end" fill="#6b7280">100</text>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 체중 측정 그래프 */}
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-pink-700">체중 (kg)</h4>
                          <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                            최근: {Number(growthData[growthData.length - 1]?.weight || 0).toFixed(1)}kg
                          </div>
                        </div>
                        <div className="h-64">
                          <svg width="100%" height="100%" viewBox="0 0 500 480" preserveAspectRatio="none">
                            {/* 배경 그라데이션 */}
                            <defs>
                              <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#fce7f3', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: '#fce7f3', stopOpacity: 0.1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* 배경 영역 */}
                            <rect x="50" y="30" width="420" height="420" fill="url(#weightGradient)" rx="4" />
                            
                            {/* Y축 선 */}
                            <line x1="50" y1="30" x2="50" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="50" y1="450" x2="470" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="2,2">
                              <line x1="50" y1="120" x2="470" y2="120" />
                              <line x1="50" y1="200" x2="470" y2="200" />
                              <line x1="50" y1="280" x2="470" y2="280" />
                              <line x1="50" y1="360" x2="470" y2="360" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                              {growthData.map((data, index) => {
                              const x = 120 + (index * 80);
                              const y = 450 - ((Number(data.weight) - 20) / 50) * 420;
                                return (
                                <g key={data.id}>
                                  {/* 데이터 포인트 그림자 */}
                                  <circle cx={x + 1} cy={y + 1} r="8" fill="rgba(0,0,0,0.1)" />
                                  {/* 데이터 포인트 */}
                                  <circle cx={x} cy={y} r="7" fill="#ec4899" stroke="white" strokeWidth="2" />
                                  
                                  {/* 연결선 */}
                                  {index < growthData.length - 1 && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={120 + ((index + 1) * 80)}
                                      y2={450 - ((Number(growthData[index + 1].weight) - 20) / 50) * 420}
                                      stroke="#ec4899"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                  )}
                                  
                                  {/* 값 표시 */}
                                    <text 
                                      x={x} 
                                    y={y - 20}
                                    fontSize="13"
                                    fontWeight="bold"
                                      textAnchor="middle" 
                                    fill="#ec4899"
                                    >
                                    {Number(data.weight).toFixed(1)}
                                    </text>
                                  
                                  {/* 날짜 표시 */}
                                    <text 
                                      x={x} 
                                    y="470"
                                    fontSize="11"
                                      textAnchor="middle" 
                                    fill="#6b7280"
                                    >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                    </text>
                                  </g>
                                );
                              })}

                            {/* Y축 값 레이블 */}
                            <text x="45" y="30" fontSize="11" textAnchor="end" fill="#6b7280">70</text>
                            <text x="45" y="120" fontSize="11" textAnchor="end" fill="#6b7280">60</text>
                            <text x="45" y="200" fontSize="11" textAnchor="end" fill="#6b7280">50</text>
                            <text x="45" y="280" fontSize="11" textAnchor="end" fill="#6b7280">40</text>
                            <text x="45" y="360" fontSize="11" textAnchor="end" fill="#6b7280">30</text>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 허리둘레 그래프 */}
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-purple-700">허리둘레 (cm)</h4>
                          <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            최근: {Number(growthData[growthData.length - 1]?.waistCircumference || 0).toFixed(1)}cm
                          </div>
                        </div>
                        <div className="h-64">
                          <svg width="100%" height="100%" viewBox="0 0 500 480" preserveAspectRatio="none">
                            {/* 배경 그라데이션 */}
                            <defs>
                              <linearGradient id="waistGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#f3e8ff', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: '#f3e8ff', stopOpacity: 0.1}} />
                              </linearGradient>
                            </defs>
                            
                            {/* 배경 영역 */}
                            <rect x="50" y="30" width="420" height="420" fill="url(#waistGradient)" rx="4" />
                            
                            {/* Y축 선 */}
                            <line x1="50" y1="30" x2="50" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="50" y1="450" x2="470" y2="450" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="2,2">
                              <line x1="50" y1="120" x2="470" y2="120" />
                              <line x1="50" y1="200" x2="470" y2="200" />
                              <line x1="50" y1="280" x2="470" y2="280" />
                              <line x1="50" y1="360" x2="470" y2="360" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                            {growthData.map((data, index) => {
                              if (!data.waistCircumference) return null;
                              const x = 120 + (index * 80);
                              const y = 450 - ((Number(data.waistCircumference) - 50) / 50) * 420;
                              return (
                                <g key={data.id}>
                                  {/* 데이터 포인트 그림자 */}
                                  <circle cx={x + 1} cy={y + 1} r="8" fill="rgba(0,0,0,0.1)" />
                                  {/* 데이터 포인트 */}
                                  <circle cx={x} cy={y} r="7" fill="#7c3aed" stroke="white" strokeWidth="2" />
                                  
                                  {/* 연결선 */}
                                  {index < growthData.length - 1 && growthData[index + 1].waistCircumference && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={120 + ((index + 1) * 80)}
                                      y2={450 - ((Number(growthData[index + 1].waistCircumference) - 50) / 50) * 420}
                                      stroke="#7c3aed"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                  )}
                                  
                                  {/* 값 표시 */}
                                      <text 
                                        x={x} 
                                    y={y - 20}
                                    fontSize="13"
                                    fontWeight="bold"
                                        textAnchor="middle" 
                                    fill="#7c3aed"
                                      >
                                    {Number(data.waistCircumference).toFixed(1)}
                                      </text>
                                  
                                  {/* 날짜 표시 */}
                                      <text 
                                        x={x} 
                                    y="470"
                                    fontSize="11"
                                        textAnchor="middle" 
                                    fill="#6b7280"
                                      >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                      </text>
                                    </g>
                                  );
                                })}
                              
                            {/* Y축 값 레이블 */}
                            <text x="45" y="30" fontSize="11" textAnchor="end" fill="#6b7280">100</text>
                            <text x="45" y="120" fontSize="11" textAnchor="end" fill="#6b7280">90</text>
                            <text x="45" y="200" fontSize="11" textAnchor="end" fill="#6b7280">80</text>
                            <text x="45" y="280" fontSize="11" textAnchor="end" fill="#6b7280">70</text>
                            <text x="45" y="360" fontSize="11" textAnchor="end" fill="#6b7280">60</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium mb-2">성장 기록이 없습니다</p>
                      <p className="text-sm text-gray-400">이 학생에 대한 성장 데이터를 등록해주세요.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-gray-500">
              학생을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
