import React from 'react';
import { CMMData } from '../types';
import { Printer, Download, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

interface PrintReportViewProps {
  cmmData: CMMData;
  onBack: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ cmmData, onBack }) => {
  const { metadata, datums, items, summary } = cmmData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-printable Action Controls */}
      <div className="print:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전 화면으로</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportToExcel(cmmData)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>엑셀 다운로드</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>성적서 인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>

      {/* Official CMM Inspection Certificate Paper Layout */}
      <div className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 shadow-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 font-sans">
        {/* Header Title */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
            측 정 검 사 성 적 서
          </h1>
          <p className="text-xs text-slate-500 mt-1">CMM PRECISION INSPECTION CERTIFICATE REPORT</p>
        </div>

        {/* Metadata & Approval Stamp Table Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6 text-xs border border-slate-900 rounded">
          {/* Metadata */}
          <div className="col-span-8 p-3 space-y-1.5 border-r border-slate-900">
            <div className="flex"><span className="w-24 font-bold text-slate-700">프로그램명:</span> <span>{metadata.programName}</span></div>
            <div className="flex"><span className="w-24 font-bold text-slate-700">측정 일자:</span> <span>{metadata.date}</span></div>
            <div className="flex"><span className="w-24 font-bold text-slate-700">작성자 / 검사:</span> <span>{metadata.author}</span></div>
            <div className="flex"><span className="w-24 font-bold text-slate-700">측정 단위:</span> <span>{metadata.unit}</span></div>
            {metadata.partName && (
              <div className="flex"><span className="w-24 font-bold text-slate-700">부 품 명:</span> <span>{metadata.partName}</span></div>
            )}
          </div>

          {/* Signatures / Approval Box */}
          <div className="col-span-4 p-2 flex flex-col justify-between text-center font-bold">
            <span className="text-[10px] text-slate-500">품질보증 승인 (Sign-off)</span>
            <div className="grid grid-cols-3 border border-slate-300 rounded divide-x divide-slate-300 my-1 text-[10px]">
              <div className="py-1">작성<br /><span className="font-normal text-slate-600">{metadata.author}</span></div>
              <div className="py-1">검토<br /><span className="font-normal text-slate-600">QA리더</span></div>
              <div className="py-1">승인<br /><span className="font-normal text-slate-600">팀장</span></div>
            </div>
            <span className="text-[10px] text-emerald-600">최종판정: {summary.ngCount === 0 ? '합격 (PASSED)' : '불합격 (REJECTED)'}</span>
          </div>
        </div>

        {/* Datums Info */}
        {datums.length > 0 && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-300 rounded text-xs space-y-1">
            <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1 mb-1">
              [원점 (Datum) 설정]
            </span>
            <div className="grid grid-cols-3 gap-2">
              {datums.map((d, i) => (
                <div key={i} className="font-mono">
                  <strong className="text-blue-700">{d.code}:</strong> {d.name} {d.description ? `(${d.description})` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-900 font-bold text-center">
                <th className="p-2 border-r border-slate-300">#</th>
                <th className="p-2 border-r border-slate-300 text-left">요소 이름</th>
                <th className="p-2 border-r border-slate-300 text-left">특성</th>
                <th className="p-2 border-r border-slate-300 text-right">공칭치수</th>
                <th className="p-2 border-r border-slate-300 text-right">실측치수</th>
                <th className="p-2 border-r border-slate-300 text-right">편차</th>
                <th className="p-2 border-r border-slate-300 text-right">공차(+)</th>
                <th className="p-2 border-r border-slate-300 text-right">공차(-)</th>
                <th className="p-2 text-center">판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-mono text-[11px]">
              {items.map((item, idx) => (
                <tr key={item.id} className={item.judgment === 'NG' ? 'bg-red-50 font-bold' : ''}>
                  <td className="p-2 text-center border-r border-slate-300">{idx + 1}</td>
                  <td className="p-2 font-sans font-bold border-r border-slate-300">{item.elementName}</td>
                  <td className="p-2 border-r border-slate-300">{item.feature}</td>
                  <td className="p-2 text-right border-r border-slate-300">{item.nominal ?? '-'}</td>
                  <td className="p-2 text-right border-r border-slate-300 font-bold">{item.actual ?? '-'}</td>
                  <td className="p-2 text-right border-r border-slate-300">
                    {item.deviation !== null ? (item.deviation >= 0 ? `+${item.deviation.toFixed(3)}` : item.deviation.toFixed(3)) : '-'}
                  </td>
                  <td className="p-2 text-right border-r border-slate-300">
                    {item.upperTol !== null ? `+${Math.abs(item.upperTol)}` : '-'}
                  </td>
                  <td className="p-2 text-right border-r border-slate-300">
                    {item.lowerTol !== null ? `-${Math.abs(item.lowerTol)}` : '-'}
                  </td>
                  <td className="p-2 text-center font-bold font-sans">
                    <span className={item.judgment === 'OK' ? 'text-emerald-700' : 'text-red-600'}>
                      {item.judgment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer Box */}
        <div className="p-4 bg-slate-50 border border-slate-900 rounded grid grid-cols-4 gap-4 text-xs text-center font-mono">
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">총 측정 항목</span>
            <span className="font-bold text-sm text-slate-800">{summary.totalCount} EA</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">합격 (OK)</span>
            <span className="font-bold text-sm text-emerald-700">{summary.okCount} EA</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">불합격 (NG)</span>
            <span className="font-bold text-sm text-red-600">{summary.ngCount} EA</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">최종 합격률</span>
            <span className="font-bold text-sm text-blue-700">{summary.passRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
