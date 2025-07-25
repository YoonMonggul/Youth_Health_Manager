import React, { useState } from 'react';

interface ScheduleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { title: string; startDate: string; endDate: string; note?: string }) => Promise<void>;
}

export default function ScheduleAddModal({ isOpen, onClose, onSubmit }: ScheduleAddModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  // 입력값 변경 핸들러
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // 폼 제출
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('일정명, 시작일, 종료일을 모두 입력하세요.');
      return;
    }
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    setFormData({ title: '', startDate: '', endDate: '', note: '' });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 pointer-events-auto">
        <h2 className="text-lg font-bold mb-4">일정 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">일정명 *</label>
            <input name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2 text-sm" required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">시작일 *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border rounded p-2 text-sm" required />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">종료일 *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border rounded p-2 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">메모</label>
            <textarea name="note" value={formData.note} onChange={handleChange} className="w-full border rounded p-2 text-sm" rows={2} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs bg-gray-200 rounded">취소</button>
            <button type="submit" className="px-4 py-2 text-xs bg-blue-600 text-white rounded" disabled={loading}>{loading ? '등록 중...' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 