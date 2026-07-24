import * as XLSX from 'xlsx';
import { CMMData } from '../types';

export function exportToExcel(cmmData: CMMData, filename?: string) {
  const { metadata, datums, items, summary } = cmmData;

  // Build rows for worksheet
  const rows: (string | number | null)[][] = [];

  // Header Title
  rows.push(['===================================================================']);
  rows.push(['                      측정 검사 성적서 (CMM Report)                 ']);
  rows.push(['===================================================================']);
  rows.push([]);

  // Metadata Block
  rows.push(['[측정 정보 메타데이터]']);
  rows.push(['측정 프로그램', metadata.programName, '측정 일자', metadata.date]);
  rows.push(['작성자 / 검사자', metadata.author, '단위', metadata.unit]);
  if (metadata.partName) rows.push(['부품명', metadata.partName]);
  if (metadata.partNumber) rows.push(['부품 번호', metadata.partNumber]);
  rows.push([]);

  // Datums Section
  if (datums.length > 0) {
    rows.push(['[원점 (Datum) 정보]']);
    datums.forEach(d => {
      rows.push([d.code, d.name, d.description || '']);
    });
    rows.push([]);
  }

  // Inspection Items Table Header
  rows.push(['===================================================================']);
  rows.push([
    '요소 이름',
    '측정 특성',
    '치수 종류',
    '공칭치수 (Nominal)',
    '실측치수 (Actual)',
    '편차 (Deviation)',
    '공차 (+)',
    '공차 (-)',
    '판정 (Judgment)',
    '검증 비고'
  ]);

  // Inspection Items Table Rows
  items.forEach(item => {
    rows.push([
      item.elementName,
      item.feature,
      item.featureType,
      item.nominal ?? '-',
      item.actual ?? '-',
      item.deviation !== null ? (item.deviation >= 0 ? `+${item.deviation}` : item.deviation) : '-',
      item.upperTol !== null ? `+${Math.abs(item.upperTol)}` : '-',
      item.lowerTol !== null ? `-${Math.abs(item.lowerTol)}` : '-',
      item.judgment,
      item.isMathMismatch ? '편차 불일치 경고' : ''
    ]);
  });

  rows.push(['===================================================================']);
  rows.push([]);

  // Summary Block
  rows.push(['[측정 결과 요약]']);
  rows.push(['전체 측정 항목 수', summary.totalCount]);
  rows.push(['합격 (OK)', summary.okCount]);
  rows.push(['불합격 (NG)', summary.ngCount]);
  rows.push(['합격률 (Pass Rate)', `${summary.passRate}%`]);
  rows.push(['평균 공차대 소진율', `${summary.avgToleranceUsagePercent}%`]);
  if (summary.maxPositiveDevItem) {
    rows.push(['최대 양(+) 편차 항목', `${summary.maxPositiveDevItem.name} (+${summary.maxPositiveDevItem.val})`]);
  }
  if (summary.maxNegativeDevItem) {
    rows.push(['최대 음(-) 편차 항목', `${summary.maxNegativeDevItem.name} (${summary.maxNegativeDevItem.val})`]);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto column widths
  ws['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CMM_측정성적서');

  const name = filename || `${metadata.programName.replace(/\.[^/.]+$/, '')}_CMM_Report.xlsx`;
  XLSX.writeFile(wb, name);
}

export function copyTableToClipboard(cmmData: CMMData): Promise<void> {
  const headers = ['요소이름', '특성', '종류', '공칭치수', '실측치수', '편차', '공차(+)', '공차(-)', '판정'];
  const rows = cmmData.items.map(item => [
    item.elementName,
    item.feature,
    item.featureType,
    item.nominal ?? '-',
    item.actual ?? '-',
    item.deviation !== null ? (item.deviation >= 0 ? `+${item.deviation}` : item.deviation) : '-',
    item.upperTol !== null ? `+${Math.abs(item.upperTol)}` : '-',
    item.lowerTol !== null ? `-${Math.abs(item.lowerTol)}` : '-',
    item.judgment
  ]);

  const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
  return navigator.clipboard.writeText(text);
}
