"use client"

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { Layout } from '@/components/Layout';
import ContentAddModal from '@/components/modals/ContentAddModal';
import { Content } from '@/models/Content';

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Content>>({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // 컨텐츠 목록 조회
  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedContentType) params.append('contentType', selectedContentType);
      
      const response = await fetch(`/api/contents?${params}`);
      if (!response.ok) throw new Error('컨텐츠 조회에 실패했습니다.');
      
      const data = await response.json();
      setContents(data.items || []);
    } catch (error) {
      console.error('컨텐츠 조회 오류:', error);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [searchTerm, selectedContentType]);

  const handleAddContent = () => {
    setEditingId(null);
    setEditingData({});
    setIsAddModalOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setEditingId(content.id);
    setEditingData(content);
    setIsAddModalOpen(true);
  };

  const handleDeleteContent = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/contents?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('삭제에 실패했습니다.');

      setAlertMessage('컨텐츠가 삭제되었습니다.');
      setAlertType('success');
      fetchContents();
    } catch (error) {
      console.error('삭제 오류:', error);
      setAlertMessage('삭제 중 오류가 발생했습니다.');
      setAlertType('error');
    }
  };

  const handleSubmit = async (formData: Partial<Content>) => {
    try {
      const url = editingId ? `/api/contents?id=${editingId}` : '/api/contents';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('저장에 실패했습니다.');

      setAlertMessage(editingId ? '컨텐츠가 수정되었습니다.' : '컨텐츠가 등록되었습니다.');
      setAlertType('success');
      setIsAddModalOpen(false);
      fetchContents();
    } catch (error) {
      console.error('저장 오류:', error);
      setAlertMessage('저장 중 오류가 발생했습니다.');
      setAlertType('error');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout pageTitle="컨텐츠관리">
      <div className="p-6">
        {/* 알림 메시지 */}
        {alertMessage && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            alertType === 'success' 
            ? 'text-green-800 bg-green-50' 
            : 'text-red-800 bg-red-50'
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

        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">컨텐츠관리</h1>
            <p className="text-gray-600 mt-1">프로그램별 교육 컨텐츠를 관리합니다.</p>
          </div>
          <button
            onClick={handleAddContent}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            컨텐츠 추가
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="컨텐츠 제목으로 검색..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">컨텐츠 종류</option>
            <option value="general">일반 컨텐츠</option>
            <option value="program">프로그램용 컨텐츠</option>
          </select>
        </div>

        {/* 컨텐츠 목록 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contents.length > 0 ? (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div key={content.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{content.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {content.category}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {content.weekNumber}주차
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.contentType === 'general' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {content.contentType === 'general' ? '일반' : '프로그램'}
                      </span>
                      <span className={content.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {content.status === 'active' ? '활성' : '비활성'}
                      </span>
                      {content.program && (
                        <span className="text-gray-600">프로그램: {content.program.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => handleEditContent(content)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => handleDeleteContent(content.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* 컨텐츠 아이템 미리보기 */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {content.contentItems?.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded p-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {index + 1}번째 컨텐츠
                      </div>
                      <div className="text-xs text-gray-600 truncate">{item.title}</div>
                      {item.imageUrl && (
                        <div className="text-xs text-blue-600 mt-1">✓ 이미지 포함</div>
                      )}
                    </div>
                  ))}
                </div>

                {content.note && (
                  <p className="text-gray-700 text-sm mb-3">{content.note}</p>
                )}
                
                <div className="text-xs text-gray-400">
                  생성일: {new Date(content.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <div className="text-lg font-medium">등록된 컨텐츠가 없습니다</div>
              <div className="text-sm mt-1">새로운 컨텐츠를 추가해보세요</div>
            </div>
            <button
              onClick={handleAddContent}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 컨텐츠 추가
            </button>
          </div>
        )}

        {/* 컨텐츠 추가/수정 모달 */}
        <ContentAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmit}
          editingId={editingId}
          initialData={editingData}
        />
      </div>
    </Layout>
  );
} 