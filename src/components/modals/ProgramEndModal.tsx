import React from 'react';
import { X } from 'lucide-react';

interface ProgramStart {
  id: number;
  program: { id: number; name: string };
  startDate: string;
  endDate: string;
}

interface ProgramEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { programStartId: number; reason: string }) => Promise<void>;
  programStarts: ProgramStart[];
}

export default function ProgramEndModal({ isOpen, onClose, onSubmit, programStarts }: ProgramEndModalProps) {
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
      setReason('');
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      alert('종료할 프로그램을 선택하세요.');
      return;
    }
    setLoading(true);
    await onSubmit({ programStartId: selectedId, reason });
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-lg shadow w-full max-w-2xl mx-4 pointer-events-auto">
        <div className="flex items-start justify-between p-3 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900">프로그램 종료</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">종료할 프로그램 선택</label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              value={selectedId ?? ''}
              onChange={e => setSelectedId(Number(e.target.value))}
              required
            >
              <option value="">프로그램을 선택하세요</option>
              {programStarts.map(ps => (
                <option key={ps.id} value={ps.id}>{ps.program.name} ({ps.startDate}~{ps.endDate})</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-xs font-medium text-gray-900">종료 사유 (선택)</label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="종료 사유를 입력하세요"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-4 py-2 text-center"
              disabled={loading}
            >
              {loading ? '종료 중...' : '종료'}
            </button>
            <button
              type="button"
              className="ml-2 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-xs font-medium px-4 py-2"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 