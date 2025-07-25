'use client';

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Content, ContentItem } from '@/models/Content';

interface ContentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Content>) => Promise<void>;
  editingId: number | null;
  initialData?: Partial<Content>;
}

export default function ContentAddModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  initialData = {}
}: ContentAddModalProps) {
  const [formData, setFormData] = useState<Partial<Content>>(initialData);
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: 1, title: '', description: '', imageUrl: '', imageAlt: '' },
    { id: 2, title: '', description: '', imageUrl: '', imageAlt: '' },
    { id: 3, title: '', description: '', imageUrl: '', imageAlt: '' }
  ]);
  const [loading, setLoading] = useState(false);

  // 초기 데이터가 있을 때 contentItems 설정
  React.useEffect(() => {
    if (Object.keys(initialData).length > 0 && initialData.contentItems) {
      setContentItems(initialData.contentItems as ContentItem[]);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentItemChange = (index: number, field: keyof ContentItem, value: string) => {
    console.log(`handleContentItemChange: index=${index}, field=${field}, value="${value}"`);
    const updatedItems = [...contentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    console.log(`Updated item ${index}:`, updatedItems[index]);
    setContentItems(updatedItems);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setLoading(true);
      console.log(`이미지 업로드 시작: index=${index}, file=${file.name}`);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // 이미지 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 업로드에 실패했습니다.');
      }
      
      const result = await response.json();
      console.log('업로드 결과:', result);
      
      // 업로드 성공 시 상태 업데이트
      console.log(`imageUrl 업데이트: ${result.url}`);
      console.log(`imageAlt 업데이트: ${result.originalName}`);
      
      // 상태를 직접 업데이트하여 더 안전하게 처리
      setContentItems(prevItems => {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          imageUrl: result.url,
          imageAlt: result.originalName
        };
        console.log(`업데이트된 아이템 ${index}:`, updatedItems[index]);
        return updatedItems;
      });
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 디버깅: 현재 상태 출력
    console.log('=== 폼 제출 디버깅 ===');
    console.log('formData:', formData);
    console.log('contentItems:', contentItems);
    
    // 필수 필드 검증
    if (!formData.title || !formData.weekNumber) {
      alert('제목과 주차는 필수입니다.');
      return;
    }

    // contentItems 검증 - 최소 1개 이상의 완성된 아이템이 필요
    console.log('=== 상세 검증 시작 ===');
    
    const validItems = [];
    let validCount = 0;
    
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      
      console.log(`\n--- 아이템 ${i + 1} 분석 ---`);
      console.log('원본 데이터:', item);
      
      // 각 필드 확인
      const title = item.title || '';
      const description = item.description || '';
      const imageUrl = item.imageUrl || '';
      
      console.log('처리된 데이터:', {
        title: `"${title}"`,
        description: `"${description}"`,
        imageUrl: `"${imageUrl}"`
      });
      
      // 검증
      const titleValid = title.trim().length > 0;
      const descriptionValid = description.trim().length > 0;
      const imageUrlValid = imageUrl.trim().length > 0;
      
      console.log('검증 결과:', {
        titleValid,
        descriptionValid,
        imageUrlValid,
        isValid: titleValid && descriptionValid && imageUrlValid
      });
      
      if (titleValid && descriptionValid && imageUrlValid) {
        validItems.push(item);
        validCount++;
        console.log(`✅ 아이템 ${i + 1} 유효함`);
      } else {
        console.log(`❌ 아이템 ${i + 1} 유효하지 않음`);
      }
    }
    
    console.log(`\n=== 최종 결과 ===`);
    console.log(`총 ${validCount}개의 유효한 아이템 발견`);
    console.log('유효한 아이템들:', validItems);
    
    if (validCount === 0) {
      alert('최소 1개의 컨텐츠 아이템(제목, 설명, 이미지)이 필요합니다.');
      return;
    }

    const submitData = {
      ...formData,
      contentItems: validItems // 완성된 아이템만 전송
    };

    console.log('submitData:', submitData);
    await onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-4xl mx-4 pointer-events-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? '컨텐츠 수정' : '컨텐츠 등록'}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">
                컨텐츠 제목 *
              </label>
              <input
                type="text"
                name="title"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="예: 1주차 - 건강한 식습관"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">
                주차 *
              </label>
              <input
                type="number"
                name="weekNumber"
                min="1"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="주차 번호"
                value={formData.weekNumber || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* 컨텐츠 아이템들 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              컨텐츠 아이템 (최소 1개 이상 입력 필요)
            </h4>
            <div className="space-y-4">
              {contentItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-900">
                      {index + 1}번째 컨텐츠
                      {item.title && item.description && item.imageUrl && (
                        <span className="ml-2 text-xs text-green-600">✓ 완성</span>
                      )}
                    </h5>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-900">
                        제목 *
                      </label>
                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="컨텐츠 제목"
                        value={item.title}
                        onChange={(e) => handleContentItemChange(index, 'title', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-900">
                        이미지 *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`image-${index}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(index, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={`image-${index}`}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 text-xs"
                        >
                          <Upload className="w-4 h-4" />
                          {loading ? '업로드 중...' : '이미지 선택'}
                        </label>
                        {item.imageUrl && (
                          <span className="text-xs text-green-600">✓ 업로드됨</span>
                        )}
                      </div>
                      
                      {/* 업로드된 파일명 표시 */}
                      {item.imageAlt && (
                        <div className="mt-1 text-xs text-gray-600">
                          📁 {item.imageAlt}
                        </div>
                      )}
                      
                      {/* 이미지 미리보기 */}
                      {item.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={item.imageUrl} 
                            alt={item.imageAlt || '업로드된 이미지'}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block mb-1 text-xs font-medium text-gray-900">
                      설명 *
                    </label>
                    <textarea
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      rows={3}
                      placeholder="컨텐츠 설명을 입력하세요"
                      value={item.description}
                      onChange={(e) => handleContentItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>

                  {item.imageUrl && (
                    <div className="mt-3">
                      <label className="block mb-1 text-xs font-medium text-gray-900">
                        이미지 대체 텍스트
                      </label>
                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="이미지 대체 텍스트"
                        value={item.imageAlt}
                        onChange={(e) => handleContentItemChange(index, 'imageAlt', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 특이사항 */}
          <div className="mb-6">
            <label className="block mb-1 text-xs font-medium text-gray-900">
              특이사항
            </label>
            <textarea
              name="note"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              rows={3}
              placeholder="특이사항을 입력하세요"
              value={formData.note || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-xs font-medium"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs"
              disabled={loading}
            >
              {loading ? '저장 중...' : (editingId ? '수정' : '등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 