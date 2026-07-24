import React, { useState } from 'react';
import { SAMPLE_CMM_REPORTS, SampleReport } from '../data/sampleCMMData';
import { CMMData } from '../types';
import { parseCMMText } from '../utils/cmmParser';
import { 
  FileCode, 
  Sparkles, 
  Play, 
  ClipboardCheck, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';

interface InputParserSectionProps {
  rawText: string;
  setRawText: (text: string) => void;
  cmmData: CMMData;
  setCmmData: (data: CMMData) => void;
  onProceedToEditor: () => void;
  setIsAiModalOpen: (open: boolean) => void;
}

export const InputParserSection: React.FC<InputParserSectionProps> = ({
  rawText,
  setRawText,
  cmmData,
  setCmmData,
  onProceedToEditor,
  setIsAiModalOpen
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessMessage, setParseSuccessMessage] = useState<string | null>(null);

  const handleLoadSample = (sample: SampleReport) => {
    setSelectedSampleId(sample.id);
    setRawText(sample.rawText);
    const parsed = parseCMMText(sample.rawText);
    setCmmData(parsed);
    setParseSuccessMessage(`'${sample.title}' 샘플 데이터를 불러왔습니다. (${parsed.items.length}개 측정 항목 추출 완료)`);
    setTimeout(() => setParseSuccessMessage(null), 4000);
  };

  const handleParse = () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const parsed = parseCMMText(rawText);
      setCmmData(parsed);
      setIsParsing(false);
      setParseSuccessMessage(`파싱 완료: ${parsed.items.length}개 측정 항목 및 ${parsed.datums.length}개 원점 정보를 추출하였습니다.`);
      setTimeout(() => setParseSuccessMessage(null), 4000);
    }, 200);
  };

  const lineCount = rawText ? rawText.split('\n').length : 0;

  return (
    <div className="space-y-6">
      {/* Banner / Instructions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
                <FileCode className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">CMM 텍스트 리포트 입력 및 자동 파싱</h2>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              3차원 측정기(CMM)에서 출력된 텍스트 결과(PC-DMIS, ZEISS, Mitutoyo 등)를 아래 창에 붙여넣으세요. 
              요소이름, 공칭치수(Nominal), 실측치수(Actual), 편차(Deviation), 공차 범위를 정교한 정규표현식으로 자동 구조화합니다.
            </p>
          </div>

          {/* Quick AI Smart Repair */}
          <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-blue-500/30">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300 block">AI 스마트 파싱 어시스턴트</span>
              <span className="text-slate-400">비정형 텍스트/복잡한 서식 자동 교정</span>
            </div>
            <button
              onClick={() => setIsAiModalOpen(true)}
              disabled={!rawText.trim()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition disabled:opacity-40"
            >
              AI 분석 실행
            </button>
          </div>
        </div>

        {/* Sample Selectors */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>원클릭 테스트용 CMM 성적서 샘플:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_CMM_REPORTS.map(sample => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedSampleId === sample.id
                    ? 'bg-blue-600/20 border-blue-500/60 ring-1 ring-blue-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-blue-300 truncate">{sample.title.split(':')[0]}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {sample.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{sample.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Text Input & Live Output Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Textarea */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>CMM 측정 원본 텍스트 붙여넣기</span>
              </label>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                총 {lineCount} 줄
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`CMM 측정기 리포트 텍스트 전체를 복사하여 이곳에 붙여넣으세요...

예시:
[원 2]
X      50.000   50.023   +0.023   0.050   -0.050   OK
Y      25.000   24.985   -0.015   0.050   -0.050   OK
지름   10.000   10.012   +0.012   0.020   -0.020   OK`}
              className="w-full h-80 p-4 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y leading-relaxed"
            />
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setRawText('');
                setCmmData({
                  metadata: { programName: '', date: '', author: '', unit: 'mm' },
                  datums: [],
                  items: [],
                  summary: { totalCount: 0, okCount: 0, ngCount: 0, warnCount: 0, passRate: 0, avgToleranceUsagePercent: 0 },
                  unparsedLines: []
                });
                setSelectedSampleId('');
              }}
              disabled={!rawText}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition disabled:opacity-40"
            >
              텍스트 비우기
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleParse}
                disabled={!rawText.trim() || isParsing}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isParsing ? '파싱 분석 중...' : '자동 파싱 실행'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Parsed Data Live Extraction Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                <span>파싱 구조화 요약</span>
              </h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                cmmData.items.length > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {cmmData.items.length > 0 ? '구조화 성공' : '대기 중'}
              </span>
            </div>

            {parseSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{parseSuccessMessage}</span>
              </div>
            )}

            {cmmData.items.length > 0 ? (
              <div className="space-y-4">
                {/* Metadata cards */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                  <div className="text-slate-600 dark:text-slate-400 font-bold mb-1">📋 측정 메타데이터</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-mono">
                    <div><span className="text-slate-600 dark:text-slate-400">프로그램:</span> {cmmData.metadata.programName}</div>
                    <div><span className="text-slate-600 dark:text-slate-400">일자:</span> {cmmData.metadata.date}</div>
                    <div><span className="text-slate-600 dark:text-slate-400">작성자:</span> {cmmData.metadata.author}</div>
                    <div><span className="text-slate-600 dark:text-slate-400">단위:</span> {cmmData.metadata.unit}</div>
                  </div>
                </div>

                {/* Datums card */}
                {cmmData.datums.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                    <div className="text-slate-600 dark:text-slate-400 font-bold mb-1">🎯 원점(Datum) 기준</div>
                    <div className="space-y-1 text-slate-700 dark:text-slate-300">
                      {cmmData.datums.map((d, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded text-[10px]">
                            {d.code}
                          </span>
                          <span>{d.name} {d.description ? `(${d.description})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Count Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-medium">총 측정 항목</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{cmmData.summary.totalCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">합격 (OK)</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{cmmData.summary.okCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                    <span className="text-[10px] text-red-600 dark:text-red-400 block font-medium">불합격 (NG)</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{cmmData.summary.ngCount}</span>
                  </div>
                </div>

                {cmmData.unparsedLines.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>미분류 라인 {cmmData.unparsedLines.length}개 존재</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 text-xs text-center space-y-3">
                <Info className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                <p>
                  왼쪽 창에 CMM 원본 리포트를 붙여넣고<br />
                  <strong className="text-slate-700 dark:text-slate-300">'자동 파싱 실행'</strong>을 누르거나 샘플을 선택하세요.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={onProceedToEditor}
              disabled={cmmData.items.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>2단계: 데이터 검수 & 테이블 편집으로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
