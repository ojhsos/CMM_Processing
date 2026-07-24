import React from 'react';
import { X, AlertCircle, Plus } from 'lucide-react';
import { CMMData, MeasurementItem } from '../types';

interface UnparsedLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unparsedLines: { lineNumber: number; content: string }[];
  setCmmData: React.Dispatch<React.SetStateAction<CMMData>>;
}

export const UnparsedLinesModal: React.FC<UnparsedLinesModalProps> = ({
  isOpen,
  onClose,
  unparsedLines,
  setCmmData
}) => {
  if (!isOpen) return null;

  const handleConvertLineToItem = (lineContent: string) => {
    // Convert unparsed line into a custom item
    const newItem: MeasurementItem = {
      id: `item-converted-${Date.now()}`,
      elementName: '미분류 수동변환',
      feature: lineContent.substring(0, 10),
      featureType: '기타',
      nominal: 0,
      actual: 0,
      deviation: 0,
      upperTol: 0.05,
      lowerTol: -0.05,
      judgment: 'OK',
      rawLine: lineContent
    };

    setCmmData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      unparsedLines: prev.unparsedLines.filter(l => l.content !== lineContent)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">미분류 원본 텍스트 라인 검수</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          표준 구문 파서에 의해 자동 변환되지 않은 원본 라인들입니다. 필요한 경우 수동 항목으로 변환할 수 있습니다.
        </p>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 max-h-80 overflow-y-auto space-y-2 font-mono text-xs">
          {unparsedLines.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              미분류된 라인이 없습니다. 모든 데이터가 깔끔하게 추출되었습니다!
            </div>
          ) : (
            unparsedLines.map((line, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-slate-700">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 text-[10px]">Line {line.lineNumber}</span>
                  <span className="text-slate-200">{line.content}</span>
                </div>
                <button
                  onClick={() => handleConvertLineToItem(line.content)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded text-[10px] font-semibold transition shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>항목으로 변환</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
