import React, { useState } from 'react';
import { CMMData, MeasurementItem } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PieChart,
  Pie
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Sliders,
  Filter,
  Maximize2
} from 'lucide-react';

interface AnalysisDashboardProps {
  cmmData: CMMData;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ cmmData }) => {
  const { items, summary, metadata } = cmmData;
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>('ALL');

  // Filtered items for charts
  const chartItems = items.filter(item => {
    if (selectedDimensionFilter === 'ALL') return true;
    return item.featureType === selectedDimensionFilter;
  });

  // Prepare chart dataset for Deviation Chart
  const deviationChartData = chartItems.map(item => {
    const uTol = item.upperTol !== null ? Math.abs(item.upperTol) : 0.05;
    const lTol = item.lowerTol !== null ? (item.lowerTol < 0 ? item.lowerTol : -item.lowerTol) : -0.05;

    return {
      id: item.id,
      name: `${item.elementName}-${item.feature}`,
      elementName: item.elementName,
      feature: item.feature,
      deviation: item.deviation ?? 0,
      upperTol: uTol,
      lowerTol: lTol,
      nominal: item.nominal,
      actual: item.actual,
      judgment: item.judgment,
      // Status color flag
      isNg: item.judgment === 'NG',
      isWarning: item.judgment === 'OK' && item.deviation !== null && Math.abs(item.deviation) >= Math.min(Math.abs(uTol), Math.abs(lTol)) * 0.8
    };
  });

  // Prepare Pie Chart data (OK vs NG)
  const pieData = [
    { name: '합격 (OK)', value: summary.okCount, color: '#10B981' },
    { name: '불합격 (NG)', value: summary.ngCount, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // Dimension Type Count Breakdown
  const typeCounts: Record<string, number> = {};
  items.forEach(item => {
    typeCounts[item.featureType] = (typeCounts[item.featureType] || 0) + 1;
  });
  const typeBreakdownData = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate KPI */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">검사 합격률 (Pass Rate)</span>
            <div className={`p-2 rounded-xl ${summary.ngCount === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{summary.passRate}%</span>
            <span className="text-xs text-slate-500">({summary.okCount}/{summary.totalCount} 항목)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.ngCount === 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${summary.passRate}%` }}
            />
          </div>
        </div>

        {/* Total & NG Items */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">측정 항목 현황</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalCount}</span>
              <span className="text-xs text-slate-500 block">전체 검사특성</span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${summary.ngCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {summary.ngCount}
              </span>
              <span className="text-xs text-slate-500 block">불합격 (NG)</span>
            </div>
          </div>
        </div>

        {/* Max Positive Deviation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">최대 상한(+) 편차</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {summary.maxPositiveDevItem ? `+${summary.maxPositiveDevItem.val.toFixed(3)}` : '-'}
            </span>
            <span className="text-xs text-slate-500 block truncate mt-0.5">
              {summary.maxPositiveDevItem ? summary.maxPositiveDevItem.name : '데이터 없음'}
            </span>
          </div>
        </div>

        {/* Max Negative Deviation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">최대 하한(-) 편차</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {summary.maxNegativeDevItem ? `${summary.maxNegativeDevItem.val.toFixed(3)}` : '-'}
            </span>
            <span className="text-xs text-slate-500 block truncate mt-0.5">
              {summary.maxNegativeDevItem ? summary.maxNegativeDevItem.name : '데이터 없음'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Deviation Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>치수 항목별 편차(Deviation) 막대그래프</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              공칭치수(0.000) 기준 실측 편차. <span className="text-emerald-500 font-semibold">초록색: 정상(OK)</span>, <span className="text-amber-500 font-semibold">주황색: 공차 80% 근접</span>, <span className="text-red-500 font-semibold">빨간색: 공차 이탈(NG)</span>
            </p>
          </div>

          {/* Type filter dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDimensionFilter}
              onChange={e => setSelectedDimensionFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">전체 측정 유형 보기</option>
              <option value="X">X 좌표</option>
              <option value="Y">Y 좌표</option>
              <option value="Z">Z 좌표</option>
              <option value="지름">지름 (Diameter)</option>
              <option value="위치도">위치도 (Position)</option>
              <option value="평탄도">평탄도 (Flatness)</option>
              <option value="직각도">직각도 (Perpendicularity)</option>
            </select>
          </div>
        </div>

        {/* Recharts Deviation Chart */}
        <div className="h-80 w-full pt-4">
          {deviationChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              선택한 카테고리에 측정 항목이 없습니다.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviationChartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis 
                  dataKey="name" 
                  angle={-35} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                />
                <YAxis 
                  unit=" mm" 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1 font-mono">
                          <div className="font-bold text-blue-300 font-sans border-b border-slate-800 pb-1 mb-1">
                            [{data.elementName}] {data.feature}
                          </div>
                          <div>공칭치수 (Nominal): {data.nominal ?? '-'} mm</div>
                          <div>실측치수 (Actual): {data.actual ?? '-'} mm</div>
                          <div className={`font-bold ${data.deviation >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                            편차 (Deviation): {data.deviation >= 0 ? `+${data.deviation}` : data.deviation} mm
                          </div>
                          <div className="text-slate-400 text-[10px] pt-1">
                            공차대: {data.lowerTol} ~ +{data.upperTol} mm
                          </div>
                          <div className="pt-1">
                            판정: <span className={`font-bold ${data.isNg ? 'text-red-400' : 'text-emerald-400'}`}>{data.judgment}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#64748B" strokeWidth={1.5} />
                <Bar dataKey="deviation" name="편차(mm)" radius={[4, 4, 0, 0]}>
                  {deviationChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isNg ? '#EF4444' : entry.isWarning ? '#F59E0B' : '#3B82F6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tolerance Band Envelope Cards (공차대 시각화 - Tolerance Zone Analysis) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span>상한/하한 공차대 Envelope 위치 분석 (Tolerance Zone)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            각 측정 항목의 실측치가 허용 공차 범위 [-LowerTol, +UpperTol] 내의 어느 위치에 포지셔닝하고 있는지 시각적 게이지로 표현합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            if (item.deviation === null) return null;
            const uTol = item.upperTol !== null ? Math.abs(item.upperTol) : 0.05;
            const lTol = item.lowerTol !== null ? (item.lowerTol < 0 ? Math.abs(item.lowerTol) : item.lowerTol) : 0.05;
            const bandTotal = uTol + lTol;

            // Calculate percentage inside tolerance zone: 0% = -lTol, 50% = 0 (Nominal), 100% = +uTol
            let percent = bandTotal > 0 ? ((item.deviation + lTol) / bandTotal) * 100 : 50;
            percent = Math.max(0, Math.min(100, percent));

            const isNg = item.judgment === 'NG';
            const isWarn = percent > 85 || percent < 15;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isNg
                    ? 'bg-red-500/5 border-red-500/30'
                    : isWarn
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      [{item.elementName}] {item.feature}
                    </span>
                    <span className="ml-2 text-[10px] text-slate-400 font-sans">
                      ({item.featureType})
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isNg ? 'bg-red-500 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.judgment}
                  </span>
                </div>

                {/* Values line */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>공칭: {item.nominal ?? '-'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">실측: {item.actual ?? '-'}</span>
                  <span className={`font-bold ${item.deviation >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                    편차: {item.deviation >= 0 ? `+${item.deviation}` : item.deviation}
                  </span>
                </div>

                {/* Tolerance Zone Visual Bar */}
                <div className="space-y-1">
                  <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
                    {/* Zero center indicator line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10" />

                    {/* Actual measurement position marker dot */}
                    <div
                      className={`absolute top-0 bottom-0 w-2.5 rounded-full z-20 -ml-1 transition-all duration-300 ${
                        isNg ? 'bg-red-600 shadow-md shadow-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ left: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>하한: -{lTol}</span>
                    <span>중심 (0)</span>
                    <span>상한: +{uTol}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Pie Distribution + Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OK/NG Pie Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-emerald-500" />
              <span>검사 합격 / 불합격 (OK vs NG) 비율</span>
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center space-x-6 text-xs font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>합격 (OK): {summary.okCount}건</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>불합격 (NG): {summary.ngCount}건</span>
            </div>
          </div>
        </div>

        {/* Feature Types Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>측정 치수 유형별 분류</span>
            </h3>

            <div className="space-y-2.5">
              {typeBreakdownData.map(tb => (
                <div key={tb.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{tb.type}</span>
                    <span className="font-mono text-slate-500">{tb.count}개 ({((tb.count / items.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(tb.count / items.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            * 각 치수 특성은 기하공차(GD&T) 기준 및 위치, 평면, 지름으로 구분됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
