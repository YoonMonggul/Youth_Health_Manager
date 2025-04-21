"use client"

import { useState, useEffect, FormEvent } from "react"
import { ChevronLeft, ChevronRight, Search, Plus, Filter, Trash2, Edit, RefreshCw, X, AlertCircle } from "lucide-react"
import { Student } from "../models/Student"
import moment from 'moment'
import { Layout } from '@/components/Layout'

// 통계 바 컴포넌트 타입
interface StatBarProps {
  label: string
  value: number
  color: string
  percentage?: number
  fullWidth?: boolean
}

// 통계 바 컴포넌트
const StatBar = ({ label, value, color, percentage = 100, fullWidth = false }: StatBarProps) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
      <div className={`bg-gray-200 rounded-full h-2.5 ${fullWidth ? 'w-full' : 'w-48'}`}>
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// 학교 유형 enum
export enum SchoolType {
  ELEMENTARY = 'elementary',
  MIDDLE = 'middle',
  HIGH = 'high'
}

// 성별 enum
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

// 학교 통계 인터페이스
interface SchoolStatistics {
  schoolType: string;
  total: { all: number; male: number; female: number };
  grades: { grade: number; total: number; male: number; female: number }[];
}

export default function StudentManagement() {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // 학생 데이터 상태
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedSchoolType, setSelectedSchoolType] = useState<SchoolType | null>(null)

  // 통계 데이터 상태
  const [statistics, setStatistics] = useState<SchoolStatistics>({
    schoolType: 'ALL',
    total: {
      all: 0,
      male: 0,
      female: 0
    },
    grades: [
      { grade: 1, total: 0, male: 0, female: 0 },
      { grade: 2, total: 0, male: 0, female: 0 },
      { grade: 3, total: 0, male: 0, female: 0 },
      { grade: 4, total: 0, male: 0, female: 0 },
      { grade: 5, total: 0, male: 0, female: 0 },
      { grade: 6, total: 0, male: 0, female: 0 }
    ]
  })

  // 선택된 학생 상태
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // 학생 등록 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // 알림 상태
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info')

  // 초기 데이터 로드
  useEffect(() => {
    fetchStudents();
  }, [selectedSchoolType, selectedGrade, currentPage, searchTerm]);

  // 학생 목록 가져오기
  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // API 요청 파라미터 구성
      const params = new URLSearchParams();
      if (selectedSchoolType) params.append('schoolType', selectedSchoolType);
      if (selectedGrade) params.append('grade', selectedGrade.toString());
      if (searchTerm) params.append('searchTerm', searchTerm);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      // 학생 데이터 요청
      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) {
        throw new Error('학생 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setStudents(data.students);
      setFilteredStudents(data.students);
      setTotalPages(data.pagination.totalPages);
      
      // 통계 데이터 요청
      const statsParams = new URLSearchParams();
      if (selectedSchoolType) statsParams.append('schoolType', selectedSchoolType);
      statsParams.append('stats', 'true');
      
      const statsResponse = await fetch(`/api/students?${statsParams}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || '학생 목록을 불러오는데 실패했습니다.');
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // 학생 등록 모달 열기
  const showModal = () => {
    setEditingId(null)
    setFormData({})
    setIsModalOpen(true)
  }

  // 학생 수정 모달 열기
  const showEditModal = (student: Student) => {
    setEditingId(student.id)
    setFormData({
      ...student,
      birthDate: student.birthDate ? new Date(student.birthDate) : null,
    })
    setIsModalOpen(true)
  }

  // 모달 닫기
  const handleCancel = () => {
    setFormData({})
    setIsModalOpen(false)
  }

  // 폼 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  // 날짜 변경 핸들러
  const handleDateChange = (date: Date) => {
    setFormData({ ...formData, birthDate: date });
  }

  // 폼 제출 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // FormData 검증
      if (!formData.name || !formData.schoolName || !formData.schoolType || !formData.gender || !formData.grade) {
        setAlertMessage('필수 항목을 모두 입력해주세요.');
        setAlertType('error');
        return;
      }
      
      const values = {
        ...formData,
        birthDate: formData.birthDate ? moment(formData.birthDate).format('YYYY-MM-DD') : null,
      };

      if (editingId) {
        // 학생 정보 업데이트
        const response = await fetch(`/api/students?id=${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error('학생 정보 업데이트에 실패했습니다.')
        }

        const updatedStudent = await response.json()
        setStudents(students.map(student => 
          student.id === editingId ? updatedStudent : student
        ))
        setAlertMessage('학생 정보가 업데이트되었습니다.');
        setAlertType('success');
      } else {
        // 새 학생 등록
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error('학생 등록에 실패했습니다.')
        }

        const newStudent = await response.json()
        setStudents([...students, newStudent])
        setAlertMessage('학생이 등록되었습니다.');
        setAlertType('success');
      }

      setFormData({})
      setIsModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      setAlertMessage('입력 데이터를 확인해주세요.');
      setAlertType('error');
    }
  }

  // 학생 삭제 처리
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('학생 삭제에 실패했습니다.')
      }

      setStudents(students.filter(student => student.id !== id))
      setAlertMessage('학생이 삭제되었습니다.');
      setAlertType('success');
    } catch (error) {
      console.error('Delete error:', error)
      setAlertMessage('학생 삭제에 실패했습니다.');
      setAlertType('error');
    }
  }

  // 검색어 입력 핸들러
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색어 변경시 첫 페이지로 이동
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 학년 필터 핸들러
  const handleGradeFilter = (grade: number | null) => {
    setSelectedGrade(grade === selectedGrade ? null : grade);
    setCurrentPage(1); // 필터 변경시 첫 페이지로 이동
  };

  // 학교 유형 필터 핸들러
  const handleSchoolTypeFilter = (type: SchoolType | null) => {
    setSelectedSchoolType(type === selectedSchoolType ? null : type);
    setCurrentPage(1); // 필터 변경시 첫 페이지로 이동
  };

  // 전체 선택 토글
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  // 개별 학생 선택 토글
  const toggleStudentSelection = (studentId: number) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds(prev => [...prev, studentId]);
    }
  };

  return (
    <Layout pageTitle="학생 관리">
      {alertMessage && (
        <div className={`p-4 mb-4 text-sm rounded-lg ${
          alertType === 'success' 
          ? 'text-green-800 bg-green-50' 
          : alertType === 'error' 
          ? 'text-red-800 bg-red-50' 
          : 'text-blue-800 bg-blue-50'
        }`} role="alert">
          <span className="font-medium">{alertMessage}</span>
          <button 
            type="button" 
            className="ml-2 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 float-right" 
            onClick={() => setAlertMessage(null)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm focus:outline-none"
            onClick={showModal}
          >
            <Plus className="inline-block mr-2 h-5 w-5" />
            학생 등록
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="학생 검색..."
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </div>
          
          <select
            value={selectedGrade?.toString() || ""}
            onChange={(e) => handleGradeFilter(e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 mr-2"
          >
            <option value="">전체 학년</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">4학년</option>
            <option value="5">5학년</option>
            <option value="6">6학년</option>
          </select>
          
          <select
            value={selectedSchoolType || ""}
            onChange={(e) => handleSchoolTypeFilter(e.target.value as SchoolType || null)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">전체 학교</option>
            <option value={SchoolType.ELEMENTARY}>초등학교</option>
            <option value={SchoolType.MIDDLE}>중학교</option>
            <option value={SchoolType.HIGH}>고등학교</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 px-6">학생 ID</th>
                  <th scope="col" className="py-3 px-6">이름</th>
                  <th scope="col" className="py-3 px-6">학교</th>
                  <th scope="col" className="py-3 px-6">학교 유형</th>
                  <th scope="col" className="py-3 px-6">학년</th>
                  <th scope="col" className="py-3 px-6">반</th>
                  <th scope="col" className="py-3 px-6">성별</th>
                  <th scope="col" className="py-3 px-6">생년월일</th>
                  <th scope="col" className="py-3 px-6">관리</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="py-4 px-6">{student.studentId}</td>
                    <td className="py-4 px-6">{student.name}</td>
                    <td className="py-4 px-6">{student.schoolName}</td>
                    <td className="py-4 px-6">
                      {student.schoolType === 'elementary' ? '초등학교' : 
                       student.schoolType === 'middle' ? '중학교' : '고등학교'}
                    </td>
                    <td className="py-4 px-6">{student.grade}</td>
                    <td className="py-4 px-6">{student.classNumber}</td>
                    <td className="py-4 px-6">{student.gender === 'male' ? '남' : '여'}</td>
                    <td className="py-4 px-6">{student.birthDate ? moment(student.birthDate).format('YYYY-MM-DD') : '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          onClick={() => showEditModal(student)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          수정
                        </button>
                        <button 
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"
                          onClick={() => {
                            if (window.confirm('정말 삭제하시겠습니까?')) {
                              handleDelete(student.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center mt-4">
            <nav aria-label="Page navigation">
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 hover:text-gray-700'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page}>
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 leading-tight border border-gray-300 ${currentPage === page ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 hover:text-gray-700'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-full max-w-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "학생 정보 수정" : "학생 등록"}
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={handleCancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal body */}
            <div className="p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="이름을 입력하세요"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="schoolName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    학교명
                  </label>
                  <input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="학교명을 입력하세요"
                    value={formData.schoolName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="schoolType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    학교 유형
                  </label>
                  <select
                    id="schoolType"
                    name="schoolType"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={formData.schoolType || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">학교 유형을 선택하세요</option>
                    <option value="elementary">초등학교</option>
                    <option value="middle">중학교</option>
                    <option value="high">고등학교</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="grade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    학년
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={formData.grade || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">학년을 선택하세요</option>
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                    <option value="4">4학년</option>
                    <option value="5">5학년</option>
                    <option value="6">6학년</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="classNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    반
                  </label>
                  <input
                    id="classNumber"
                    name="classNumber"
                    type="number"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="반을 입력하세요"
                    value={formData.classNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    성별
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">성별을 선택하세요</option>
                    <option value="male">남</option>
                    <option value="female">여</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="birthDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    생년월일
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={formData.birthDate ? moment(formData.birthDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateChange(new Date(e.target.value));
                      }
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    연락처
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="연락처를 입력하세요"
                    value={formData.contactNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    주소
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="주소를 입력하세요"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </div>
            
            {/* Modal footer */}
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button 
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                onClick={handleSubmit}
              >
                {editingId ? "수정" : "등록"}
              </button>
              <button 
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5"
                onClick={handleCancel}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
} 