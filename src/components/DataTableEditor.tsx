import React, { useState } from 'react';
import { CMMData, MeasurementItem, DimensionType, JudgmentType } from '../types';
import { recalculateItem } from '../utils/cmmParser';
import { 
  Table as TableIcon, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown,
  Edit3,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface DataTableEditorProps {
  cmmData: CMMData;
  setCmmData: React.Dispatch<React.SetStateAction<CMMData>>;
  onProceedToDashboard: () => void;
}

const DIMENSION_TYPES: DimensionType[] = [
  'X',
  'Y',
  'Z',
  '지름',
  '반경',
  '위치도',
  '평탄도',
  '직각도',
  '동축도',
  '동심도',
  '거리',
  '기타'
];

export const DataTableEditor: React.FC<DataTableEditorProps> = ({
  cmmData,
  setCmmData,
  onProceedToDashboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [judgmentFilter, setJudgmentFilter] = useState<'ALL' | 'OK' | 'NG' | 'WARN'>('ALL');
  const [selectedElementFilter, setSelectedElementFilter] = useState<string>('ALL');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  // Unique list of Element Names for filtering
  const uniqueElements = Array.from(new Set(cmmData.items.map(i => i.elementName)));

  // Recalculate all items automatically
  const handleRecalculateAll = () => {
    const updatedItems = cmmData.items.map(recalculateItem);
    
    // Recalculate summary
    let ok = 0, ng = 0, warn = 0;
    updatedItems.forEach(item => {
      if (item.judgment === 'OK') ok++;
      if (item.judgment === 'NG') ng++;
      if (item.judgment === 'WARN' || item.isMathMismatch) warn++;
    });

    const passRate = updatedItems.length > 0 ? parseFloat(((ok / updatedItems.length) * 100).toFixed(1)) : 0;

    setCmmData(prev => ({
      ...prev,
      items: updatedItems,
      summary: {
        ...prev.summary,
        okCount: ok,
        ngCount: ng,
        warnCount: warn,
        passRate
      }
    }));
  };

  // Inline cell edit handler
  const handleItemChange = (id: string, field: keyof MeasurementItem, value: any) => {
    setCmmData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return recalculateItem(updated);
      });

      // Recalculate summary metrics
      let ok = 0, ng = 0, warn = 0;
      newItems.forEach(i => {
        if (i.judgment === 'OK') ok++;
        if (i.judgment === 'NG') ng++;
        if (i.judgment === 'WARN' || i.isMathMismatch) warn++;
      });

      return {
        ...prev,
        items: newItems,
        summary: {
          ...prev.summary,
          okCount: ok,
          ngCount: ng,
          warnCount: warn,
          passRate: newItems.length > 0 ? parseFloat(((ok / newItems.length) * 100).toFixed(1)) : 0
        }
      };
    });
  };

  const handleDeleteItem = (id: string) => {
    setCmmData(prev => {
      const filtered = prev.items.filter(i => i.id !== id);
      let ok = 0, ng = 0, warn = 0;
      filtered.forEach(i => {
        if (i.judgment === 'OK') ok++;
        if (i.judgment === 'NG') ng++;
        if (i.judgment === 'WARN' || i.isMathMismatch) warn++;
      });
      return {
        ...prev,
        items: filtered,
        summary: {
          ...prev.summary,
          totalCount: filtered.length,
          okCount: ok,
          ngCount: ng,
          warnCount: warn,
          passRate: filtered.length > 0 ? parseFloat(((ok / filtered.length) * 100).toFixed(1)) : 0
        }
      };
    });
  };

  const handleAddNewItem = () => {
    const newItem: MeasurementItem = {
      id: `item-user-${Date.now()}`,
      elementName: '신규 요소',
      feature: 'X',
      featureType: 'X',
      nominal: 0,
      actual: 0,
      deviation: 0,
      upperTol: 0.05,
      lowerTol: -0.05,
      judgment: 'OK'
    };

    setCmmData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      summary: {
        ...prev.summary,
        totalCount: prev.items.length + 1
      }
    }));
  };

  // Filter items
  const filteredItems = cmmData.items.filter(item => {
    const matchesSearch = 
      item.elementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.featureType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJudgment = 
      judgmentFilter === 'ALL' ||
      (judgmentFilter === 'OK' && item.judgment === 'OK') ||
      (judgmentFilter === 'NG' && item.judgment === 'NG') ||
      (judgmentFilter === 'WARN' && item.isMathMismatch);

    const matchesElement = selectedElementFilter === 'ALL' || item.elementName === selectedElementFilter;

    return matchesSearch && matchesJudgment && matchesElement;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-blue-600" />
              <span>측정 데이터 검수 및 수동 보정 (Spreadsheet Editor)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              자동 파싱된 셀의 수치를 수정하거나 치수종류(원, 위치도, 평면 등)를 변경하면 편차 및 OK/NG 판정이 실시간 업데이트됩니다.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRecalculateAll}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
              title="모든 항목의 편차 및 공차 판정을 즉시 재계산합니다"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>자동 편차/판정 재계산</span>
            </button>

            <button
              onClick={handleAddNewItem}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>항목 수동 추가</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="요소명, 특성 검색..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Element Name filter */}
          <div className="sm:col-span-4 flex items-center space-x-2">
            <span className="text-xs text-slate-400 shrink-0">요소:</span>
            <select
              value={selectedElementFilter}
              onChange={e => setSelectedElementFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">전체 요소 ({uniqueElements.length}개)</option>
              {uniqueElements.map(elem => (
                <option key={elem} value={elem}>{elem}</option>
              ))}
            </select>
          </div>

          {/* Judgment Filter pills */}
          <div className="sm:col-span-4 flex items-center justify-end space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setJudgmentFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                judgmentFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              전체 ({cmmData.items.length})
            </button>
            <button
              onClick={() => setJudgmentFilter('OK')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                judgmentFilter === 'OK' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              OK ({cmmData.summary.okCount})
            </button>
            <button
              onClick={() => setJudgmentFilter('NG')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                judgmentFilter === 'NG' ? 'bg-red-600 text-white shadow-sm' : 'text-red-600 dark:text-red-400 hover:bg-red-500/10'
              }`}
            >
              NG ({cmmData.summary.ngCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Spreadsheet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">요소 이름 (Element)</th>
                <th className="py-3.5 px-4">측정 특성 (Feature)</th>
                <th className="py-3.5 px-4">치수 종류</th>
                <th className="py-3.5 px-4 text-right">공칭치수 (Nominal)</th>
                <th className="py-3.5 px-4 text-right">실측치수 (Actual)</th>
                <th className="py-3.5 px-4 text-right">편차 (Deviation)</th>
                <th className="py-3.5 px-4 text-right">공차(+)</th>
                <th className="py-3.5 px-4 text-right">공차(-)</th>
                <th className="py-3.5 px-4 text-center">판정</th>
                <th className="py-3.5 px-4 text-center w-16">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    조건에 부합하는 측정 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isNg = item.judgment === 'NG';
                  const isWarn = item.isMathMismatch;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isNg ? 'bg-red-500/5 dark:bg-red-950/20' : isWarn ? 'bg-amber-500/5 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2.5 px-4 text-center text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Element Name */}
                      <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="text"
                          value={item.elementName}
                          onChange={e => handleItemChange(item.id, 'elementName', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs"
                        />
                      </td>

                      {/* Feature */}
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        <input
                          type="text"
                          value={item.feature}
                          onChange={e => handleItemChange(item.id, 'feature', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs"
                        />
                      </td>

                      {/* Dimension Type Dropdown */}
                      <td className="py-2.5 px-4">
                        <select
                          value={item.featureType}
                          onChange={e => handleItemChange(item.id, 'featureType', e.target.value as DimensionType)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {DIMENSION_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </td>

                      {/* Nominal */}
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          step="0.001"
                          value={item.nominal ?? ''}
                          onChange={e => handleItemChange(item.id, 'nominal', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-20 text-right bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs"
                        />
                      </td>

                      {/* Actual */}
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        <input
                          type="number"
                          step="0.001"
                          value={item.actual ?? ''}
                          onChange={e => handleItemChange(item.id, 'actual', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-20 text-right bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs font-bold"
                        />
                      </td>

                      {/* Deviation */}
                      <td className={`py-2.5 px-4 text-right font-bold ${
                        item.deviation !== null && item.deviation > 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : item.deviation !== null && item.deviation < 0 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-slate-500'
                      }`}>
                        <div className="flex items-center justify-end space-x-1">
                          {isWarn && (
                            <span title="실측치 - 공칭치 != 편차 불일치 경고">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />
                            </span>
                          )}
                          <span>
                            {item.deviation !== null 
                              ? (item.deviation >= 0 ? `+${item.deviation.toFixed(3)}` : item.deviation.toFixed(3)) 
                              : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Upper Tol */}
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        <input
                          type="number"
                          step="0.001"
                          value={item.upperTol ?? ''}
                          onChange={e => handleItemChange(item.id, 'upperTol', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-16 text-right bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
                        />
                      </td>

                      {/* Lower Tol */}
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        <input
                          type="number"
                          step="0.001"
                          value={item.lowerTol ?? ''}
                          onChange={e => handleItemChange(item.id, 'lowerTol', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-16 text-right bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs text-amber-600 dark:text-amber-400 font-semibold"
                        />
                      </td>

                      {/* Judgment */}
                      <td className="py-2.5 px-4 text-center">
                        <select
                          value={item.judgment}
                          onChange={e => handleItemChange(item.id, 'judgment', e.target.value as JudgmentType)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            item.judgment === 'OK' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                          }`}
                        >
                          <option value="OK">OK</option>
                          <option value="NG">NG</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-4">
            <span>표시 항목: <strong>{filteredItems.length}</strong> / 전체 {cmmData.items.length}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">OK: {cmmData.summary.okCount}건</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">NG: {cmmData.summary.ngCount}건</span>
          </div>

          <button
            onClick={onProceedToDashboard}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <span>3단계: 시각화 대시보드로 이동</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
