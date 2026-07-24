import React, { useState, useEffect } from 'react';
import { ViewMode, CMMData } from './types';
import { SAMPLE_CMM_REPORTS } from './data/sampleCMMData';
import { parseCMMText } from './utils/cmmParser';
import { Header } from './components/Header';
import { InputParserSection } from './components/InputParserSection';
import { DataTableEditor } from './components/DataTableEditor';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { PrintReportView } from './components/PrintReportView';
import { SmartAIModal } from './components/SmartAIModal';
import { UnparsedLinesModal } from './components/UnparsedLinesModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('input');

  // Initialize with Sample 1 (Engine Block from PRD)
  const defaultSample = SAMPLE_CMM_REPORTS[0];
  const [rawText, setRawText] = useState<string>(defaultSample.rawText);
  const [cmmData, setCmmData] = useState<CMMData>(() => parseCMMText(defaultSample.rawText));

  // Modals & Notifications
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUnparsedModalOpen, setIsUnparsedModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleReset = () => {
    setRawText('');
    setCmmData({
      metadata: { programName: '', date: '', author: '', unit: 'mm' },
      datums: [],
      items: [],
      summary: {
        totalCount: 0,
        okCount: 0,
        ngCount: 0,
        warnCount: 0,
        passRate: 0,
        avgToleranceUsagePercent: 0
      },
      unparsedLines: []
    });
    setCurrentView('input');
    triggerToast('데이터가 초기화되었습니다.');
  };

  return (
    <div className="min-[#100vh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        currentView={currentView}
        setViewMode={setCurrentView}
        cmmData={cmmData}
        onReset={handleReset}
        onCopySuccess={() => triggerToast('테이블 데이터가 클립보드에 복사되었습니다! (엑셀에서 바로 붙여넣기 가능)')}
        unparsedCount={cmmData.unparsedLines.length}
      />

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'input' && (
          <InputParserSection
            rawText={rawText}
            setRawText={setRawText}
            cmmData={cmmData}
            setCmmData={setCmmData}
            onProceedToEditor={() => setCurrentView('editor')}
            setIsAiModalOpen={setIsAiModalOpen}
          />
        )}

        {currentView === 'editor' && (
          <DataTableEditor
            cmmData={cmmData}
            setCmmData={setCmmData}
            onProceedToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <AnalysisDashboard cmmData={cmmData} />
        )}

        {currentView === 'report' && (
          <PrintReportView
            cmmData={cmmData}
            onBack={() => setCurrentView('editor')}
          />
        )}
      </main>

      {/* AI Smart Parsing Modal */}
      <SmartAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        rawText={rawText}
        onApplyAiParsedData={data => {
          setCmmData(data);
          triggerToast('AI 스마트 구조화 분석이 완료되었습니다!');
        }}
      />

      {/* Unparsed Lines Inspection Modal */}
      <UnparsedLinesModal
        isOpen={isUnparsedModalOpen}
        onClose={() => setIsUnparsedModalOpen(false)}
        unparsedLines={cmmData.unparsedLines}
        setCmmData={setCmmData}
      />
    </div>
  );
}
