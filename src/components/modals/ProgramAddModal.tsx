import React, { useState } from 'react';

interface ProgramAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; startDate: string; endDate: string; description?: string }) => void;
}

export default function ProgramAddModal({ isOpen, onClose, onSubmit }: ProgramAddModalProps) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      alert('프로그램명, 시작일, 종료일을 입력하세요.');
      return;
    }
    onSubmit(form);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-md mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">프로그램 등록</h3>
          <button type="button" className="text-gray-400 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto" onClick={onClose}>
            <span className="text-xl">×</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3">
            <label className="block mb-1 text-xs font-medium text-gray-900">프로그램명</label>
            <input name="name" type="text" className="w-full border rounded px-2 py-1 text-sm" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-xs font-medium text-gray-900">시작일</label>
              <input name="startDate" type="date" className="w-full border rounded px-2 py-1 text-sm" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-xs font-medium text-gray-900">종료일</label>
              <input name="endDate" type="date" className="w-full border rounded px-2 py-1 text-sm" value={form.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="block mb-1 text-xs font-medium text-gray-900">설명 (선택)</label>
            <textarea name="description" className="w-full border rounded px-2 py-1 text-sm" rows={2} value={form.description} onChange={handleChange} />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-medium">등록</button>
            <button type="button" className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-xs font-medium border" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
} 