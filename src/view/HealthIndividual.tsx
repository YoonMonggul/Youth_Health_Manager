"use client"

import { useState, useEffect } from "react";
import { Layout } from '@/components/Layout';
import { Student } from "@/models/Student";
import { Growth } from "@/models/Growth";
import { Health } from "@/models/health";
import { Search, Camera } from "lucide-react";

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

  // 건강검진 데이터 상태
  const [healthData, setHealthData] = useState<Health[]>([]);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(false);

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
      setLoadingHealth(true);
      const response = await fetch(`/api/health-checkups?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error('건강검진 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log(`학생 ID ${studentId}의 건강 데이터:`, data.items);
      setHealthData(data.items || []);
    } catch (error) {
      console.error('건강검진 데이터 로딩 오류:', error);
      setHealthData([]);
    } finally {
      setLoadingHealth(false);
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

  // BMI 계산 함수
  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100; // cm를 m로 변환
    return weight / (heightInMeters * heightInMeters);
  };

  // 최신 건강검진 데이터의 BMI 가져오기
  const getLatestBMI = (): number | null => {
    if (healthData.length === 0) return null;
    
    // 날짜 기준으로 정렬 (최신 날짜가 가장 앞에 오도록)
    const sortedHealthData = [...healthData].sort((a, b) => 
      new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime()
    );
    
    const latestData = sortedHealthData[0];
    console.log('최신 건강 데이터:', latestData);
    
    // DB에 저장된 BMI 값이 있으면 그 값을 사용
    if (latestData.bmi) {
      console.log('DB에 저장된 BMI 값 사용:', latestData.bmi);
      return Number(latestData.bmi);
    }
    
    // DB에 BMI 값이 없으면 키와 몸무게로 계산 (둘 중 하나라도 없으면 null 반환)
    if (!latestData.height || !latestData.weight) return null;
    
    const calculatedBMI = calculateBMI(Number(latestData.height), Number(latestData.weight));
    console.log('계산된 BMI 값:', calculatedBMI);
    return calculatedBMI;
  };

  // 최신 건강검진 데이터 가져오기
  const getLatestHealth = (): Health | null => {
    if (healthData.length === 0) return null;
    
    // 날짜 기준으로 정렬
    const sortedHealthData = [...healthData].sort((a, b) => 
      new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime()
    );
    
    return sortedHealthData[0];
  };

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
  
  // 최신 건강검진 데이터
  const latestHealth = getLatestHealth();
  // 최신 BMI 값
  const latestBMI = getLatestBMI();

  return (
    <Layout pageTitle="개별 건강관리">
      <div className="flex h-[calc(100vh-144px)] bg-white rounded-md shadow">
        {/* 왼쪽 학생 목록 패널 */}
        <div className="w-[300px] border-r border-gray-200 flex flex-col">
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
            <div className="flex-1 overflow-y-auto p-4">
              {/* 기본 정보 패널 */}
              <div className="grid grid-cols-12 gap-4">
                {/* 기본 정보 */}
                <div className="col-span-12 bg-white rounded-md border border-gray-200">
                  <div className="grid grid-cols-12 p-4">
                    {/* 프로필 이미지 */}
                    <div className="col-span-2">
                      <div className="w-full aspect-square bg-gray-200 rounded-md flex justify-center items-center mb-2">
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
                        
                        <div className="font-medium">연락처</div>
                        <div className="col-span-3">01012345678</div>
                        
                        <div className="font-medium">주소</div>
                        <div className="col-span-3">{selectedStudent.address || '서울시 영등포구 여의도동'}</div>
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
                           selectedStudent.parentRelation === 'mother' ? '어머니' : '보호자'}
                        </div>
                        
                        <div className="font-medium">연락처</div>
                        <div className="col-span-3">{selectedStudent.parentContact || '01012345678'}</div>
                        
                        <div className="font-medium">건강구분</div>
                        <div className="col-span-3 text-red-500">비만, 거북목</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주요 건강 항목 */}
                <div className="col-span-12 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">주요건강 항목</h3>
                    <button className="text-xs text-gray-500">상세</button>
                  </div>
                  
                  <div className="grid grid-cols-12 p-4">
                    {loadingHealth ? (
                      <div className="col-span-12 flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : latestHealth ? (
                      <>
                        {/* BMI 정보 */}
                        <div className="col-span-6 border-r border-gray-200 pr-4">
                          <div className="mb-2">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium">BMI</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold">
                                  {latestBMI ? latestBMI.toFixed(1) : '데이터가 필요합니다'}
                                </span>
                                <span className="text-xs text-gray-500">(kg/m²)</span>
                              </div>
                            </div>
                            
                            {/* BMI 그래프 */}
                            <div className="relative mt-4 mb-2">
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                {latestBMI && (
                                  <div 
                                    className={`absolute top-0 left-0 h-2 rounded-full ${
                                      latestBMI < 18.5 ? 'bg-blue-500 w-[30%]' :
                                      latestBMI < 23 ? 'bg-green-500 w-[60%]' :
                                      latestBMI < 25 ? 'bg-yellow-500 w-[80%]' :
                                      'bg-red-500 w-[95%]'
                                    }`}
                                  ></div>
                                )}
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>18.5</span>
                                <span>23</span>
                                <span>25</span>
                              </div>
                            </div>
                            <div className="text-xs font-medium">
                              {latestBMI ? (
                                latestBMI < 18.5 ? 
                                  <span className="text-blue-500">저체중</span> :
                                latestBMI < 23 ? 
                                  <span className="text-green-500">표준</span> :
                                latestBMI < 25 ? 
                                  <span className="text-yellow-500">과체중</span> :
                                  <span className="text-red-500">비만</span>
                              ) : (
                                <span className="text-gray-500">데이터가 필요합니다</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div>BMI 판정: {latestBMI ? (
                              latestBMI < 18.5 ? '저체중' :
                              latestBMI < 23 ? '표준' :
                              latestBMI < 25 ? '과체중' : '비만'
                            ) : '데이터가 필요합니다'}</div>
                            <div>측정일: {latestHealth.checkupDate ? 
                              new Date(latestHealth.checkupDate).toLocaleDateString() : 
                              '데이터가 필요합니다'}</div>
                            <div>비만도: {latestBMI ? `${((latestBMI - 18.5) / (25 - 18.5) * 100).toFixed(1)}%` : '데이터가 필요합니다'}</div>
                          </div>
                        </div>
                        
                        {/* 허리둘레 정보 */}
                        <div className="col-span-6 pl-4">
                          <div className="mb-2">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium">허리둘레</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold">
                                  {latestHealth.waistCircumference ? Number(latestHealth.waistCircumference).toFixed(1) : '데이터가 필요합니다'}
                                </span>
                                <span className="text-xs text-gray-500">(cm)</span>
                              </div>
                            </div>
                            
                            {/* 허리둘레 그래프 */}
                            <div className="relative mt-4 mb-2">
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                {latestHealth.waistCircumference && (
                                  <div 
                                    className="absolute top-0 left-0 h-2 bg-yellow-500 rounded-full"
                                    style={{ 
                                      width: `${Math.min(Number(latestHealth.waistCircumference) / 85 * 100, 100)}%` 
                                    }}
                                  ></div>
                                )}
                              </div>
                              <div className="flex justify-end mt-1 text-xs text-gray-500">
                                <span>85</span>
                              </div>
                            </div>
                            <div className="text-xs text-yellow-500 font-medium">
                              {latestHealth.waistCircumference ? 
                                Number(latestHealth.waistCircumference) < 85 ? '정상' : '복부비만 위험' : 
                                '측정 필요'}
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2 text-xs">
                            <div>허리/신장 비율: {
                              (latestHealth.waistCircumference && latestHealth.height) ?
                              (Number(latestHealth.waistCircumference) / Number(latestHealth.height)).toFixed(2) :
                              '데이터가 필요합니다'
                            }</div>
                            <div>시력(좌/우): {
                              latestHealth.leftEyesight && latestHealth.rightEyesight ?
                              `${Number(latestHealth.leftEyesight).toFixed(1)} / ${Number(latestHealth.rightEyesight).toFixed(1)}` :
                              '데이터가 필요합니다'
                            }</div>
                            <div>혈압: {
                              latestHealth.systolicPressure && latestHealth.diastolicPressure ?
                              `${latestHealth.systolicPressure} / ${latestHealth.diastolicPressure} mmHg` :
                              '데이터가 필요합니다'
                            }</div>
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
                
                {/* 성장 기록 */}
                <div className="col-span-12 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium">성장기록</h3>
                    <div className="flex space-x-2">
                      <button className="p-1 bg-gray-900 rounded text-white text-xs">표</button>
                      <button className="p-1 text-xs">상세</button>
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
                        <h4 className="text-sm font-medium mb-2">키 측정 (cm)</h4>
                        <div className="bg-gray-50 h-48 rounded">
                          <svg width="100%" height="100%" viewBox="0 0 250 180" preserveAspectRatio="none">
                            <g transform="translate(30, 20)">
                              {/* Y축 */}
                              <line x1="0" y1="0" x2="0" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              {/* X축 */}
                              <line x1="0" y1="140" x2="200" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              
                              {/* 그래프 선 */}
                              {growthData.length >= 2 && (
                                <path 
                                  d={`M${growthData.map((data, index) => {
                                    // X 좌표 간격 계산 (데이터 포인트 수에 따라 동적 조정)
                                    const xStep = 200 / (growthData.length - 1);
                                    const x = index * xStep;
                                    
                                    // Y 좌표 계산 (키 값 정규화)
                                    // 최대값과 최소값 찾기
                                    const heights = growthData.map(d => Number(d.height));
                                    const maxHeight = Math.max(...heights);
                                    const minHeight = Math.min(...heights);
                                    const range = maxHeight - minHeight || 1; // 0으로 나누기 방지
                                    const padding = range * 0.1; // 10% 패딩
                                    
                                    // 정규화된 Y 좌표 (위에서부터 아래로 증가하므로 140에서 빼줌)
                                    const normalizedHeight = (Number(data.height) - minHeight + padding) / (range + padding * 2);
                                    const y = 140 - (normalizedHeight * 120); // 120은 그래프 높이(140에서 상하 여백 빼기)
                                    
                                    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
                                  }).join(' ')}`}
                                  fill="none" 
                                  stroke="#3b82f6" 
                                  strokeWidth="2" 
                                />
                              )}
                              
                              {/* 포인트 */}
                              {growthData.map((data, index) => {
                                // X 좌표 간격 계산
                                const xStep = 200 / (growthData.length > 1 ? growthData.length - 1 : 1);
                                const x = index * xStep;
                                
                                // Y 좌표 계산 (키 값 정규화)
                                const heights = growthData.map(d => Number(d.height));
                                const maxHeight = Math.max(...heights);
                                const minHeight = Math.min(...heights);
                                const range = maxHeight - minHeight || 1;
                                const padding = range * 0.1;
                                
                                const normalizedHeight = (Number(data.height) - minHeight + padding) / (range + padding * 2);
                                const y = 140 - (normalizedHeight * 120);
                                
                                // 날짜 포맷팅
                                const date = new Date(data.measurementDate);
                                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                                
                                return (
                                  <g key={index}>
                                    <circle 
                                      cx={x} 
                                      cy={y} 
                                      r="3" 
                                      fill="white" 
                                      stroke="#3b82f6" 
                                      strokeWidth="1" 
                                    />
                                    <text 
                                      x={x} 
                                      y={160} 
                                      textAnchor="middle" 
                                      fontSize="8"
                                      fill="#666"
                                    >
                                      {formattedDate}
                                    </text>
                                    <text 
                                      x={x} 
                                      y={y - 10} 
                                      textAnchor="middle" 
                                      fontSize="8"
                                      fill="#3b82f6"
                                    >
                                      {Number(data.height).toFixed(1)}
                                    </text>
                                  </g>
                                );
                              })}
                            </g>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 몸무게 측정 그래프 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">몸무게 측정 (kg)</h4>
                        <div className="bg-gray-50 h-48 rounded">
                          <svg width="100%" height="100%" viewBox="0 0 250 180" preserveAspectRatio="none">
                            <g transform="translate(30, 20)">
                              {/* Y축 */}
                              <line x1="0" y1="0" x2="0" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              {/* X축 */}
                              <line x1="0" y1="140" x2="200" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              
                              {/* 그래프 선 */}
                              {growthData.length >= 2 && (
                                <path 
                                  d={`M${growthData.map((data, index) => {
                                    const xStep = 200 / (growthData.length - 1);
                                    const x = index * xStep;
                                    
                                    const weights = growthData.map(d => Number(d.weight));
                                    const maxWeight = Math.max(...weights);
                                    const minWeight = Math.min(...weights);
                                    const range = maxWeight - minWeight || 1;
                                    const padding = range * 0.1;
                                    
                                    const normalizedWeight = (Number(data.weight) - minWeight + padding) / (range + padding * 2);
                                    const y = 140 - (normalizedWeight * 120);
                                    
                                    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
                                  }).join(' ')}`}
                                  fill="none" 
                                  stroke="#3b82f6" 
                                  strokeWidth="2" 
                                />
                              )}
                              
                              {/* 포인트 */}
                              {growthData.map((data, index) => {
                                const xStep = 200 / (growthData.length > 1 ? growthData.length - 1 : 1);
                                const x = index * xStep;
                                
                                const weights = growthData.map(d => Number(d.weight));
                                const maxWeight = Math.max(...weights);
                                const minWeight = Math.min(...weights);
                                const range = maxWeight - minWeight || 1;
                                const padding = range * 0.1;
                                
                                const normalizedWeight = (Number(data.weight) - minWeight + padding) / (range + padding * 2);
                                const y = 140 - (normalizedWeight * 120);
                                
                                const date = new Date(data.measurementDate);
                                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                                
                                return (
                                  <g key={index}>
                                    <circle 
                                      cx={x} 
                                      cy={y} 
                                      r="3" 
                                      fill="white" 
                                      stroke="#3b82f6" 
                                      strokeWidth="1" 
                                    />
                                    <text 
                                      x={x} 
                                      y={160} 
                                      textAnchor="middle" 
                                      fontSize="8"
                                      fill="#666"
                                    >
                                      {formattedDate}
                                    </text>
                                    <text 
                                      x={x} 
                                      y={y - 10} 
                                      textAnchor="middle" 
                                      fontSize="8"
                                      fill="#3b82f6"
                                    >
                                      {Number(data.weight).toFixed(1)}
                                    </text>
                                  </g>
                                );
                              })}
                            </g>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 허리둘레 그래프 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">허리둘레 (cm)</h4>
                        <div className="bg-gray-50 h-48 rounded">
                          <svg width="100%" height="100%" viewBox="0 0 250 180" preserveAspectRatio="none">
                            <g transform="translate(30, 20)">
                              {/* Y축 */}
                              <line x1="0" y1="0" x2="0" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              {/* X축 */}
                              <line x1="0" y1="140" x2="200" y2="140" stroke="#e5e7eb" strokeWidth="1" />
                              
                              {/* 그래프 선 - 허리둘레가 있는 데이터만 포함 */}
                              {growthData.filter(data => data.waistCircumference).length >= 2 && (
                                <path 
                                  d={`M${growthData
                                    .filter(data => data.waistCircumference)
                                    .map((data, index, filteredArray) => {
                                      const xStep = 200 / (filteredArray.length - 1);
                                      const x = index * xStep;
                                      
                                      const waists = filteredArray.map(d => Number(d.waistCircumference));
                                      const maxWaist = Math.max(...waists);
                                      const minWaist = Math.min(...waists);
                                      const range = maxWaist - minWaist || 1;
                                      const padding = range * 0.1;
                                      
                                      const normalizedWaist = (Number(data.waistCircumference) - minWaist + padding) / (range + padding * 2);
                                      const y = 140 - (normalizedWaist * 120);
                                      
                                      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
                                    }).join(' ')}`}
                                  fill="none" 
                                  stroke="#3b82f6" 
                                  strokeWidth="2" 
                                />
                              )}
                              
                              {/* 포인트 - 허리둘레가 있는 데이터만 표시 */}
                              {growthData
                                .filter(data => data.waistCircumference)
                                .map((data, index, filteredArray) => {
                                  const xStep = 200 / (filteredArray.length > 1 ? filteredArray.length - 1 : 1);
                                  const x = index * xStep;
                                  
                                  const waists = filteredArray.map(d => Number(d.waistCircumference));
                                  const maxWaist = Math.max(...waists);
                                  const minWaist = Math.min(...waists);
                                  const range = maxWaist - minWaist || 1;
                                  const padding = range * 0.1;
                                  
                                  const normalizedWaist = (Number(data.waistCircumference) - minWaist + padding) / (range + padding * 2);
                                  const y = 140 - (normalizedWaist * 120);
                                  
                                  const date = new Date(data.measurementDate);
                                  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                                  
                                  return (
                                    <g key={index}>
                                      <circle 
                                        cx={x} 
                                        cy={y} 
                                        r="3" 
                                        fill="white" 
                                        stroke="#3b82f6" 
                                        strokeWidth="1" 
                                      />
                                      <text 
                                        x={x} 
                                        y={160} 
                                        textAnchor="middle" 
                                        fontSize="8"
                                        fill="#666"
                                      >
                                        {formattedDate}
                                      </text>
                                      <text 
                                        x={x} 
                                        y={y - 10} 
                                        textAnchor="middle" 
                                        fontSize="8"
                                        fill="#3b82f6"
                                      >
                                        {Number(data.waistCircumference).toFixed(1)}
                                      </text>
                                    </g>
                                  );
                                })}
                              
                              {/* 허리둘레 데이터가 없는 경우 메시지 */}
                              {growthData.filter(data => data.waistCircumference).length === 0 && (
                                <text x="100" y="70" textAnchor="middle" fontSize="12" fill="#666">
                                  허리둘레 데이터가 없습니다
                                </text>
                              )}
                            </g>
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