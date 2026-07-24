import {
  CMMData,
  CMMMetadata,
  DatumInfo,
  DimensionType,
  MeasurementItem,
  JudgmentType,
  CMMSummary
} from '../types';

export function parseDimensionType(featureName: string): DimensionType {
  const name = featureName.trim().toUpperCase();
  if (name === 'X') return 'X';
  if (name === 'Y') return 'Y';
  if (name === 'Z') return 'Z';
  if (name.includes('지름') || name.includes('DIA')) return '지름';
  if (name.includes('반경') || name.includes('RAD')) return '반경';
  if (name.includes('위치도') || name.includes('POS')) return '위치도';
  if (name.includes('평탄도') || name.includes('FLAT')) return '평탄도';
  if (name.includes('직각도') || name.includes('PERP')) return '직각도';
  if (name.includes('동축도') || name.includes('COAX')) return '동축도';
  if (name.includes('동심도') || name.includes('CONC')) return '동심도';
  if (name.includes('거리') || name.includes('DIST')) return '거리';
  return '기타';
}

function parseNumber(str: string | undefined): number | null {
  if (!str) return null;
  const clean = str.replace(/MAX|MIN|\+|\s/gi, '').trim();
  if (clean === '-' || clean === '' || clean === 'N/A') return null;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export function parseCMMText(text: string): CMMData {
  const lines = text.split(/\r?\n/);

  const metadata: CMMMetadata = {
    programName: '미지정_프로그램.dms',
    date: new Date().toISOString().split('T')[0],
    author: '담당자',
    unit: 'mm',
    partName: '',
    partNumber: ''
  };

  const datums: DatumInfo[] = [];
  const items: MeasurementItem[] = [];
  const unparsedLines: { lineNumber: number; content: string }[] = [];

  let currentElement = '일반 요소';
  let insideDatumBlock = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Skip divider lines
    if (/^[=\-*#]{4,}$/.test(trimmed)) {
      insideDatumBlock = false;
      return;
    }

    // Metadata parsing
    if (trimmed.includes('측정 프로그램') || trimmed.match(/^Program\s*:/i)) {
      const parts = trimmed.split(':');
      if (parts.length > 1) metadata.programName = parts[1].trim();
      return;
    }
    if (trimmed.includes('측정 일자') || trimmed.match(/^Date\s*:/i)) {
      const parts = trimmed.split(':');
      if (parts.length > 1) metadata.date = parts[1].trim();
      return;
    }
    if (trimmed.includes('작성자') || trimmed.includes('검사자') || trimmed.match(/^Author\s*:|^Inspector\s*:/i)) {
      const parts = trimmed.split(':');
      if (parts.length > 1) metadata.author = parts[1].trim();
      return;
    }
    if (trimmed.includes('단위') || trimmed.match(/^Unit\s*:/i)) {
      const parts = trimmed.split(':');
      if (parts.length > 1) metadata.unit = parts[1].trim();
      return;
    }
    if (trimmed.includes('부품명') || trimmed.match(/^Part\s*Name\s*:/i)) {
      const parts = trimmed.split(':');
      if (parts.length > 1) metadata.partName = parts[1].trim();
      return;
    }

    // Datum section header
    if (trimmed.includes('[원점(Datum) 정보]') || trimmed.includes('[Datum Info]')) {
      insideDatumBlock = true;
      return;
    }

    // Datum item parsing
    if (trimmed.toUpperCase().startsWith('DATUM') || (insideDatumBlock && trimmed.includes(':'))) {
      const parts = trimmed.split(':');
      if (parts.length >= 2) {
        const code = parts[0].trim();
        const rest = parts.slice(1).join(':').trim();
        const matchName = rest.match(/([^(]+)(\(([^)]+)\))?/);
        datums.push({
          id: `datum-${datums.length + 1}`,
          code: code,
          name: matchName ? matchName[1].trim() : rest,
          description: matchName && matchName[3] ? matchName[3].trim() : ''
        });
        return;
      }
    }

    // Bracketed Element Name e.g. [원 2], [위치도(Position)], [CYLINDER_1]
    const elementMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (elementMatch) {
      currentElement = elementMatch[1].trim();
      return;
    }

    // Table Header check (Skip header line)
    if (
      trimmed.includes('공칭치수') ||
      trimmed.includes('NOMINAL') ||
      trimmed.includes('요소이름') ||
      trimmed.includes('FEATURE')
    ) {
      return;
    }

    if (trimmed.includes('요약') || trimmed.includes('SUMMARY')) {
      return;
    }

    // Parse measurement row
    // Support tab, multi-space delimiters
    const tokens = trimmed.split(/\t+|\s{2,}/).map(t => t.trim()).filter(Boolean);

    // If single line with spaces e.g. "X 50.000 50.023 +0.023 0.050 -0.050 OK"
    let rowTokens = tokens;
    if (tokens.length === 1 && tokens[0].includes(' ')) {
      rowTokens = tokens[0].split(/\s+/);
    }

    // We expect at least feature + 2 numeric/symbol values
    if (rowTokens.length >= 3) {
      const featureRaw = rowTokens[0];
      const featureType = parseDimensionType(featureRaw);

      // Extract remaining candidate numbers / judgment
      let nominal: number | null = null;
      let actual: number | null = null;
      let dev: number | null = null;
      let upperTol: number | null = null;
      let lowerTol: number | null = null;
      let judgment: JudgmentType = 'OK';

      // Check last token for judgment
      const lastToken = rowTokens[rowTokens.length - 1].toUpperCase();
      let hasJudgmentInText = false;
      if (lastToken === 'OK' || lastToken === 'PASS') {
        judgment = 'OK';
        hasJudgmentInText = true;
      } else if (lastToken === 'NG' || lastToken === 'FAIL') {
        judgment = 'NG';
        hasJudgmentInText = true;
      }

      // Values tokens between feature and judgment
      const valTokens = rowTokens.slice(1, hasJudgmentInText ? -1 : undefined);

      // Specialized handling for forms like "위치도 (A,B,C) 0.035 +0.035 0.050 - OK"
      const cleanValTokens = valTokens.filter(t => !t.startsWith('(') && !t.endsWith(')'));

      if (cleanValTokens.length >= 2) {
        // Typical structure: [Nominal, Actual, Dev, UpperTol, LowerTol]
        if (cleanValTokens.length === 2) {
          // Nominal, Actual
          nominal = parseNumber(cleanValTokens[0]);
          actual = parseNumber(cleanValTokens[1]);
        } else if (cleanValTokens.length === 3) {
          // Nominal, Actual, Dev
          nominal = parseNumber(cleanValTokens[0]);
          actual = parseNumber(cleanValTokens[1]);
          dev = parseNumber(cleanValTokens[2]);
        } else if (cleanValTokens.length === 4) {
          // Nominal, Actual, Dev, Tol(+)
          nominal = parseNumber(cleanValTokens[0]);
          actual = parseNumber(cleanValTokens[1]);
          dev = parseNumber(cleanValTokens[2]);
          upperTol = parseNumber(cleanValTokens[3]);
        } else if (cleanValTokens.length >= 5) {
          nominal = parseNumber(cleanValTokens[0]);
          actual = parseNumber(cleanValTokens[1]);
          dev = parseNumber(cleanValTokens[2]);
          upperTol = parseNumber(cleanValTokens[3]);
          lowerTol = parseNumber(cleanValTokens[4]);
        }

        // Auto-calculate dev if missing or verify
        if (actual !== null && nominal !== null) {
          const calculatedDev = parseFloat((actual - nominal).toFixed(4));
          if (dev === null) {
            dev = calculatedDev;
          }
        }

        // Auto-evaluate OK/NG based on tolerances
        let isMathMismatch = false;
        if (actual !== null && nominal !== null && dev !== null) {
          const calculatedDev = parseFloat((actual - nominal).toFixed(4));
          if (Math.abs(calculatedDev - dev) > 0.002) {
            isMathMismatch = true;
          }
        }

        // Tolerances evaluation
        if (actual !== null && nominal !== null) {
          const calcDev = actual - nominal;
          const uTol = upperTol !== null ? Math.abs(upperTol) : null;
          const lTol = lowerTol !== null ? (lowerTol < 0 ? Math.abs(lowerTol) : lowerTol) : null;

          if (uTol !== null && calcDev > uTol + 0.0001) {
            judgment = 'NG';
          }
          if (lTol !== null && calcDev < -lTol - 0.0001) {
            judgment = 'NG';
          }
        }

        items.push({
          id: `item-${items.length + 1}`,
          elementName: currentElement,
          feature: featureRaw,
          featureType: featureType,
          nominal: nominal,
          actual: actual,
          deviation: dev,
          upperTol: upperTol,
          lowerTol: lowerTol,
          judgment: judgment,
          isMathMismatch: isMathMismatch,
          rawLine: trimmed
        });
        return;
      }
    }

    // If not matched as datum or item, keep as unparsed
    if (!trimmed.includes('=====') && !trimmed.includes('측정 항목 수')) {
      unparsedLines.push({
        lineNumber: index + 1,
        content: trimmed
      });
    }
  });

  const summary = calculateSummary(items);

  return {
    metadata,
    datums,
    items,
    summary,
    unparsedLines
  };
}

