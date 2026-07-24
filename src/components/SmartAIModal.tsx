import React, { useState } from 'react';
import { CMMData } from '../types';
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  onApplyAiParsedData: (data: CMMData) => void;
}

export const SmartAIModal: React.FC<SmartAIModalProps> = ({
  isOpen,
  onClose,
  rawText,
  onApplyAiParsedData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiParse = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/parse-cmm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI 파싱 실패');
      }

      const parsed = json.data;

      // Transform raw JSON to CMMData model
      const items = (parsed.items || []).map((item: any, idx: number) => ({
        id: `item-ai-${idx + 1}`,
        elementName: item.elementName || '일반 요소',
        feature: item.feature || 'X',
        featureType: item.featureType || 'X',
        nominal: item.nominal !== undefined ? item.nominal : null,
        actual: item.actual !== undefined ? item.actual : null,
        deviation: item.deviation !== undefined ? item.deviation : null,
        upperTol: item.upperTol !== undefined ? item.upperTol : null,
        lowerTol: item.lowerTol !== undefined ? item.lowerTol : null,
        judgment: item.judgment === 'NG' ? 'NG' : 'OK'
      }));

      let ok = 0, ng = 0;
      items.forEach((i: any) => {
        if (i.judgment === 'OK') ok++;
        if (i.judgment === 'NG') ng++;
      });

      const passRate = items.length > 0 ? parseFloat(((ok / items.length) * 100).toFixed(1)) : 0;

      const fullCmmData: CMMData = {
        metadata: {
          programName: parsed.metadata?.programName || 'AI_Parsed_CMM.dms',
          date: parsed.metadata?.date || new Date().toISOString().split('T')[0],
          author: parsed.metadata?.author || 'AI Assistant',
          unit: parsed.metadata?.unit || 'mm',
          partName: parsed.metadata?.partName || '',
          partNumber: parsed.metadata?.partNumber || ''
        },
        datums: parsed.datums || [],
        items: items,
        summary: {
          totalCount: items.length,
          okCount: ok,
          ngCount: ng,
          warnCount: 0,
          passRate,
          avgToleranceUsagePercent: 0
        },
        unparsedLines: []
      };

      onApplyAiParsedData(fullCmmData);
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error('AI Parse failure:', err);
      setError(err.message || 'Gemini AI 파싱 요청 중 오류가 발생하였습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Gemini AI 스마트 텍스트 복원 & 파싱</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          손상되거나 표준 형식을 벗어난 비정형 CMM 출력 텍스트를 Gemini AI 모델이 심층 정교하게 분석하여 메타데이터, 원점 정보 및 치수별 공차 테이블로 자동 구조화합니다.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
          {rawText || '분석할 텍스트가 없습니다.'}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            취소
          </button>

          <button
            onClick={handleRunAiParse}
            disabled={loading || !rawText.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 파싱 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>AI 스마트 구조화 시작</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
