"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertTriangle, Wifi, WifiOff } from "lucide-react"

interface PostureDetectionProps {
  onDetectionComplete: (result: "success" | "warning") => void
  targetPose: string
  stepId: number
}

// 최신 MediaPipe 타입 정의
declare global {
  interface Window {
    Pose: any
    drawConnectors: any
    drawLandmarks: any
    POSE_CONNECTIONS: any
    POSE_LANDMARKS: any
    Camera: any
  }
}

export default function PostureDetection({ onDetectionComplete, targetPose, stepId }: PostureDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // MediaPipe 상태
  const [poseDetector, setPoseDetector] = useState<any>(null)
  const [mediaPipeStatus, setMediaPipeStatus] = useState<"loading" | "ready" | "error" | "running">("loading")
  const [useRealDetection, setUseRealDetection] = useState(false)

  // 운동 상태
  const [exerciseCount, setExerciseCount] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState("MediaPipe 로딩 준비 중...")
  const requiredCount = 20

  // 포즈 감지 상태
  const [currentDirection, setCurrentDirection] = useState<"center" | "left" | "right">("center")
  const [lastDirection, setLastDirection] = useState<"center" | "left" | "right">("center")
  const [detectedPoses, setDetectedPoses] = useState(0)
  const [fps, setFps] = useState(0)
  const [showLandmarks, setShowLandmarks] = useState(true)

  // 시뮬레이션 상태 (폴백용)
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number>()
  const fpsCounterRef = useRef(0)
  const lastFpsTimeRef = useRef(Date.now())
  const loadAttemptRef = useRef(0)
  const cameraStartingRef = useRef(false) // 카메라 시작 중복 방지
  const retryInProgressRef = useRef(false) // 재시도 중복 방지
  const lastCameraAttemptRef = useRef(0) // 마지막 카메라 시도 시간

  useEffect(() => {
    // 개발/테스트 모드에서는 바로 시뮬레이션으로 시작할 수 있도록
    const forceSimulation = new URLSearchParams(window.location.search).get('simulation') === 'true'
    
    if (forceSimulation) {
      console.log("🎭 URL 파라미터로 시뮬레이션 모드 강제 활성화")
      fallbackToSimulation()
    } else {
      loadMediaPipe()
    }
    
    return cleanup
  }, [])

  // 개선된 MediaPipe 로딩 시스템
  const loadMediaPipe = async () => {
    const maxAttempts = 3 // 시도 횟수 증가
    loadAttemptRef.current++
    
    try {
      setMediaPipeStatus("loading")
      setFeedbackMessage(`🚀 MediaPipe 라이브러리 로딩 중... (${loadAttemptRef.current}/${maxAttempts})`)
      console.log("🔄 MediaPipe 로딩 시작", { attempt: loadAttemptRef.current, maxAttempts })

      // 이미 로드되었는지 확인
      if (window.Pose && window.drawConnectors && window.drawLandmarks) {
        console.log("✅ MediaPipe가 이미 로드됨")
        await initializeMediaPipe()
        return
      }

      // 더 안정적인 스크립트 로드
      console.log("📦 스크립트 로딩 시작...")
      await loadMediaPipeScripts()
      
      console.log("⏳ 객체 초기화 대기...")
      await waitForMediaPipeObjects()
      
      console.log("🔧 MediaPipe 초기화...")
      await initializeMediaPipe()

    } catch (err: any) {
      console.error(`💥 MediaPipe 로드 시도 ${loadAttemptRef.current} 실패:`, err)
      console.error("에러 상세:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      
      if (loadAttemptRef.current < maxAttempts) {
        setFeedbackMessage(`❌ 로딩 실패. 재시도 중... (${loadAttemptRef.current + 1}/${maxAttempts})`)
        setTimeout(() => loadMediaPipe(), 3000) // 대기 시간 증가
      } else {
        console.log("🔴 최대 재시도 횟수 초과, 시뮬레이션 모드로 전환")
        setError(`MediaPipe 로드 실패 (${maxAttempts}회 시도): ${err.message}`)
        setMediaPipeStatus("error")
        fallbackToSimulation()
      }
    }
  }

  // 스크립트 로딩 함수 개선 (fallback CDN 추가)
  const loadMediaPipeScripts = async () => {
    const scripts = [
      {
        name: "drawing_utils",
        urls: [
          "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js",
          "https://unpkg.com/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js"
        ],
        check: () => window.drawConnectors && window.drawLandmarks
      },
      {
        name: "pose",
        urls: [
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js",
          "https://unpkg.com/@mediapipe/pose@0.5.1675469404/pose.js"
        ],
        check: () => window.Pose && (window.POSE_CONNECTIONS || window.POSE_LANDMARKS)
      }
    ]

    for (const script of scripts) {
      if (script.check()) {
        console.log(`✅ ${script.name} 스크립트 이미 로드됨`)
        continue
      }

      console.log(`📦 ${script.name} 로딩 시도...`)
      
      let loaded = false
      for (const url of script.urls) {
        try {
          console.log(`🔗 시도 중: ${url}`)
          await loadScript(url)
          console.log(`✅ ${script.name} 로드 성공: ${url}`)
          loaded = true
          break
        } catch (err) {
          console.warn(`❌ ${script.name} 로드 실패: ${url}`, err)
          continue
        }
      }
      
      if (!loaded) {
        throw new Error(`${script.name} 스크립트를 모든 CDN에서 로드할 수 없습니다`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로드 후 대기
    }
  }

  // 스크립트 로드 헬퍼 (네트워크 체크 강화)
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 기존 스크립트 확인
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
        console.log(`♻️ 기존 스크립트 재사용: ${src}`)
        resolve()
        return
      }

      // 네트워크 연결 체크
      if (!navigator.onLine) {
        reject(new Error("인터넷 연결이 없습니다"))
        return
      }

      const script = document.createElement("script")
      script.src = src
      script.async = true
      script.crossOrigin = "anonymous"

      const cleanup = () => {
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)
        clearTimeout(timeout)
      }

      const onLoad = () => {
        cleanup()
        console.log(`✅ 스크립트 로드 성공: ${src}`)
        // 초기화 시간을 더 길게 확보
        setTimeout(resolve, 800)
      }

      const onError = (event: any) => {
        cleanup()
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
        console.error(`❌ 스크립트 로드 에러:`, {
          url: src,
          error: event,
          networkStatus: navigator.onLine ? 'online' : 'offline'
        })
        reject(new Error(`스크립트 로드 실패: ${src} (네트워크: ${navigator.onLine ? 'OK' : 'OFFLINE'})`))
      }

      const timeout = setTimeout(() => {
        cleanup()
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
        console.error(`⏰ 스크립트 로드 타임아웃:`, {
          url: src,
          timeout: '25초',
          networkStatus: navigator.onLine ? 'online' : 'offline'
        })
        reject(new Error(`스크립트 로드 타임아웃 (25초): ${src}`))
      }, 25000) // 25초로 타임아웃 증가

      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)
      
      console.log(`⬇️ 스크립트 로드 시작: ${src}`)
      document.head.appendChild(script)
    })
  }

  // MediaPipe 객체 대기
  const waitForMediaPipeObjects = async () => {
    console.log("⏳ MediaPipe 객체 초기화 대기 중...")
    
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      const objects = {
        Pose: !!window.Pose,
        drawConnectors: !!window.drawConnectors, 
        drawLandmarks: !!window.drawLandmarks,
        connections: !!(window.POSE_CONNECTIONS || window.POSE_LANDMARKS)
      }
      
      console.log(`확인 ${attempts + 1}/${maxAttempts}:`, objects)
      
      if (Object.values(objects).every(Boolean)) {
        console.log("🎉 모든 MediaPipe 객체 준비 완료!")
        await new Promise(resolve => setTimeout(resolve, 1500)) // 안정화 대기
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }
    
    throw new Error("MediaPipe 객체 초기화 타임아웃")
  }

  // MediaPipe 초기화 (강화된 에러 핸들링)
  const initializeMediaPipe = async () => {
    try {
      console.log("🔧 MediaPipe Pose 인스턴스 생성 중...")
      setIsLoading(true)

      const pose = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        },
      })

      console.log("⚙️ MediaPipe 옵션 설정 중...")
      await pose.setOptions({
        modelComplexity: 1, // Full 모델 (안정성)
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.8, // 높은 신뢰도로 시작
        minTrackingConfidence: 0.7,  // 높은 추적 신뢰도
        staticImageMode: false,
      })

      console.log("📡 결과 핸들러 설정 중...")
      pose.onResults((results: any) => {
        try {
          const hasValidLandmarks = results.poseLandmarks && results.poseLandmarks.length >= 25
          
          if (hasValidLandmarks) {
            console.log("🎯 포즈 감지 성공:", {
              landmarks: results.poseLandmarks.length,
              nose: results.poseLandmarks[0] ? '✓' : '✗',
              shoulders: (results.poseLandmarks[11] && results.poseLandmarks[12]) ? '✓' : '✗'
            })
            
            drawResults(results)
            analyzePosture(results.poseLandmarks)
            setDetectedPoses(1)
            setError(null)
            
            if (feedbackMessage.includes("감지되지 않습니다")) {
              setFeedbackMessage("✅ 자세가 감지되었습니다! 운동을 시작하세요")
            }
          } else {
            setDetectedPoses(0)
            if (!feedbackMessage.includes("감지되지 않습니다")) {
              setFeedbackMessage("사람이 감지되지 않습니다. 전신이 45도 각도에서 보이도록 조정하세요")
            }
          }
        } catch (err) {
          console.error("❌ 결과 처리 오류:", err)
        }
      })

      // 에러 핸들링
      pose.onError = (error: any) => {
        console.error("💥 MediaPipe 포즈 에러:", error)
        setError(`포즈 감지 오류: ${error.message || '알 수 없는 오류'}`)
        setTimeout(() => fallbackToSimulation(), 2000)
      }

      // 초기화 완료 대기
      console.log("⏳ 초기화 완료 대기...")
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 최종 검증
      if (typeof pose.send !== 'function') {
        throw new Error("Pose.send 메서드를 사용할 수 없습니다")
      }

      setPoseDetector(pose)
      setMediaPipeStatus("ready")
      setUseRealDetection(true)
      setFeedbackMessage("🎉 MediaPipe 준비 완료! 카메라를 시작하여 운동하세요")
      setIsLoading(false)
      console.log("🎉 MediaPipe 초기화 완료!")

    } catch (err: any) {
      console.error("💥 MediaPipe 초기화 실패:", err)
      setError(`MediaPipe 초기화 실패: ${err.message}`)
      setMediaPipeStatus("error")
      setIsLoading(false)
      setTimeout(() => fallbackToSimulation(), 1000)
    }
  }

  // 시뮬레이션 모드로 전환
  const fallbackToSimulation = () => {
    console.log("🔄 시뮬레이션 모드로 전환...")
    setMediaPipeStatus("error")
    setUseRealDetection(false)
    setError(null)
    setFeedbackMessage("⚠️ 시뮬레이션 모드로 실행됩니다")
  }

  // 결과 그리기 - 강화된 디버깅
  const drawResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current || !results.poseLandmarks) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const video = videoRef.current
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    // 캔버스 크기 설정
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    if (results.poseLandmarks && showLandmarks) {
      drawPoseConnections(ctx, results.poseLandmarks)
      drawPoseLandmarks(ctx, results.poseLandmarks)

      // 올바른 자세일 때 녹색 오버레이
      try {
        const poseResult = validateNeckExercise(results.poseLandmarks)
        if (poseResult.isCorrectPose) {
          ctx.fillStyle = "rgba(0, 255, 0, 0.1)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      } catch (err) {
        console.error("자세 검증 오류:", err)
      }
    }

    ctx.restore()
  }

  // 포즈 연결선 그리기
  const drawPoseConnections = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return
    
    const connections = [
      // 얼굴
      [0, 1], [1, 2], [2, 3], [3, 7],
      [0, 4], [4, 5], [5, 6], [6, 8],
      // 몸통
      [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
      // 팔
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      // 다리
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ]
    
    ctx.strokeStyle = "#00FF41"
    ctx.lineWidth = 2
    
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx]
      const end = landmarks[endIdx]
      
      if (start && end && (!start.visibility || start.visibility > 0.5) && (!end.visibility || end.visibility > 0.5)) {
        ctx.beginPath()
        ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height)
        ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height)
        ctx.stroke()
      }
    })
  }

  // 포즈 랜드마크 그리기
  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return
    
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility < 0.5) return
      
      const x = landmark.x * ctx.canvas.width
      const y = landmark.y * ctx.canvas.height
      
      const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24]
      const radius = keyPoints.includes(index) ? 4 : 2
      
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = "#FF0000"
      ctx.fill()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 1
      ctx.stroke()
      
      if (keyPoints.includes(index)) {
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(index.toString(), x, y - radius - 2)
      }
    })
  }

  // 누운 자세 목 운동 검증 (가로 촬영, 45도 각도 최적화)
  const validateNeckExercise = (landmarks: any[]) => {
    if (!landmarks || landmarks.length < 33) {
      return {
        isCorrectPose: false,
        direction: "center" as const,
        feedback: "자세를 인식할 수 없습니다",
      }
    }

    try {
      const nose = landmarks[0]
      const leftEye = landmarks[2]
      const rightEye = landmarks[5]
      const leftEar = landmarks[7]
      const rightEar = landmarks[8]
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftHip = landmarks[23]
      const rightHip = landmarks[24]

      if (!nose || !leftShoulder || !rightShoulder) {
        return {
          isCorrectPose: false,
          direction: "center" as const,
          feedback: "얼굴과 어깨가 보이도록 자세를 조정하세요",
        }
      }

      // 45도 촬영에서의 몸 중심선 계산
      const bodyMidlineX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4
      const bodyMidlineY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4

      // 머리 중심점 계산
      const facialLandmarks = [nose, leftEye, rightEye, leftEar, rightEar].filter(
        landmark => landmark && (!landmark.visibility || landmark.visibility > 0.3)
      )
      
      let headCenterX = nose.x
      let headCenterY = nose.y
      
      if (facialLandmarks.length >= 2) {
        headCenterX = facialLandmarks.reduce((sum, landmark) => sum + landmark.x, 0) / facialLandmarks.length
        headCenterY = facialLandmarks.reduce((sum, landmark) => sum + landmark.y, 0) / facialLandmarks.length
      }

      // 45도 각도에서의 머리 회전 감지
      const headOffsetX = headCenterX - bodyMidlineX
      
      // 방향 감지
      let direction: "center" | "left" | "right" = "center"
      const threshold = 0.05 // 45도 각도에서 더 민감하게

      if (headOffsetX > threshold) {
        direction = "right"
      } else if (headOffsetX < -threshold) {
        direction = "left"
      }

      // 누운 자세 확인
      const shoulderHipAlignment = Math.abs(leftShoulder.y - rightShoulder.y) + Math.abs(leftHip.y - rightHip.y)
      const isLyingDown = shoulderHipAlignment < 0.2
      
      const headAboveBody = headCenterY < bodyMidlineY + 0.15
      const bodyDepth = Math.abs(leftShoulder.x - rightShoulder.x)
      const hasProperDepth = bodyDepth > 0.12
      
      const isCorrectPose = isLyingDown && headAboveBody && hasProperDepth
      
      console.log("45도 누운 자세 분석:", {
        direction,
        headOffsetX: headOffsetX.toFixed(3),
        shoulderHipAlignment: shoulderHipAlignment.toFixed(3),
        bodyDepth: bodyDepth.toFixed(3),
        isCorrectPose
      })

      return {
        isCorrectPose,
        direction,
        feedback: generateLyingDownFeedback(direction, exerciseCount, isCorrectPose, isLyingDown, hasProperDepth),
      }
    } catch (err) {
      console.error("자세 검증 오류:", err)
      return {
        isCorrectPose: false,
        direction: "center" as const,
        feedback: "자세 분석 중 오류가 발생했습니다",
      }
    }
  }

  // 포즈 분석
  const analyzePosture = (landmarks: any[]) => {
    const result = validateNeckExercise(landmarks)

    // 방향 변화 감지 및 카운트
    if (result.direction !== lastDirection) {
      setCurrentDirection(result.direction)

      // 중앙으로 돌아왔을 때 카운트 증가
      if (result.direction === "center" && lastDirection !== "center") {
        setExerciseCount((prev) => {
          const newCount = prev + 1
          const progress = (newCount / requiredCount) * 100
          setExerciseProgress(progress)

          if (newCount >= requiredCount) {
            setFeedbackMessage("운동 완료! 훌륭합니다!")
            setTimeout(() => {
              onDetectionComplete("success")
            }, 1000)
          }

          return newCount
        })
      }

      setLastDirection(result.direction)
    }

    setFeedbackMessage(result.feedback)
  }

  // 누운 자세 피드백 메시지 생성 (45도 촬영 최적화)
  const generateLyingDownFeedback = (
    direction: "center" | "left" | "right",
    count: number,
    isCorrectPose: boolean,
    isLyingDown: boolean,
    hasProperDepth: boolean,
  ) => {
    if (!hasProperDepth) {
      return "카메라를 45도 각도에서 촬영해주세요. 어깨와 몸이 잘 보이도록 📐"
    }

    if (!isLyingDown) {
      return "편안하게 누워주세요. 수숨슬립 베개를 목 아래 받치고 🛏️"
    }

    if (!isCorrectPose) {
      return "자세를 조정해주세요. 머리와 목이 편안하게 베개에 올려져 있나요? 📏"
    }

    if (count >= requiredCount) {
      return "🎉 목 운동 완료! 척추가 시원해졌을 거예요! 🎆"
    }

    const progress = Math.round((count / requiredCount) * 100)

    switch (direction) {
      case "left":
        return `👈 왼쪽으로 목 돌리기 - 척추 C1~C7이 풀어지고 있어요! (${count}/${requiredCount}회, ${progress}%)`
      case "right":
        return `👉 오른쪽으로 목 돌리기 - 경추 마사지 효과! (${count}/${requiredCount}회, ${progress}%)`
      case "center":
        return `✅ 중앙 자세 - 숨을 고르며 계속 좌우로 돌려주세요 (${count}/${requiredCount}회, ${progress}%)`
      default:
        return `목을 좌우로 천천히 돌려주세요. 뇌척수액 순환에 도움됩니다 🔄 (${count}/${requiredCount}회, ${progress}%)`
    }
  }

  // 카메라 시작 (중복 호출 방지)
  const startCamera = async () => {
    // 쿨다운 기간 체크 (5초 간격으로 제한)
    const now = Date.now()
    const cooldownPeriod = 5000 // 5초
    
    if (now - lastCameraAttemptRef.current < cooldownPeriod) {
      const remaining = Math.ceil((cooldownPeriod - (now - lastCameraAttemptRef.current)) / 1000)
      console.warn(`⏰ 카메라 시작 쿨다운 중입니다. ${remaining}초 후 다시 시도하세요.`)
      setFeedbackMessage(`카메라 준비 중... ${remaining}초 후 다시 시도하세요`)
      return
    }

    // 더 강력한 중복 실행 방지 체크
    if (cameraStartingRef.current || isLoading || isActive || stream) {
      console.warn("⚠️ 카메라가 이미 실행 중이거나 준비 중입니다. 중복 호출을 방지합니다.", {
        cameraStarting: cameraStartingRef.current,
        isLoading,
        isActive,
        hasStream: !!stream,
        mediaPipeStatus,
        caller: new Error().stack?.split('\n')[2]?.trim() // 호출자 추적
      })
      return
    }

    // MediaPipe가 준비되지 않았으면 대기
    if (mediaPipeStatus !== "ready") {
      console.warn("⚠️ MediaPipe가 아직 준비되지 않았습니다. 현재 상태:", mediaPipeStatus)
      setFeedbackMessage("MediaPipe 준비 중... 잠시만 기다려주세요")
      return
    }

    lastCameraAttemptRef.current = now // 마지막 시도 시간 기록
    console.log("📷 카메라 시작 요청 승인됨. 호출자:", new Error().stack?.split('\n')[2]?.trim())
    cameraStartingRef.current = true // 시작 플래그 설정

    // 워치독 타이머: 30초 후 자동으로 플래그 해제
    const watchdogTimer = setTimeout(() => {
      if (cameraStartingRef.current) {
        console.error("🚨 워치독: 카메라 시작이 30초를 초과했습니다. 플래그를 강제 해제합니다.")
        cameraStartingRef.current = false
        setIsLoading(false)
      }
    }, 30000)

    try {
      console.log("📷 카메라 시작 요청...")
      setIsLoading(true)
      setError(null)

      // 기존 스트림 정리
      if (stream) {
        console.log("🛑 기존 스트림 중지...")
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("이 브라우저는 카메라를 지원하지 않습니다")
      }

      console.log("📷 카메라 권한 요청 중...")

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 },
          facingMode: "environment", // 후면 카메라 (옆에서 촬영)
          frameRate: { ideal: 30, min: 15, max: 60 },
        },
        audio: false,
      })

      console.log("✅ 카메라 스트림 성공 획득:", mediaStream.getVideoTracks()[0].getSettings())

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)

        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not available"))
            return
          }

          const video = videoRef.current
          const onLoadedData = () => {
            video.removeEventListener("loadeddata", onLoadedData)
            video.removeEventListener("error", onError)
            resolve(void 0)
          }

          const onError = (e: any) => {
            video.removeEventListener("loadeddata", onLoadedData)
            video.removeEventListener("error", onError)
            reject(new Error(`Video loading error: ${e.message || "Unknown error"}`))
          }

          video.addEventListener("loadeddata", onLoadedData)
          video.addEventListener("error", onError)
          video.play().catch(reject)
        })

        console.log("🎬 비디오 스트림 준비 완료")
        setIsActive(true)
        setFeedbackMessage("📹 카메라가 활성화되었습니다! 운동을 시작하세요")

        // MediaPipe 또는 시뮬레이션 시작 (상태 변경 후 지연)
        setTimeout(() => {
          if (useRealDetection && poseDetector && mediaPipeStatus === "ready") {
            console.log("🎯 MediaPipe 포즈 감지 시작...")
            setMediaPipeStatus("running")
            // 비디오가 완전히 준비될 때까지 추가 대기
            setTimeout(() => {
              if (videoRef.current && videoRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
                console.log("✅ 비디오 준비 완료, 포즈 감지 시작")
                startPoseDetection()
              } else {
                console.warn("⚠️ 비디오가 아직 준비되지 않음, 시뮬레이션 모드로 전환")
                startSimulation()
              }
            }, 1500) // 비디오 준비 대기 시간 증가
          } else {
            console.log("🎭 시뮬레이션 모드 시작...")
            startSimulation()
          }
        }, 500) // 상태 변경 반영 대기
      }

      setIsLoading(false)
      cameraStartingRef.current = false // 성공 시 플래그 해제
      clearTimeout(watchdogTimer) // 워치독 타이머 해제
    } catch (err: any) {
      console.error("💥 카메라 시작 실패:", err)
      setIsLoading(false)
      cameraStartingRef.current = false // 에러 시 플래그 해제
      clearTimeout(watchdogTimer) // 워치독 타이머 해제

      let errorMessage = "카메라에 접근할 수 없습니다."

      if (err.name === "NotAllowedError") {
        errorMessage = "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요."
      } else if (err.name === "NotFoundError") {
        errorMessage = "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요."
      } else if (err.name === "NotReadableError") {
        errorMessage = "카메라가 다른 애플리케이션에서 사용 중입니다."
      }

      setError(errorMessage)
    }
  }

  // 포즈 감지 시작 (최적화된)
  const startPoseDetection = () => {
    let frameCount = 0
    let lastProcessTime = 0
    const targetFPS = 20 // 안정적인 FPS로 조정
    const frameInterval = 1000 / targetFPS

    console.log("🎯 포즈 감지 루프 시작...")

    const detectPose = async () => {
      if (!isActive || !videoRef.current || !poseDetector) {
        return
      }

      const now = performance.now()
      
      if (now - lastProcessTime < frameInterval) {
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(detectPose)
        }
        return
      }
      lastProcessTime = now

      try {
        frameCount++
        const currentTime = Date.now()
        if (currentTime - lastFpsTimeRef.current >= 1000) {
          setFps(frameCount)
          frameCount = 0
          lastFpsTimeRef.current = currentTime
        }

        const video = videoRef.current
        if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && video.videoWidth > 0 && !video.paused) {
          await poseDetector.send({ image: video })
        }
      } catch (err: any) {
        console.error("💥 포즈 감지 오류:", err)
        if (err.message && err.message.includes("send")) {
          setError("카메라 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.")
        }
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectPose)
      }
    }

    setTimeout(() => {
      if (isActive) {
        detectPose()
      }
    }, 500)
  }

  // 시뮬레이션 시작 (폴백)
  const startSimulation = () => {
    let phase = 0
    simulationIntervalRef.current = setInterval(() => {
      const directions: ("center" | "left" | "right")[] = ["center", "left", "center", "right"]
      const currentDir = directions[phase]

      setCurrentDirection(currentDir)

      if (phase === 2) {
        setExerciseCount((prev) => {
          const newCount = prev + 1
          const progress = (newCount / requiredCount) * 100
          setExerciseProgress(progress)

          if (newCount >= requiredCount) {
            setFeedbackMessage("운동 완료! 훌륭합니다!")
            setTimeout(() => {
              onDetectionComplete("success")
            }, 1000)
          } else {
            setFeedbackMessage(`목 유연운동 진행 중... (${newCount}/${requiredCount}회)`)
          }

          return newCount
        })
      }

      phase = (phase + 1) % 4
    }, 2000)
  }

  // 카메라 중지
  const stopCamera = () => {
    console.log("🛑 카메라 중지 요청...")
    
    // 중복 방지 플래그도 초기화
    cameraStartingRef.current = false
    setIsActive(false)
    setMediaPipeStatus("ready")

    if (stream) {
      console.log("🎬 스트림 트랙 중지...")
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log(`📹 트랙 중지: ${track.kind} (${track.label})`)
      })
      setStream(null)
    }

    if (videoRef.current) {
      console.log("📺 비디오 엘리먼트 정리...")
      videoRef.current.srcObject = null
    }

    if (simulationIntervalRef.current) {
      console.log("🎭 시뮬레이션 중지...")
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }

    if (animationFrameRef.current) {
      console.log("🎯 포즈 감지 중지...")
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }

    // 상태 초기화
    setExerciseCount(0)
    setExerciseProgress(0)
    setFeedbackMessage("카메라가 중지되었습니다")
    setCurrentDirection("center")
    setLastDirection("center")
    
    console.log("✅ 카메라 완전히 중지됨")
  }

  // 운동 재시작
  const resetExercise = () => {
    setExerciseCount(0)
    setExerciseProgress(0)
    setCurrentDirection("center")
    setLastDirection("center")
    setFeedbackMessage("운동을 다시 시작합니다")

    if (isActive) {
      if (useRealDetection && poseDetector) {
        // MediaPipe는 이미 실행 중이므로 카운터만 리셋
      } else {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current)
        }
        startSimulation()
      }
    }
  }

  // 정리 함수
  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
    }
  }

  // 상태 표시 헬퍼
  const getStatusColor = () => {
    if (!isActive) return "bg-gray-400"
    if (useRealDetection && mediaPipeStatus === "running") return "bg-green-500"
    if (mediaPipeStatus === "error") return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getStatusText = () => {
    if (!isActive) return "대기중"
    if (useRealDetection && mediaPipeStatus === "running") return "AI감지"
    if (mediaPipeStatus === "error") return "시뮬레이션"
    return "준비중"
  }

  // 에러 표시
  if (error && mediaPipeStatus !== "error") {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">카메라 오류</h3>
          <p className="text-red-600 mb-4 text-sm leading-relaxed">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={async () => {
                if (retryInProgressRef.current) {
                  console.warn("⚠️ 재시도가 이미 진행 중입니다.")
                  return
                }
                retryInProgressRef.current = true
                try {
                  setError(null)
                  loadAttemptRef.current = 0
                  
                  // MediaPipe를 먼저 로드하고 완료된 후에 카메라 시작
                  console.log("🔄 재시도: MediaPipe 로딩 시작...")
                  await loadMediaPipe()
                  
                  // MediaPipe가 ready 상태가 되었는지 확인
                  if (mediaPipeStatus === "ready") {
                    console.log("🎯 재시도: MediaPipe 준비 완료, 카메라 시작...")
                    await startCamera()
                  } else {
                    console.warn("⚠️ 재시도: MediaPipe가 준비되지 않음, 상태:", mediaPipeStatus)
                  }
                } catch (err) {
                  console.error("💥 재시도 중 오류:", err)
                } finally {
                  retryInProgressRef.current = false
                }
              }}
              className="w-full"
              disabled={retryInProgressRef.current}
            >
              {retryInProgressRef.current ? "재시도 중..." : "다시 시도"}
            </Button>
            <Button variant="outline" onClick={() => setError(null)} className="w-full">
              취소
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 표시
  if (isLoading && (mediaPipeStatus === "loading" || loadAttemptRef.current > 0)) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">MediaPipe 라이브러리 로딩 중...</p>
          <p className="text-sm text-gray-500 mt-2">
            시도 {loadAttemptRef.current}/2 - 잠시만 기다려주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isActive ? 'fixed inset-0 z-50 bg-black' : 'space-y-4'}`}>
      {/* 비활성화 상태에서만 설정 표시 */}
      {!isActive && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {useRealDetection ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm font-medium">
                {useRealDetection ? "AI 포즈 감지 모드" : "시뮬레이션 모드"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (useRealDetection) {
                  fallbackToSimulation()
                } else {
                  loadAttemptRef.current = 0
                  loadMediaPipe()
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {useRealDetection ? "시뮬레이션으로" : "AI감지 재시도"}
            </Button>
          </div>
        </div>
      )}

      {/* 운동 진행 상황 - 전체화면에서는 상단 오버레이 */}
      {isActive && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-black bg-opacity-70 backdrop-blur-sm p-3 rounded-lg border border-white/30 safe-top">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">운동 진행률</span>
            <span className="text-sm text-blue-400 font-medium">
              {exerciseCount}/{requiredCount}회
            </span>
          </div>
          <Progress value={exerciseProgress} className="h-3 mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>목표: 20회 완료</span>
            <span className="font-medium">{Math.round(exerciseProgress)}%</span>
          </div>
        </div>
      )}

      {/* 상태 표시 - 비활성화 상태에서만 */}
      {!isActive && (
        <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium text-gray-700">상태: {getStatusText()}</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <Button variant="ghost" size="sm" onClick={() => setShowLandmarks(!showLandmarks)} className="h-6 px-2">
              {showLandmarks ? "랜드마크 표시" : "랜드마크 숨기기"}
            </Button>
          </div>
        </div>
      )}

      {/* 카메라 화면 - 전체화면 모드 */}
      <div className={`relative bg-gray-900 overflow-hidden ${
        isActive 
          ? 'w-full h-full min-h-screen' 
          : 'aspect-video rounded-lg'
      }`}>
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
          playsInline
          muted
          autoPlay
          style={{ display: isActive ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            backgroundColor: "transparent",
            transform: "scaleX(-1)",
            zIndex: 20,
            mixBlendMode: "normal",
            opacity: showLandmarks ? 1 : 0,
          }}
        />

        {/* 상태 오버레이 */}
        <div className="absolute top-2 left-2 z-30">
          <div className={`px-2 py-1 rounded text-xs text-white ${getStatusColor()} bg-opacity-80`}>
            {getStatusText()}
            {isActive && fps > 0 && ` | ${fps}fps`}
            {detectedPoses > 0 && ` | 인식됨`}
          </div>
        </div>

        {/* 랜드마크 토글 */}
        <div className={`absolute z-30 ${
          isActive ? 'top-6 right-4' : 'top-2 right-2'
        }`}>
          <Button
            variant="ghost"
            size={isActive ? "default" : "sm"}
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`text-white hover:bg-opacity-70 backdrop-blur-sm ${
              isActive ? 'h-12 px-4' : 'h-8 px-2'
            } ${
              showLandmarks 
                ? "bg-green-600 bg-opacity-80" 
                : "bg-black bg-opacity-50"
            }`}
          >
            {showLandmarks ? "랜드마크 ON" : "랜드마크 OFF"}
          </Button>
        </div>

        {/* 디버깅 정보 */}
        {isActive && (
          <div className="absolute bottom-36 right-4 z-30">
            <div className="bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="font-mono space-y-1">
                <div>FPS: <span className="text-green-400">{fps}</span></div>
                <div>인식: <span className={detectedPoses > 0 ? 'text-green-400' : 'text-red-400'}>{detectedPoses > 0 ? '성공' : '실패'}</span></div>
                <div>모드: <span className="text-yellow-400">{useRealDetection ? 'AI' : '시뮬레이션'}</span></div>
                <div>상태: <span className="text-blue-400">{mediaPipeStatus}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 실시간 피드백 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`px-3 py-2 rounded-lg text-sm text-center font-medium ${
              exerciseCount >= requiredCount
                ? "bg-green-600 bg-opacity-90 text-white"
                : isActive
                  ? "bg-blue-600 bg-opacity-90 text-white"
                  : "bg-gray-600 bg-opacity-90 text-white"
            }`}
          >
            {feedbackMessage}
          </div>
        </div>

        {/* 방향 인디케이터 */}
        {isActive && (
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex space-x-8 mb-2">
              <div
                className={`w-8 h-8 rounded-full border-3 ${currentDirection === "left" ? "border-yellow-400 bg-yellow-400 animate-pulse shadow-lg" : "border-white/50 bg-gray-600/50"} transition-all duration-300`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full border-3 ${currentDirection === "center" ? "border-green-400 bg-green-400 animate-pulse shadow-lg" : "border-white/50 bg-gray-600/50"} transition-all duration-300`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full border-3 ${currentDirection === "right" ? "border-yellow-400 bg-yellow-400 animate-pulse shadow-lg" : "border-white/50 bg-gray-600/50"} transition-all duration-300`}
              ></div>
            </div>
            <div className="text-center text-white text-sm bg-black bg-opacity-70 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/30">
              <div className="flex justify-between text-xs opacity-80">
                <span>←왼쪽</span>
                <span>중앙</span>
                <span>오른쪽→</span>
              </div>
            </div>
          </div>
        )}

        {/* 완료 표시 */}
        {exerciseCount >= requiredCount && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-600 bg-opacity-20">
            <div className="text-center text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
              <p className="text-xl font-bold">운동 완료!</p>
            </div>
          </div>
        )}

        {/* 전체화면 모드 컨트롤 버튼 */}
        {isActive && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex space-x-4">
              <Button 
                onClick={stopCamera} 
                variant="outline" 
                size="lg"
                className="bg-red-600 bg-opacity-80 text-white border-red-400 hover:bg-red-700 backdrop-blur-sm"
              >
                <CameraOff className="w-5 h-5 mr-2" />
                종료
              </Button>
              <Button 
                onClick={resetExercise} 
                variant="outline" 
                size="lg"
                className="bg-blue-600 bg-opacity-80 text-white border-blue-400 hover:bg-blue-700 backdrop-blur-sm"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                재시작
              </Button>
            </div>
          </div>
        )}

        {/* 비활성화 상태 */}
        {!isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg">카메라를 시작하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 버튼 - 비활성화 상태에서만 */}
      {!isActive && (
        <div className="flex space-x-3">
          <Button onClick={startCamera} className="flex-1" disabled={isLoading}>
            <Camera className="w-4 h-4 mr-2" />
            {isLoading ? "시작 중..." : "카메라 시작"}
          </Button>
        </div>
      )}

      {/* 사용 안내 - 비활성화 상태에서만 */}
      {!isActive && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 📱 <strong>가로 촬영:</strong> 휴대폰을 가로로 놓고 촬영하세요</p>
          <p>• 📐 <strong>촬영 각도:</strong> 옆에서 45도 비스듬히 촬영하세요</p>
          <p>• 🛏️ <strong>누운 자세:</strong> 편안하게 누워서 수숨슬립을 목 아래 받치세요</p>
          <p>• 🔄 <strong>운동 방법:</strong> 목을 좌우로 천천히 20회 돌려주세요</p>
          <p>• 🫁 <strong>호흡:</strong> 들숨에 좌우로, 날숨에 중앙으로 돌아오세요</p>
          {useRealDetection ? (
            <p className="text-green-600">• ✅ AI 포즈 감지가 활성화되었습니다!</p>
          ) : (
            <p className="text-yellow-600">• ⚠️ 현재 시뮬레이션 모드로 실행 중입니다</p>
          )}
        </div>
      )}
    </div>
  )
}