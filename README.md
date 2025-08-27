# 수숨슬립 자세교정 앱 (Susum Sleep Posture Correction App)

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose_Detection-orange)](https://mediapipe.dev/)

> 목침을 활용한 전문적인 자세교정으로 수면의 질을 향상시키고 건강한 하루를 시작하세요.

## 🌟 주요 기능

- **🎯 AI 기반 실시간 자세 분석**: MediaPipe를 활용한 정확한 자세 감지
- **📱 개인 맞춤형 교정 프로그램**: 12단계 척추 건강 운동 시스템
- **👨‍⚕️ 단계별 가이드와 피드백**: 목적별 운동 가이드 및 실시간 피드백
- **🛏️ 목침 활용 전문 케어**: 수숨슬립 목침을 활용한 전문 케어 시스템
- **📊 운동 기록 및 분석**: 개인별 운동 기록 관리 및 분석

## 📋 12단계 자세교정 프로그램

### 목과 경추 건강
1. **목 유연성** (C1-C7 경추) - 목의 전반적인 유연성 향상
2. **뇌척수액 순환** - 뇌와 척수의 순환 개선
3. **머리 유연성** (T1-T2 흉추) - 상부 흉추의 유연성 향상

### 등과 흉추 건강
4. **가슴 펴기** (T4-T5 흉추) - 구부정한 자세 교정
5. **등 펴기** (T7-T8 흉추) - 등의 곡선 정렬

### 허리와 요추 건강
6. **허리 곡선 교정** (L4-L5 요추) - 요추 전만 정상화
7. **골반 교정** (천골) - 골반의 올바른 정렬

### 하체 순환 개선
8. **허벅지 근육 이완** - 하체 근육 긴장 완화
9. **무릎 통증 예방** - 무릎 관절 건강 증진
10. **종아리 순환** - 하지 혈액 순환 개선
11. **발목 순환** - 발목 관절 유연성 향상
12. **전신 순환 운동** - 전체적인 순환 시스템 활성화

## 🚀 기술 스택

### Frontend
- **Next.js 15.2.4** - App Router 기반 React 프레임워크
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 중심 CSS 프레임워크
- **shadcn/ui** - 접근성을 고려한 컴포넌트 라이브러리
- **Radix UI** - 접근성 기반 UI 프리미티브

### AI & Computer Vision
- **MediaPipe Pose** - Google의 실시간 자세 감지 라이브러리
- **Camera API** - 웹캠을 통한 실시간 영상 처리
- **Custom Pose Validation** - 목적별 자세 검증 로직

### Development Tools
- **pnpm** - 빠르고 효율적인 패키지 매니저
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리기

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 18 이상
- pnpm (권장) 또는 npm/yarn
- 웹캠 지원 디바이스

### 설치
```bash
# 저장소 클론
git clone https://github.com/yourusername/posing.git
cd posing

# 의존성 설치
pnpm install
```

### 개발 서버 실행
```bash
# 개발 서버 시작
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포
```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 린팅
pnpm lint
```

## 📁 프로젝트 구조

```
posing/
├── app/                     # Next.js App Router
│   ├── page.tsx            # 메인 랜딩 페이지
│   ├── postures/           # 운동 선택 페이지
│   ├── posture/[id]/       # 개별 운동 페이지
│   ├── complete/           # 운동 완료 페이지
│   ├── admin/              # 관리자 패널
│   └── analysis/           # 결과 분석 페이지
├── components/
│   ├── posture-detection.tsx  # 핵심 자세 감지 컴포넌트
│   ├── ui/                    # shadcn/ui 컴포넌트
│   └── error-boundary.tsx     # 에러 처리 컴포넌트
├── lib/                    # 유틸리티 함수
├── public/                 # 정적 파일
└── styles/                 # 스타일 파일
```

## 🎯 핵심 컴포넌트

### PostureDetection 컴포넌트
메인 자세 감지 시스템을 담당하는 핵심 컴포넌트입니다.

**주요 기능:**
- MediaPipe 라이브러리 동적 로딩
- 웹캠 스트림 관리
- 실시간 자세 분석 및 검증
- 운동 횟수 카운팅
- 폴백 시뮬레이션 모드

**특징:**
- 에러 복구 메커니즘
- 브라우저 호환성 처리
- 사용자 친화적인 한국어 안내

## 🌐 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

> **참고**: MediaPipe는 Chrome에서 가장 안정적으로 작동합니다.

## 📱 모바일 최적화

- 모바일 우선 반응형 디자인
- 터치 친화적 인터페이스
- 세로 모드 최적화
- 한국 사용자 UX 고려사항 반영

## 🔒 개인정보 보호

- 웹캠 영상은 로컬에서만 처리
- 개인 데이터 외부 전송 없음
- 사용자 동의 기반 카메라 접근

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 문제 해결

### 자주 묻는 질문

**Q: 카메라가 작동하지 않아요**
A: 브라우저에서 카메라 권한을 허용했는지 확인하고, HTTPS 환경에서 실행되는지 확인하세요.

**Q: MediaPipe 로딩이 실패해요**
A: 네트워크 연결을 확인하고, 시뮬레이션 모드로 체험해보세요.

**Q: 자세 인식이 정확하지 않아요**
A: 충분한 조명과 카메라와의 적정 거리(1-2m)를 유지하세요.

## 📞 지원

문제가 발생하거나 제안사항이 있으시면 [Issues](https://github.com/yourusername/posing/issues)를 통해 연락해 주세요.

---

💤 **건강한 수면과 올바른 자세, 수숨슬립과 함께 시작하세요!**