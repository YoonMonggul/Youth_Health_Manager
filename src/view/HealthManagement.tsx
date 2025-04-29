"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Search, Plus, Trash2, Edit, X, AlertCircle } from "lucide-react"
import { Layout } from '@/components/Layout'
import { Health } from '@/models/health'
import HealthAddModal from '@/components/modals/HealthAddModal'

export default function HealthManagement() {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  // 데이터 상태
  const [healthData, setHealthData] = useState<Health[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 알림 상태
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info')

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Health>>({})

  // 데이터 로드
  useEffect(() => {
    fetchHealthData();
  }, [currentPage, searchTerm, selectedGrade]);

  // 검진 데이터 조회
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedGrade) params.append('grade', selectedGrade.toString());

      const response = await fetch(`/api/health-checkups?${params}`);
      if (!response.ok) throw new Error('데이터 조회에 실패했습니다.');

      const data = await response.json();
      setHealthData(data.items);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Health data fetch error:', error);
      setError('검진 데이터 조회 중 오류가 발생했습니다.');
      setHealthData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 입력 핸들러
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 학년 필터 핸들러
  const handleGradeFilter = (grade: number | null) => {
    setSelectedGrade(grade === selectedGrade ? null : grade);
    setCurrentPage(1);
  };

  // 모달 핸들러
  const handleModalOpen = () => {
    setEditingId(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setFormData({});
    setIsModalOpen(false);
  };

  // 데이터 수정 모달 열기
  const handleEdit = (health: Health) => {
    setEditingId(health.id);
    setFormData(health);
    setIsModalOpen(true);
  };

  // 데이터 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/health-checkups?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('삭제에 실패했습니다.');

      setAlertMessage('검진 데이터가 삭제되었습니다.');
      setAlertType('success');
      fetchHealthData();
    } catch (error) {
      console.error('Delete error:', error);
      setAlertMessage('삭제 중 오류가 발생했습니다.');
      setAlertType('error');
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (formData: Partial<Health>) => {
    try {
      const url = editingId ? `/api/health-checkups?id=${editingId}` : '/api/health-checkups';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('저장에 실패했습니다.');

      setAlertMessage(editingId ? '검진 데이터가 수정되었습니다.' : '검진 데이터가 등록되었습니다.');
      setAlertType('success');
      handleModalClose();
      fetchHealthData();
    } catch (error) {
      console.error('Submit error:', error);
      setAlertMessage('저장 중 오류가 발생했습니다.');
      setAlertType('error');
    }
  };

  return (
    <Layout pageTitle="검진 데이터 관리">
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
            onClick={handleModalOpen}
          >
            <Plus className="inline-block mr-2 h-5 w-5" />
            검진 데이터 등록
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">전체 학년</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">4학년</option>
            <option value="5">5학년</option>
            <option value="6">6학년</option>
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
        <div className="overflow-x-auto relative">
          <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 border-collapse border border-gray-300">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">이름</th>
                <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">학년</th>
                <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">반</th>
                <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">번호</th>
                <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-16">성별</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">키(cm)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">몸무게(kg)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">허리둘레(cm)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">혈압(수축기)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">혈압(이완기)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">시력(좌)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">시력(우)</th>
                <th scope="col" className="py-1.5 px-3 text-center border border-gray-300 w-24">검진일자</th>
                <th scope="col" className="py-1.5 px-2 text-center border border-gray-300 w-28">관리</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {healthData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-4 text-center text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                healthData.map((health) => (
                  <tr key={health.id} className="bg-white dark:bg-gray-800">
                    <td className="py-2 px-3 text-center border border-gray-300">{health.student.name}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{health.student.grade}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{health.student.classNumber}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">{health.student.studentNumber}</td>
                    <td className="py-2 px-2 text-center border border-gray-300">
                      {health.student.gender === 'male' ? '남' : '여'}
                    </td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.height}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.weight}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.waistCircumference}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.systolicPressure}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.diastolicPressure}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.leftEyesight}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">{health.rightEyesight}</td>
                    <td className="py-2 px-3 text-center border border-gray-300">
                      {new Date(health.checkupDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-center border border-gray-300">
                      <div className="flex justify-center space-x-1">
                        <button
                          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          onClick={() => handleEdit(health)}
                        >
                          <Edit className="mr-0.5 h-2.5 w-2.5" />
                          수정
                        </button>
                        <button
                          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"
                          onClick={() => handleDelete(health.id)}
                        >
                          <Trash2 className="mr-0.5 h-2.5 w-2.5" />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
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

      <HealthAddModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        editingId={editingId}
        initialData={formData}
      />
    </Layout>
  )
} 