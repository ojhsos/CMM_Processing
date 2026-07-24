import React from 'react';
import { ViewMode, CMMData } from '../types';
import { 
  FileText, 
  Table, 
  BarChart3, 
  Printer, 
  Download, 
  Copy, 
  RotateCcw, 
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { exportToExcel, copyTableToClipboard } from '../utils/excelExport';

interface HeaderProps {
  currentView: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  cmmData: CMMData;
  onReset: () => void;
  onCopySuccess: () => void;
  unparsedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setViewMode,
  cmmData,
  onReset,
  onCopySuccess,
  unparsedCount
}) => {
  const { summary } = cmmData;

  const handleCopy = async () => {
    try {
      await copyTableToClipboard(cmmData);
      onCopySuccess();
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleExcelExport = () => {
    exportToExcel(cmmData);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-100">CMM 측정 데이터 분석 웹앱</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v1.0 QA
                </span>
              </div>
              <p className="text-xs text-slate-400">3차원 측정 리포트 자동 파싱 · 정밀도 시각화 · 공차 분석</p>
            </div>
          </div>

          {/* Navigation Steps */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('input')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'input'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. 입력 & 파싱</span>
              {unparsedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  {unparsedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'editor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>2. 데이터 검수 & 편집</span>
              {summary.totalCount > 0 && (
                <span className="flex items-center space-x-1 px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded-full">
                  <span>{summary.totalCount}항목</span>
                  {summary.ngCount > 0 && (
                    <span className="text-red-400 font-bold">({summary.ngCount} NG)</span>
                  )}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>3. 분석 대시보드</span>
              {summary.passRate > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  summary.ngCount === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {summary.passRate}%
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('report')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'report'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>4. 검사 성적서</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={summary.totalCount === 0}
              title="클립보드로 복사 (엑셀 붙여넣기용)"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">복사</span>
            </button>

            <button
              onClick={handleExcelExport}
              disabled={summary.totalCount === 0}
              title="엑셀 파일 (.xlsx) 내보내기"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>엑셀 다운로드</span>
            </button>

            <button
              onClick={onReset}
              title="데이터 초기화"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('input')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${currentView === 'input' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>입력</span>
          </button>
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${currentView === 'editor' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>편집</span>
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${currentView === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>대시보드</span>
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${currentView === 'report' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>성적서</span>
          </button>
        </div>
      </div>
    </header>
  );
};
