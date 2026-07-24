export type JudgmentType = 'OK' | 'NG' | 'WARN' | 'UNCHECKED';

export type DimensionType = 
  | 'X'
  | 'Y'
  | 'Z'
  | '지름'
  | '반경'
  | '위치도'
  | '평탄도'
  | '직각도'
  | '동축도'
  | '동심도'
  | '거리'
  | '기타';

export interface DatumInfo {
  id: string;
  code: string; // e.g. DATUM A
  name: string; // e.g. 평면 1
  description?: string; // e.g. 기본면
}

export interface MeasurementItem {
  id: string;
  elementName: string; // e.g. 원 2, 위치도, 평면 1
  feature: string; // e.g. X, Y, Z, 지름, 위치도, 평탄도
  featureType: DimensionType;
  nominal: number | null; // 공칭치수
  actual: number | null; // 실측치수
  deviation: number | null; // 편차 (Actual - Nominal)
  upperTol: number | null; // 공차(+)
  lowerTol: number | null; // 공차(-)
  judgment: JudgmentType;
  isMathMismatch?: boolean; // Actual - Nominal != Deviation
  rawLine?: string;
  note?: string;
}

export interface CMMMetadata {
  programName: string;
  date: string;
  author: string;
  unit: string;
  partName?: string;
  partNumber?: string;
  machineName?: string;
}

export interface CMMSummary {
  totalCount: number;
  okCount: number;
  ngCount: number;
  warnCount: number;
  passRate: number;
  maxPositiveDevItem?: { name: string; val: number };
  maxNegativeDevItem?: { name: string; val: number };
  avgToleranceUsagePercent: number;
}

export interface CMMData {
  metadata: CMMMetadata;
  datums: DatumInfo[];
  items: MeasurementItem[];
  summary: CMMSummary;
  unparsedLines: { lineNumber: number; content: string }[];
}

export type ViewMode = 'input' | 'editor' | 'dashboard' | 'report';
