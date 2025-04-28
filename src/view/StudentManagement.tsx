"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Search, Plus, Trash2, Edit, X, AlertCircle } from "lucide-react"
import { Student } from "../models/Student"
import moment from 'moment'
import { Layout } from '@/components/Layout'
import StudentAddModal from '@/components/modals/StudentAddModal'

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

export default function StudentManagement() {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // 학생 데이터 상태
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedSchoolType, setSelectedSchoolType] = useState<SchoolType | null>(null)

  // 학생 등록 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Student>>({})
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
      setTotalPages(data.pagination.totalPages);
    } catch (error: unknown) {
      console.error('Error fetching students:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('학생 목록을 불러오는데 실패했습니다.');
      }
      setStudents([]);
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
      birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
    })
    setIsModalOpen(true)
  }

  // 모달 닫기
  const handleCancel = () => {
    setFormData({})
    setIsModalOpen(false)
  }

  // 폼 제출 처리
  const handleSubmit = async (formData: Partial<Student>) => {
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
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 border-collapse border border-gray-300">
              <thead className="text-[10px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">이름</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">학년</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">반</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">번호</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">성별</th>
                  <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-32">생년월일</th>
                  <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">보호자</th>
                  <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-32">보호자 연락처</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-20">보호자 관계</th>
                  <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-96">주소</th>
                  <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-28">관리</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {students.map(student => (
                  <tr key={student.id} className="bg-white dark:bg-gray-800">
                    <td className="py-2 px-3 text-center border border-gray-300">{student.name}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{student.grade}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{student.classNumber}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{student.studentNumber}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{student.gender === 'male' ? '남' : '여'}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{student.birthDate ? moment(student.birthDate).format('YYYY-MM-DD') : '-'}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{student.parentName || '-'}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{student.parentContact || '-'}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">
                      {student.parentRelation ? 
                        student.parentRelation === 'father' ? '부' :
                        student.parentRelation === 'mother' ? '모' :
                        student.parentRelation === 'grandfather' ? '조부' :
                        student.parentRelation === 'grandmother' ? '조모' :
                        student.parentRelation === 'uncle' ? '삼촌/외삼촌' :
                        student.parentRelation === 'aunt' ? '고모/이모' :
                        '기타'
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-center border border-gray-300 truncate">{student.address || '-'}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">
                      <div className="flex justify-center space-x-1">
                        <button
                          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          onClick={() => showEditModal(student)}
                        >
                          <Edit className="mr-0.5 h-2.5 w-2.5" />
                          수정
                        </button>
                        <button 
                          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"
                          onClick={() => {
                            if (window.confirm('정말 삭제하시겠습니까?')) {
                              handleDelete(student.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-0.5 h-2.5 w-2.5" />
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

      <StudentAddModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        editingId={editingId}
        initialData={formData}
      />
    </Layout>
  )
} 