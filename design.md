# CMM 측정 데이터 분석 웹앱 Design System (Design Guidelines)

> 본 디자인 가이드는 **Hanwha Aerospace (한화에어로스페이스)** 의 항공우주·방산 하이테크 정밀 공학 비주얼 아이덴티티를 바탕으로, 가공 부품의 CMM(3차원 측정기) 텍스트 데이터 파싱 및 정밀도 시각화 웹앱에 최적화된 UX/UI 시스템을 정의합니다.

---

## 1. 비주얼 콘셉트 & 디자인 아키타입 (Visual Identity & Archetype)

* **Design Concept**: **"Aerospace Precision & Industrial Trust"** (항공우주 수준의 극정밀성과 산업적 신뢰감)
* **Core Value**:
  * **Zero-Defect Clarity**: 0.001mm 단위의 정밀 측정이 이루어지는 현장에 맞춰 데이터의 가독성과 명확성을 극대화합니다.
  * **Structured Grid Hierarchy**: 무거운 현장 데이터를 정돈된 그리드와 시각적 명암 차이로 손쉽게 파악할 수 있도록 설계합니다.
  * **High-Contrast Dark & Industrial Light Dual Tone**: 정밀 관제 센터(Dark Mode) 및 정밀 성적서 인쇄(Light Mode)에 모두 부합하는 듀얼 톤을 지향합니다.

---

## 2. 컬러 팔레트 (Color Palette System)

한화에어로스페이스의 딥 네이비, 오렌지 포인트 패밀리 및 고대비 슬레이트 톤을 기반으로 채택하였습니다.

### Primary Brand & Surface Colors
| 역할 | Color Name | Hex Code | 사용 처 |
| :--- | :--- | :--- | :--- |
| **Deep Aerospace Navy** | Slate 950 / Navy | `#020617` / `#001F3F` | 대시보드 캔버스, 헤더, 관제 배경 |
| **Industrial Dark Card** | Slate 900 | `#0F172A` | 메인 카드 컨테이너, 모달, 인터랙티브 영역 |
| **Precision Blue Accent** | Hanwha Blue | `#2563EB` / `#3B82F6` | 주 버튼, 선택 탭, 활성 차트 바, 강조 뱃지 |
| **Light Canvas (Report)** | Off-White Slate | `#F8FAFC` | 성적서 출력 뷰, 라이트 모드 배경 |

### Status & Measurement Feedback Colors
| 상태 | Label | Hex Code | 사용 예시 |
| :--- | :--- | :--- | :--- |
| **Pass (OK)** | Emerald Green | `#10B981` | 공차 내 정상 항목, OK 뱃지, 합격률 차트 |
| **Warning / Envelope** | Hanwha Amber | `#F59E0B` | 공차대 80% 근접 주의 항목, AI 추천 |
| **Reject (NG)** | Crimson Red | `#EF4444` | 공차 초과 불합격 항목, NG 경고, 에러 모달 |

---

## 3. 타이포그래피 & 수치 표시 규칙 (Typography & Tabular Digits)

### 폰트 페어링
* **국문/영문 기본 폰트**: `Pretendard`, `Plus Jakarta Sans`, `Inter` (sans-serif)
* **측정 치수/수치 데이터 전용 폰트**: `JetBrains Mono`, `ui-monospace`, `Courier New` (monospace)
  * *이유*: 실측치, 공칭치, 편차 등 소수점 3~4자리 수치가 정렬될 때 가로 폭이 고정되는 Tabular Numbers를 사용하여 시각적 오차를 방지합니다.

### 텍스트 스케일 & 패딩
* **H1 / Title**: 24px (1.5rem), Bold - 성적서 메인 헤드라인
* **H2 / Section Header**: 18px (1.125rem), SemiBold - 대시보드 및 테이블 섹션 제목
* **Body / Label**: 14px (0.875rem) - 기본 설명글 및 필터 라벨
* **Data Cell / Monospace**: 12px (0.75rem) - 테이블 내부 수치 및 공차 표시

---

## 4. UI 레이아웃 & 컴포넌트 가이드라인 (Layout & Components)

### 4.1. 단방향 QA 워크플로우 탭 (4-Step Workflow Bar)
사용자가 별도의 آموزش 없이 붙여넣기부터 인쇄까지 순차적으로 진행할 수 있도록 상단 헤더에 스테이지를 배치합니다.
1. **1. 입력 & 파싱**: CMM 원본 텍스트 붙여넣기 및 파싱 요약
2. **2. 데이터 검수 & 편집**: Spreadsheet 형태의 데이터 수동 보정
3. **3. 분석 대시보드**: Deviation Bar Chart 및 Tolerance Zone 시각화
4. **4. 검사 성적서**: 인쇄 및 PDF 저장용 표준 양식

### 4.2. 데이터 테이블 (Spreadsheet Editor)
* **Subtle Borders**: `border-slate-800` 1px 하이라인 적용
* **Row Hover**: `hover:bg-slate-800/50`으로 마우스 커서 위치를 정밀 추적
* **Status Rows**: NG 발생 행은 `bg-red-500/10` 연한 붉은색 배경으로 즉시 구별

### 4.3. 정밀도 시각화 차트 (Recharts Deviation & Tolerance Zone)
* **Deviation Chart**: 공칭치수(0)를 기준선(`ReferenceLine`)으로 설정하여 양(+)의 편차와 음(-)의 편차를 선명하게 대칭 표시
* **Tolerance Zone Envelope**: `[-LowerTol, +UpperTol]` 구간 내에서 현재 실측치의 상대 포지션을 원형 닷 게이지로 표현

---

## 5. 비기능 및 응답성 가이드 (Usability & Responsiveness)

1. **데스크톱 현장 PC & 태블릿 대응**: `sm:`, `md:`, `lg:` 반응형 그리드 적용 (`max-w-7xl mx-auto`).
2. **WCAG AA 대비율 충족**: 텍스트와 배경 간 최소 4.5:1 이상의 가독 대비율 보장.
3. **엑셀 호환성**: 모든 테이블 데이터는 Tab-delimited 텍스트 복사 및 `.xlsx` 다운로드를 완벽 지원.
