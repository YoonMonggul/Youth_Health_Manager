"use client"

import { useState, useEffect } from "react";
import { Layout } from '@/components/Layout';
import { Student } from "@/models/Student";
import { Growth } from "@/models/Growth";
// import { Health } from "@/models/health"; // 사용하지 않는 타입 제거
import { Search, Camera, Menu } from "lucide-react";

// 클래스 타입 정의
type ClassInfo = {
  grade: number;
  classNumber: number;
  count: number;
};

export default function HealthIndividual() {
  // 학생 목록 상태
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeClass, setActiveClass] = useState<{ grade: number; classNumber: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [classesInfo, setClassesInfo] = useState<ClassInfo[]>([]);
  
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
        
        // 클래스별 학생 수 계산
        const classesMap = new Map<string, number>();
        studentList.forEach((student: Student) => {
          const key = `${student.grade}-${student.classNumber}`;
          classesMap.set(key, (classesMap.get(key) || 0) + 1);
        });
        
        // 클래스 정보 객체 배열로 변환
        const classesInfoArray: ClassInfo[] = Array.from(classesMap.entries())
          .map(([key, count]) => {
            const [grade, classNumber] = key.split('-').map(Number);
            return { grade, classNumber, count };
          })
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        
        setClassesInfo(classesInfoArray);
        
        // 첫 번째 학생 선택 (있다면)
        if (studentList.length > 0) {
          const firstStudent = studentList[0];
          setSelectedStudent(firstStudent);
          setActiveClass({
            grade: firstStudent.grade,
            classNumber: firstStudent.classNumber
          });
          
          // 선택된 학생의 건강검진 데이터와 성장 데이터 가져오기
          await fetchHealthData(firstStudent.id);
          await fetchGrowthData(firstStudent.id);
        }
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

  // 검색 기능
  const filteredStudents = filteredStudentsByClass.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 클래스 변경 핸들러
  const handleClassChange = (grade: number, classNumber: number) => {
    setActiveClass({ grade, classNumber });
    // 해당 클래스의 첫 번째 학생을 선택
    const firstStudentInClass = students.find(
      student => student.grade === grade && student.classNumber === classNumber
    );
    if (firstStudentInClass) {
      setSelectedStudent(firstStudentInClass);
      fetchHealthData(firstStudentInClass.id);
      fetchGrowthData(firstStudentInClass.id);
    }
  };

  // 학생 선택 핸들러
  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setActiveClass({ grade: student.grade, classNumber: student.classNumber });
    
    // 선택한 학생의 건강검진 데이터와 성장 데이터 가져오기
    await fetchHealthData(student.id);
    await fetchGrowthData(student.id);
  };

  // 현재 선택된 클래스의 학생 수
  const getCurrentClassCount = () => {
    if (!activeClass) return students.length;
    
    const classInfo = classesInfo.find(
      c => c.grade === activeClass.grade && c.classNumber === activeClass.classNumber
    );
    
    return classInfo?.count || filteredStudentsByClass.length;
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
                    {activeClass 
                      ? `${activeClass.grade}학년 ${activeClass.classNumber}반 (${getCurrentClassCount()})`
                      : `전체 학생 (${students.length})`}
                  </span>
                  <span>▼</span>
                  
                  {/* 클래스 선택 드롭다운 */}
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                    <div 
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => setActiveClass(null)}
                    >
                      전체 학생 ({students.length})
                    </div>
                    {classesInfo.map((cls) => (
                      <div 
                        key={`${cls.grade}-${cls.classNumber}`}
                        className={`py-2 px-4 hover:bg-gray-100 cursor-pointer text-sm ${
                          activeClass?.grade === cls.grade && activeClass?.classNumber === cls.classNumber ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleClassChange(cls.grade, cls.classNumber)}
                      >
                        {cls.grade}학년 {cls.classNumber}반 ({cls.count})
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
                <div className="mb-4 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">주요건강 항목</h3>
                    <button className="text-xs text-white bg-gray-700 px-2 py-1 rounded">상세</button>
                  </div>
                  
                  <div className="grid grid-cols-12 p-4">
                    {loadingGrowth ? (
                      <div className="col-span-12 flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : latestGrowth ? (
                      <>
                        {/* 키 정보 */}
                        <div className="col-span-6 flex flex-col items-center justify-center px-4">
                          <div className="mb-2 w-full">
                            {/* 키 정보 타이틀과 설명 제거 */}
                            </div>
                            
                          {/* 키 그래프 */}
                          <div className="w-full mt-2">
                            <svg width="100%" height="340" viewBox="0 0 400 400" preserveAspectRatio="none">
                              <g transform="translate(40, 20)">
                                {/* 키 데이터 박스 */}
                                <rect x="5" y="10" width="120" height="60" rx="4" fill="white" stroke="#e5e7eb" />
                                <text x="15" y="30" fontSize="14" fontWeight="bold" fill="#000000">
                                  키 {Number(latestGrowth.height).toFixed(1)}cm
                                </text>
                                <text x="15" y="45" fontSize="11" fill="#666666">
                                  또래평균 {selectedStudent.gender === 'female' 
                                    ? femaleHeightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.height.toFixed(1)
                                    : maleHeightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.height.toFixed(1)}cm
                                </text>
                                <text x="15" y="55" fontSize="10" fill="#999999">
                                  측정일 {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </text>
                                
                                {/* Y축 선 */}
                                <line x1="0" y1="0" x2="0" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                                {/* X축 선 */}
                                <line x1="0" y1="340" x2="320" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                                
                                {/* 날짜 x축 레이블 - 만 나이로 변경 */}
                                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age, i) => (
                                  <text 
                                    key={i} 
                                    x={i * 26.6} 
                                    y="360" 
                                    fontSize="11" 
                                    textAnchor="middle"
                                    fill="#666"
                                  >
                                    {age}
                                  </text>
                                ))}
                                
                                {/* 그래프 구역 영역 - 참고 영역 */}
                                <path
                                  d="M0,330 C40,320 80,310 120,290 S200,260 240,220 S280,180 320,150"
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
                                          // 100cm를 y=340, 180cm를 y=0으로 스케일링
                                          const y = 340 - ((point.height - 100) / 80) * 340;
                                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                        }).join(' ')
                                      : maleHeightData.map((point, i) => {
                                          const x = ((point.age - 7) / 11) * 320;
                                          const y = 340 - ((point.height - 100) / 80) * 340;
                                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                        }).join(' ')
                                    }
                                    fill="none"
                                    stroke={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                    strokeWidth="2.5"
                                  />
                                )}
                                
                                {/* 키 그래프에서 현재 사용자 데이터 포인트 */}
                                {selectedStudent && latestGrowth && (
                                  <>
                                    {/* 현재 나이와 키에 해당하는 데이터 포인트 */}
                                    <circle
                                      cx={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      cy={340 - ((Number(latestGrowth.height) - 100) / 80) * 340}
                                      r="6"
                                      fill={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                    
                                    {/* 현재 위치 표시선 */}
                                    <line
                                      x1={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y1={340 - ((Number(latestGrowth.height) - 100) / 80) * 340}
                                      x2={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y2="340"
                                      stroke={selectedStudent.gender === 'female' ? "#ec4899" : "#3b82f6"}
                                      strokeWidth="1.5"
                                      strokeDasharray="4,4"
                                    />
                                  </>
                                )}
                                
                                {/* Y축 값 레이블 */}
                                <text x="-10" y="0" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">180</text>
                                <text x="-10" y="85" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">160</text>
                                <text x="-10" y="170" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">140</text>
                                <text x="-10" y="255" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">120</text>
                                <text x="-10" y="340" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">100</text>
                              </g>
                            </svg>
                              </div>
                              </div>
                        
                        {/* 체중 정보 */}
                        <div className="col-span-6 flex flex-col items-center justify-center px-4">
                          <div className="mb-2 w-full">
                            {/* 체중 정보 타이틀과 설명 제거 */}
                            </div>
                            
                          {/* 체중 그래프 */}
                          <div className="w-full mt-2">
                            <svg width="100%" height="340" viewBox="0 0 400 400" preserveAspectRatio="none">
                              <g transform="translate(40, 20)">
                                {/* 체중 데이터 박스 */}
                                <rect x="5" y="10" width="120" height="60" rx="4" fill="white" stroke="#e5e7eb" />
                                <text x="15" y="30" fontSize="14" fontWeight="bold" fill="#000000">
                                  체중 {Number(latestGrowth.weight).toFixed(1)}kg
                                </text>
                                <text x="15" y="45" fontSize="11" fill="#666666">
                                  또래평균 {weightData.find(d => d.age === calculateAge(selectedStudent.birthDate))?.weight.toFixed(1)}kg
                                </text>
                                <text x="15" y="55" fontSize="10" fill="#999999">
                                  측정일 {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                </text>
                                
                                {/* Y축 선 */}
                                <line x1="0" y1="0" x2="0" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                                {/* X축 선 */}
                                <line x1="0" y1="340" x2="320" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                                
                                {/* 날짜 x축 레이블 - 만 나이로 변경 */}
                                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((age, i) => (
                                  <text 
                                    key={i} 
                                    x={i * 26.6} 
                                    y="360" 
                                    fontSize="11" 
                                    textAnchor="middle"
                                    fill="#666"
                                  >
                                    {age}
                                  </text>
                                ))}
                                
                                {/* 그래프 구역 영역 - 3%~97% 구간 */}
                                <path
                                  d="M0,330 C40,320 80,310 120,290 S200,260 240,220 S280,180 320,150"
                                  fill="#f0f9ff"
                                  opacity="0.5"
                                />
                                
                                {/* 체중 기본 데이터 경로 추가 */}
                                <path
                                  d={weightData.map((point, i) => {
                                    // 7세를 x=0, 18세를 x=320으로 스케일링
                                    const x = ((point.age - 7) / 11) * 320;
                                    // 20kg를 y=340, 70kg를 y=0으로 스케일링
                                    const y = 340 - ((point.weight - 20) / 50) * 340;
                                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#c084fc"
                                  strokeWidth="2.5"
                                />
                                
                                {/* 체중 그래프에서 현재 사용자 데이터 포인트 */}
                                {selectedStudent && latestGrowth && (
                                  <>
                                    {/* 현재 나이와 체중에 해당하는 데이터 포인트 */}
                                    <circle
                                      cx={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      cy={340 - ((Number(latestGrowth.weight) - 20) / 50) * 340}
                                      r="6"
                                      fill="#c084fc"
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                    
                                    {/* 체중 값 텍스트 표시 */}
                                    <text
                                      x={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y={340 - ((Number(latestGrowth.weight) - 20) / 50) * 340 - 12}
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
                                      y1={340 - ((Number(latestGrowth.weight) - 20) / 50) * 340}
                                      x2={((calculateAge(selectedStudent.birthDate) - 7) / 11) * 320}
                                      y2="340"
                                      stroke="#c084fc"
                                      strokeWidth="1.5"
                                      strokeDasharray="4,4"
                                    />
                                  </>
                                )}
                                
                                {/* Y축 값 레이블 */}
                                <text x="-10" y="0" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">70</text>
                                <text x="-10" y="85" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">60</text>
                                <text x="-10" y="170" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">50</text>
                                <text x="-10" y="255" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">40</text>
                                <text x="-10" y="340" fontSize="11" textAnchor="end" dominantBaseline="middle" fill="#666">30</text>
                              </g>
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-12 py-8 text-center text-gray-500">
                        데이터가 없습니다.
                      </div>
                              )}
                            </div>
                          </div>
                          
                {/* BMI와 허리둘레 판단 박스 */}
                {selectedStudent && latestGrowth && (
                  <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                    {/* BMI 판단 박스 */}
                    <div className="bg-white rounded-md border border-gray-200 p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col justify-center border-r border-dashed border-gray-300 pr-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">비만도</div>
                          <div className="text-sm font-semibold text-gray-600">
                            BMI {Number(latestGrowth.bmi).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            측정일 {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </div>
                        </div>
                        <div className="col-span-2 space-y-3 pl-4">
                          <div className="flex justify-end">
                            <span className="text-lg font-extrabold text-blue-600">
                              {Number(latestGrowth.bmi).toFixed(1)}
                                </span>
                              </div>
                          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full bg-blue-500 transition-all duration-300"
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
                            <span>저체중</span>
                            <span>정상</span>
                            <span>과체중</span>
                            <span>비만</span>
                              </div>
                            </div>
                            </div>
                          </div>
                          
                    {/* 허리둘레 판단 박스 */}
                    <div className="bg-white rounded-md border border-gray-200 p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col justify-center border-r border-dashed border-gray-300 pr-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">복부비만</div>
                          <div className="text-sm font-semibold text-gray-600">
                            {latestGrowth.waistCircumference ? Number(latestGrowth.waistCircumference).toFixed(1) : '-'} cm
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            측정일 {new Date(latestGrowth.measurementDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </div>
                      </div>
                        <div className="col-span-2 space-y-3 pl-4">
                          <div className="flex justify-end">
                            <span className="text-lg font-extrabold text-purple-600">
                              {latestGrowth.waistCircumference && latestGrowth.height ? 
                                (Number(latestGrowth.waistCircumference) / Number(latestGrowth.height)).toFixed(2) : '-'}
                            </span>
                  </div>
                          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full bg-purple-500 transition-all duration-300"
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
                            <span>양호</span>
                            <span>의심</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 성장기록 */}
                <div className="bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">성장기록</h3>
                    <div className="flex space-x-2">
                      <button className="p-1.5 rounded-full bg-black text-white">
                        <Menu className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-full bg-gray-200">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 19h16M4 5h16M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-full bg-gray-200">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 21H3V3h18v18zM3 9h18M9 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {loadingGrowth ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : growthData.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 p-4">
                      {/* 키 측정 그래프 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">키</h4>
                        <div className="bg-gray-50 h-48 rounded p-1">
                          <svg width="100%" height="100%" viewBox="0 0 400 360" preserveAspectRatio="none">
                            {/* Y축 선 */}
                            <line x1="40" y1="20" x2="40" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="40" y1="340" x2="360" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="4,4">
                              <line x1="40" y1="90" x2="360" y2="90" />
                              <line x1="40" y1="150" x2="360" y2="150" />
                              <line x1="40" y1="210" x2="360" y2="210" />
                              <line x1="40" y1="270" x2="360" y2="270" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                              {growthData.map((data, index) => {
                              const x = 100 + (index * 60);
                              const y = 340 - ((Number(data.height) - 100) / 80) * 320;
                                return (
                                <g key={data.id}>
                                  <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                                  {index < growthData.length - 1 && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={100 + ((index + 1) * 60)}
                                      y2={340 - ((Number(growthData[index + 1].height) - 100) / 80) * 320}
                                      stroke="#3b82f6" 
                                      strokeWidth="2"
                                    />
                                  )}
                                    <text 
                                      x={x} 
                                    y={y - 10}
                                    fontSize="12"
                                      textAnchor="middle" 
                                    fill="#3b82f6"
                                    >
                                    {Number(data.height).toFixed(1)}
                                    </text>
                                    <text 
                                      x={x} 
                                    y="355"
                                    fontSize="11"
                                      textAnchor="middle" 
                                    fill="#666"
                                    >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                    </text>
                                  </g>
                                );
                              })}

                            {/* Y축 값 레이블 */}
                            <text x="35" y="20" fontSize="11" textAnchor="end" fill="#666">180</text>
                            <text x="35" y="90" fontSize="11" textAnchor="end" fill="#666">160</text>
                            <text x="35" y="150" fontSize="11" textAnchor="end" fill="#666">140</text>
                            <text x="35" y="210" fontSize="11" textAnchor="end" fill="#666">120</text>
                            <text x="35" y="270" fontSize="11" textAnchor="end" fill="#666">100</text>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 체중 측정 그래프 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">체중</h4>
                        <div className="bg-gray-50 h-48 rounded p-1">
                          <svg width="100%" height="100%" viewBox="0 0 400 360" preserveAspectRatio="none">
                            {/* Y축 선 */}
                            <line x1="40" y1="20" x2="40" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="40" y1="340" x2="360" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="4,4">
                              <line x1="40" y1="90" x2="360" y2="90" />
                              <line x1="40" y1="150" x2="360" y2="150" />
                              <line x1="40" y1="210" x2="360" y2="210" />
                              <line x1="40" y1="270" x2="360" y2="270" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                              {growthData.map((data, index) => {
                              const x = 100 + (index * 60);
                              const y = 340 - ((Number(data.weight) - 20) / 50) * 320;
                                return (
                                <g key={data.id}>
                                  <circle cx={x} cy={y} r="4" fill="#ec4899" />
                                  {index < growthData.length - 1 && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={100 + ((index + 1) * 60)}
                                      y2={340 - ((Number(growthData[index + 1].weight) - 20) / 50) * 320}
                                      stroke="#ec4899"
                                      strokeWidth="2"
                                    />
                                  )}
                                    <text 
                                      x={x} 
                                    y={y - 10}
                                    fontSize="12"
                                      textAnchor="middle" 
                                    fill="#ec4899"
                                    >
                                    {Number(data.weight).toFixed(1)}
                                    </text>
                                    <text 
                                      x={x} 
                                    y="355"
                                    fontSize="11"
                                      textAnchor="middle" 
                                    fill="#666"
                                    >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                    </text>
                                  </g>
                                );
                              })}

                            {/* Y축 값 레이블 */}
                            <text x="35" y="20" fontSize="11" textAnchor="end" fill="#666">70</text>
                            <text x="35" y="90" fontSize="11" textAnchor="end" fill="#666">60</text>
                            <text x="35" y="150" fontSize="11" textAnchor="end" fill="#666">50</text>
                            <text x="35" y="210" fontSize="11" textAnchor="end" fill="#666">40</text>
                            <text x="35" y="270" fontSize="11" textAnchor="end" fill="#666">30</text>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 허리둘레 그래프 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">허리둘레</h4>
                        <div className="bg-gray-50 h-48 rounded p-1">
                          <svg width="100%" height="100%" viewBox="0 0 400 360" preserveAspectRatio="none">
                            {/* Y축 선 */}
                            <line x1="40" y1="20" x2="40" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            {/* X축 선 */}
                            <line x1="40" y1="340" x2="360" y2="340" stroke="#e5e7eb" strokeWidth="1.5" />
                            
                            {/* 격자 배경 */}
                            <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="4,4">
                              <line x1="40" y1="90" x2="360" y2="90" />
                              <line x1="40" y1="150" x2="360" y2="150" />
                              <line x1="40" y1="210" x2="360" y2="210" />
                              <line x1="40" y1="270" x2="360" y2="270" />
                            </g>

                            {/* 데이터 포인트와 선 */}
                            {growthData.map((data, index) => {
                              if (!data.waistCircumference) return null;
                              const x = 100 + (index * 60);
                              const y = 340 - ((Number(data.waistCircumference) - 50) / 50) * 320;
                              return (
                                <g key={data.id}>
                                  <circle cx={x} cy={y} r="4" fill="#7c3aed" />
                                  {index < growthData.length - 1 && growthData[index + 1].waistCircumference && (
                                    <line
                                      x1={x}
                                      y1={y}
                                      x2={100 + ((index + 1) * 60)}
                                      y2={340 - ((Number(growthData[index + 1].waistCircumference) - 50) / 50) * 320}
                                      stroke="#7c3aed"
                                  strokeWidth="2" 
                                />
                              )}
                                      <text 
                                        x={x} 
                                    y={y - 10}
                                    fontSize="12"
                                        textAnchor="middle" 
                                    fill="#7c3aed"
                                      >
                                    {Number(data.waistCircumference).toFixed(1)}
                                      </text>
                                      <text 
                                        x={x} 
                                    y="355"
                                    fontSize="11"
                                        textAnchor="middle" 
                                    fill="#666"
                                      >
                                    {new Date(data.measurementDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                      </text>
                                    </g>
                                  );
                                })}
                              
                            {/* Y축 값 레이블 */}
                            <text x="35" y="20" fontSize="11" textAnchor="end" fill="#666">100</text>
                            <text x="35" y="90" fontSize="11" textAnchor="end" fill="#666">90</text>
                            <text x="35" y="150" fontSize="11" textAnchor="end" fill="#666">80</text>
                            <text x="35" y="210" fontSize="11" textAnchor="end" fill="#666">70</text>
                            <text x="35" y="270" fontSize="11" textAnchor="end" fill="#666">60</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>이 학생에 대한 성장 기록이 없습니다.</p>
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