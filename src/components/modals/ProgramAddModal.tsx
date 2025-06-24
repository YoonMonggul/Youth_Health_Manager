import React from 'react';
import { X } from 'lucide-react';
import { ProgramTrendType } from '@/models/program';

interface ProgramAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; description?: string; trendType: ProgramTrendType }) => Promise<void>;
  editingId: number | null;
  initialData?: {
    name?: string;
    description?: string;
    trendType?: ProgramTrendType;
  };
}

export default function ProgramAddModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  initialData
}: ProgramAddModalProps) {
  // 프로그램 정보 상태
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    trendType: ProgramTrendType.BMI
  });

  // 모달 열릴 때 초기값 세팅
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        trendType: initialData.trendType || ProgramTrendType.BMI
      });
    }
    if (isOpen && !editingId) {
      setFormData({ name: '', description: '', trendType: ProgramTrendType.BMI });
    }
  }, [isOpen, initialData, editingId]);

  // 입력값 변경 핸들러
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // 제출 핸들러
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) {
      alert('프로그램명을 입력하세요.');
      return;
    }
    await onSubmit({
      ...formData
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-3xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? '프로그램 수정' : '프로그램 등록'}
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
          {/* 프로그램 정보 입력 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">프로그램명</label>
              <input
                name="name"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="프로그램명을 입력하세요"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-900">설명 (선택)</label>
              <input
                name="description"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                placeholder="설명을 입력하세요"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* 변화율 파라메터 드롭다운 */}
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">변화율 파라메터</label>
            <select
              name="trendType"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              value={formData.trendType}
              onChange={handleInputChange}
            >
              <option value={ProgramTrendType.BMI}>BMI</option>
              <option value={ProgramTrendType.WAIST}>허리둘레</option>
            </select>
          </div>
          {/* 학생 선택 UI는 제거됨 */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 text-center"
            >
              {editingId ? '수정' : '등록'}
            </button>
            <button
              type="button"
              className="ml-2 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-xs font-medium px-4 py-2"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 