export function calculateSummary(items: MeasurementItem[]): CMMSummary {
  const totalCount = items.length;
  let okCount = 0;
  let ngCount = 0;
  let warnCount = 0;

  let maxPosVal = -Infinity;
  let maxPosItem: { name: string; val: number } | undefined = undefined;
  let maxNegVal = Infinity;
  let maxNegItem: { name: string; val: number } | undefined = undefined;

  let totalToleranceUsage = 0;
  let validToleranceCount = 0;

  items.forEach(item => {
    if (item.judgment === 'OK') okCount++;
    else if (item.judgment === 'NG') ngCount++;
    else if (item.judgment === 'WARN') warnCount++;

    if (item.isMathMismatch) warnCount++;

    if (item.deviation !== null) {
      if (item.deviation > maxPosVal) {
        maxPosVal = item.deviation;
        maxPosItem = { name: `${item.elementName} (${item.feature})`, val: item.deviation };
      }
      if (item.deviation < maxNegVal) {
        maxNegVal = item.deviation;
        maxNegItem = { name: `${item.elementName} (${item.feature})`, val: item.deviation };
      }
    }

    // Calculate tolerance band usage
    if (item.deviation !== null && item.upperTol !== null && item.lowerTol !== null) {
      const uTol = Math.abs(item.upperTol);
      const lTol = Math.abs(item.lowerTol);
      const totalBand = uTol + lTol;
      if (totalBand > 0) {
        // 0 dev = 0% distance from center, dev = uTol -> 100%
        const distanceRatio = Math.abs(item.deviation) / (item.deviation >= 0 ? uTol : lTol);
        totalToleranceUsage += Math.min(distanceRatio * 100, 150);
        validToleranceCount++;
      }
    }
  });

  const passRate = totalCount > 0 ? parseFloat(((okCount / totalCount) * 100).toFixed(1)) : 0;
  const avgToleranceUsagePercent = validToleranceCount > 0 
    ? parseFloat((totalToleranceUsage / validToleranceCount).toFixed(1))
    : 0;

  return {
    totalCount,
    okCount,
    ngCount,
    warnCount,
    passRate,
    maxPositiveDevItem: maxPosItem && maxPosVal !== -Infinity ? maxPosItem : undefined,
    maxNegativeDevItem: maxNegItem && maxNegVal !== Infinity ? maxNegItem : undefined,
    avgToleranceUsagePercent
  };
}

export function recalculateItem(item: MeasurementItem): MeasurementItem {
  let dev = item.deviation;
  let judgment = item.judgment;
  let isMathMismatch = false;

  if (item.actual !== null && item.nominal !== null) {
    const calcDev = parseFloat((item.actual - item.nominal).toFixed(4));
    if (dev !== null && Math.abs(dev - calcDev) > 0.002) {
      isMathMismatch = true;
    }
    dev = calcDev;

    // Check tolerances
    const uTol = item.upperTol !== null ? Math.abs(item.upperTol) : null;
    const lTol = item.lowerTol !== null ? (item.lowerTol < 0 ? Math.abs(item.lowerTol) : item.lowerTol) : null;

    if (uTol !== null && calcDev > uTol + 0.0001) {
      judgment = 'NG';
    } else if (lTol !== null && calcDev < -lTol - 0.0001) {
      judgment = 'NG';
    } else {
      judgment = 'OK';
    }
  }

  return {
    ...item,
    deviation: dev,
    judgment,
    isMathMismatch
  };
}
