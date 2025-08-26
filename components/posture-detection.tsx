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

// MediaPipe 타입 정의
declare global {
  interface Window {
    Pose: any
    drawConnectors: any
    drawLandmarks: any
    POSE_CONNECTIONS: any
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
  const [feedbackMessage, setFeedbackMessage] = useState("MediaPipe 로딩 중...")
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

  useEffect(() => {
    loadMediaPipe()
    return cleanup
  }, [])

  // MediaPipe 로드
  const loadMediaPipe = async () => {
    try {
      setMediaPipeStatus("loading")
      setFeedbackMessage("MediaPipe 라이브러리 로딩 중...")

      // 이미 로드되었는지 확인
      if (window.Pose && window.drawConnectors && window.drawLandmarks) {
        console.log("MediaPipe already loaded")
        initializeMediaPipe()
        return
      }

      // 스크립트 로드 함수 개선
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // 이미 로드된 스크립트 확인
          const existingScript = document.querySelector(`script[src="${src}"]`)
          if (existingScript) {
            resolve()
            return
          }

          const script = document.createElement("script")
          script.src = src
          script.async = true
          script.crossOrigin = "anonymous"

          const timeout = setTimeout(() => {
            if (document.head.contains(script)) {
              document.head.removeChild(script)
            }
            reject(new Error(`Script loading timeout: ${src}`))
          }, 30000) // 30초로 증가

          script.onload = () => {
            clearTimeout(timeout)
            console.log(`Successfully loaded: ${src}`)
            // 스크립트 로드 후 잠시 대기하여 객체 초기화 시간 확보
            setTimeout(resolve, 300)
          }

          script.onerror = () => {
            clearTimeout(timeout)
            if (document.head.contains(script)) {
              document.head.removeChild(script)
            }
            reject(new Error(`Failed to load ${src}`))
          }

          document.head.appendChild(script)
        })
      }

      // MediaPipe 스크립트들 최적화된 순서로 로드
      const scripts = [
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js",
      ]

      console.log("Loading MediaPipe scripts...")
      for (const script of scripts) {
        console.log(`Loading: ${script}`)
        await loadScript(script)
        // 각 스크립트 로드 후 대기 시간 증가
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // 로드 완료 후 객체 확인
      let retries = 0
      const maxRetries = 15

      while (retries < maxRetries) {
        if (window.Pose && window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
          console.log("All MediaPipe objects available")
          break
        }

        console.log(`Waiting for MediaPipe objects... (${retries + 1}/${maxRetries})`)
        console.log(`Available objects: Pose=${!!window.Pose}, drawConnectors=${!!window.drawConnectors}, drawLandmarks=${!!window.drawLandmarks}, POSE_CONNECTIONS=${!!window.POSE_CONNECTIONS}`)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        retries++
      }

      if (retries >= maxRetries) {
        throw new Error("MediaPipe objects not available after loading")
      }

      await initializeMediaPipe()
    } catch (err) {
      console.error("MediaPipe 로드 실패:", err)
      setError(`MediaPipe 로드에 실패했습니다: ${err.message}`)
      setMediaPipeStatus("error")
      fallbackToSimulation()
    }
  }

  // MediaPipe 초기화
  const initializeMediaPipe = async () => {
    try {
      console.log("Initializing MediaPipe...")
      setIsLoading(true)

      // MediaPipe 객체가 실제로 사용 가능한지 확인
      if (!window.Pose) {
        throw new Error("Pose constructor not available")
      }
      if (!window.drawConnectors || !window.drawLandmarks) {
        throw new Error("Drawing utilities not available")
      }
      if (!window.POSE_CONNECTIONS) {
        throw new Error("POSE_CONNECTIONS not available")
      }

      const pose = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        },
      })

      // 설정 최적화 - 인식 정확도 향상
      await pose.setOptions({
        modelComplexity: 1, // 0: Lite, 1: Full, 2: Heavy
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5, // 낮춰서 더 잘 감지하도록
        minTrackingConfidence: 0.3,  // 낮춰서 더 잘 추적하도록
        staticImageMode: false,
      })

      console.log("MediaPipe options set successfully")

      pose.onResults((results: any) => {
        try {
          console.log("=== MediaPipe Results ===", {
            timestamp: Date.now(),
            poseLandmarks: !!results.poseLandmarks,
            landmarkCount: results.poseLandmarks?.length || 0,
            canvasRef: !!canvasRef.current,
            videoRef: !!videoRef.current,
            showLandmarks: showLandmarks
          })
          
          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            console.log("✅ LANDMARKS DETECTED!", {
              count: results.poseLandmarks.length,
              firstLandmark: results.poseLandmarks[0],
              showLandmarks: showLandmarks
            })
            
            // 랜드마크가 있으면 그리기 시도
            drawResults(results)
            analyzePosture(results.poseLandmarks)
            setDetectedPoses(1)
            setError(null)
            
            if (feedbackMessage === "사람이 감지되지 않습니다. 카메라 앞으로 와주세요") {
              setFeedbackMessage("✅ 사용자가 감지되었습니다!")
            }
          } else {
            console.log("⚠️ No landmarks detected")
            setDetectedPoses(0)
            if (feedbackMessage !== "사람이 감지되지 않습니다. 카메라 앞으로 와주세요") {
              setFeedbackMessage("사람이 감지되지 않습니다. 카메라 앞으로 와주세요")
            }
          }
        } catch (err) {
          console.error("❌ Results processing error:", err)
          setFeedbackMessage("포즈 분석 중 오류가 발생했습니다")
        }
      })

      // 에러 핸들링 강화
      pose.onError = (error: any) => {
        console.error("MediaPipe Pose error:", error)
        setError("포즈 감지 중 오류가 발생했습니다")
      }

      // pose 초기화 완료까지 대기
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPoseDetector(pose)
      setMediaPipeStatus("ready")
      setUseRealDetection(true)
      setFeedbackMessage("MediaPipe 준비 완료! 카메라를 시작하세요")
      setIsLoading(false)
      console.log("MediaPipe initialized successfully")
    } catch (err) {
      console.error("MediaPipe 초기화 실패:", err)
      setError(`MediaPipe 초기화에 실패했습니다: ${err.message}`)
      setMediaPipeStatus("error")
      fallbackToSimulation()
      setIsLoading(false)
    }
  }

  // 시뮬레이션 모드로 전환
  const fallbackToSimulation = () => {
    setMediaPipeStatus("error")
    setUseRealDetection(false)
    setFeedbackMessage("시뮬레이션 모드로 실행됩니다")
  }

  // 결과 그리기 - 강화된 디버깅
  const drawResults = (results: any) => {
    console.log("🎨 drawResults 호출", {
      hasCanvas: !!canvasRef.current,
      hasVideo: !!videoRef.current,
      showLandmarks: showLandmarks,
      landmarksCount: results.poseLandmarks?.length || 0
    })

    if (!canvasRef.current || !videoRef.current) {
      console.log("❌ Canvas or video ref not available")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.log("❌ Canvas context not available")
      return
    }

    const videoWidth = videoRef.current.videoWidth
    const videoHeight = videoRef.current.videoHeight
    
    console.log("📹 Video dimensions:", { videoWidth, videoHeight })
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.log("⚠️ Video dimensions not ready")
      return
    }

    // 캔버스 크기 설정
    const oldWidth = canvas.width
    const oldHeight = canvas.height
    canvas.width = videoWidth
    canvas.height = videoHeight
    
    if (oldWidth !== videoWidth || oldHeight !== videoHeight) {
      console.log("🔄 Canvas resized:", { from: `${oldWidth}x${oldHeight}`, to: `${videoWidth}x${videoHeight}` })
    }

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // 테스트를 위한 배경 색상
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    console.log("🟥 배경 색상 테스트 그리기 완료")

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      console.log(`🔴 ${results.poseLandmarks.length}개 랜드마크 그리기 시작`)
      
      if (showLandmarks) {
        console.log("✅ 랜드마크 표시 모드 - 그리기 시작")
        drawPoseConnections(ctx, results.poseLandmarks)
        drawPoseLandmarks(ctx, results.poseLandmarks)
        console.log("✅ 랜드마크 그리기 완료")
      } else {
        console.log("🙅 랜드마크 비표시 모드")
      }

      // 배경 피드백 색상
      try {
        const poseResult = validateNeckExercise(results.poseLandmarks)
        if (poseResult.isCorrectPose) {
          ctx.fillStyle = "rgba(0, 255, 0, 0.1)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      } catch (err) {
        console.error("❌ Error in pose validation:", err)
      }
    } else {
      console.log("⚠️ No pose landmarks to draw")
    }

    ctx.restore()
    console.log("✅ drawResults 완료")
  }

  // 포즈 연결선 그리기
  const drawPoseConnections = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return
    
    console.log("Drawing pose connections manually")
    
    // MediaPipe 포즈 연결선 정의
    const connections = [
      // 얼굴
      [0, 1], [1, 2], [2, 3], [3, 7], // 코 -> 오른쪽 얼굴
      [0, 4], [4, 5], [5, 6], [6, 8], // 코 -> 왼쪽 얼굴
      
      // 몸통
      [9, 10], // 입
      [11, 12], // 어깨 연결
      [11, 23], [12, 24], // 어깨 -> 엉덩이
      [23, 24], // 엉덩이 연결
      
      // 오른쪽 팔
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      
      // 왼쪽 팔
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      
      // 오른쪽 다리
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      
      // 왼쪽 다리
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ]
    
    ctx.strokeStyle = "#00FF41"
    ctx.lineWidth = 3
    
    connections.forEach(([startIdx, endIdx]) => {
      const startLandmark = landmarks[startIdx]
      const endLandmark = landmarks[endIdx]
      
      if (startLandmark && endLandmark) {
        // visibility 체크
        const startVisible = !startLandmark.visibility || startLandmark.visibility > 0.3
        const endVisible = !endLandmark.visibility || endLandmark.visibility > 0.3
        
        if (startVisible && endVisible) {
          const startX = startLandmark.x * ctx.canvas.width
          const startY = startLandmark.y * ctx.canvas.height
          const endX = endLandmark.x * ctx.canvas.width
          const endY = endLandmark.y * ctx.canvas.height
          
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      }
    })
  }

  // 포즈 랜드마크 그리기
  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return
    
    console.log("Drawing pose landmarks manually")
    
    landmarks.forEach((landmark, index) => {
      // visibility 체크
      if (landmark.visibility && landmark.visibility < 0.3) return
      
      const x = landmark.x * ctx.canvas.width
      const y = landmark.y * ctx.canvas.height
      
      // 중요한 포인트는 더 크게
      const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24] // 코, 어깨, 팔꿈치, 손목, 엉덩이
      const radius = keyPoints.includes(index) ? 5 : 3
      
      // 원 그리기
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = "#FF0000"
      ctx.fill()
      
      // 테두리
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 중요한 포인트에 번호 표시 (디버깅용)
      if (keyPoints.includes(index)) {
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(index.toString(), x, y - radius - 2)
      }
    })
  }

  // 목 운동 검증 (개선된 버전)
  const validateNeckExercise = (landmarks: any[]) => {
    if (!landmarks || landmarks.length < 33) {
      console.log("Invalid landmarks:", { length: landmarks?.length })
      return {
        isCorrectPose: false,
        direction: "center" as const,
        feedback: "자세를 인식할 수 없습니다",
      }
    }

    try {
      const nose = landmarks[0]           // 코
      const leftEye = landmarks[2]        // 왼쪽 눈
      const rightEye = landmarks[5]       // 오른쪽 눈
      const leftEar = landmarks[7]        // 왼쪽 귀
      const rightEar = landmarks[8]       // 오른쪽 귀
      const leftShoulder = landmarks[11]  // 왼쪽 어깨
      const rightShoulder = landmarks[12] // 오른쪽 어깨

      // 필수 랜드마크 검증
      if (!nose || !leftShoulder || !rightShoulder) {
        console.log("Missing essential landmarks:", { nose: !!nose, leftShoulder: !!leftShoulder, rightShoulder: !!rightShoulder })
        return {
          isCorrectPose: false,
          direction: "center" as const,
          feedback: "얼굴과 어깨가 보이도록 자세를 조정하세요",
        }
      }

      // visibility 체크
      const visibilityThreshold = 0.3
      if (nose.visibility && nose.visibility < visibilityThreshold) {
        console.log("Low nose visibility:", nose.visibility)
        return {
          isCorrectPose: false,
          direction: "center" as const,
          feedback: "얼굴이 명확하게 보이도록 조정하세요",
        }
      }

      // 어깨 중심점 계산
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2
      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2

      // 머리 중심점 계산 (더 정확한 계산)
      let headCenterX = nose.x
      let headCenterY = nose.y
      
      // 눈과 귀를 포함한 머리 중심 계산
      const facialLandmarks = [nose, leftEye, rightEye, leftEar, rightEar].filter(landmark => landmark && landmark.visibility > 0.3)
      if (facialLandmarks.length >= 3) {
        headCenterX = facialLandmarks.reduce((sum, landmark) => sum + landmark.x, 0) / facialLandmarks.length
        headCenterY = facialLandmarks.reduce((sum, landmark) => sum + landmark.y, 0) / facialLandmarks.length
      }

      const headOffset = headCenterX - shoulderCenterX

      // 방향 감지 (임계값 개선)
      let direction: "center" | "left" | "right" = "center"
      const threshold = 0.08 // 임계값 증가로 노이즈 감소

      if (headOffset > threshold) {
        direction = "right"
      } else if (headOffset < -threshold) {
        direction = "left"
      }

      // 누워있는 자세 확인 (어깨 수평도 체크)
      const shoulderAngle = Math.abs(leftShoulder.y - rightShoulder.y)
      const isLyingDown = shoulderAngle < 0.15 // 임계값 증가

      // 머리와 어깨의 상대적 위치 확인
      const headAboveShoulders = headCenterY < shoulderCenterY + 0.15
      
      // 전체적인 자세 평가
      const isCorrectPose = isLyingDown && headAboveShoulders
      
      console.log("Pose analysis:", {
        direction,
        headOffset: headOffset.toFixed(3),
        shoulderAngle: shoulderAngle.toFixed(3),
        isLyingDown,
        headAboveShoulders,
        isCorrectPose
      })

      return {
        isCorrectPose,
        direction,
        feedback: generateFeedback(direction, exerciseCount, isCorrectPose, isLyingDown),
      }
    } catch (err) {
      console.error("Pose validation error:", err)
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

  // 피드백 메시지 생성 (개선된 버전)
  const generateFeedback = (
    direction: "center" | "left" | "right",
    count: number,
    isCorrectPose: boolean,
    isLyingDown: boolean,
  ) => {
    if (!isLyingDown) {
      return "편안하게 누워주세요. 어깨가 수평이 되도록 하세요 🛏️"
    }

    if (!isCorrectPose) {
      return "자세를 조정해주세요. 머리가 어깨 위에 오도록 하세요 📏"
    }

    if (count >= requiredCount) {
      return "🎉 운동 완료! 훌륭합니다! 🎆"
    }

    const remaining = requiredCount - count
    const progress = Math.round((count / requiredCount) * 100)

    switch (direction) {
      case "left":
        return `👈 왼쪽 목 돌리기 - 좋습니다! (${count}/${requiredCount}회, ${progress}%)`
      case "right":
        return `👉 오른쪽 목 돌리기 - 좋습니다! (${count}/${requiredCount}회, ${progress}%)`
      case "center":
        return `✅ 중앙 자세 - 계속 좌우로 돌려주세요 (${count}/${requiredCount}회, ${progress}%)`
      default:
        return `목을 좌우로 천천히 돌려주세요 🔄 (${count}/${requiredCount}회, ${progress}%)`
    }
  }

  // 카메라 시작
  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 기존 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      // 카메라 권한 및 사용 가능성 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("이 브라우저는 카메라를 지원하지 않습니다")
      }

      console.log("Requesting camera access...")

      // 카메라 스트림 요청 (설정 최적화)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          facingMode: "user", // 전면 카메라
          frameRate: { ideal: 20, min: 10, max: 30 }, // 성능 최적화
        },
        audio: false,
      })

      console.log("Camera stream obtained:", mediaStream.getVideoTracks()[0].getSettings())

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)

        // 비디오 로드 대기
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

        setIsActive(true)
        setFeedbackMessage("카메라가 활성화되었습니다! 운동을 시작하세요")

        // MediaPipe 또는 시뮬레이션 시작
        if (useRealDetection && poseDetector && mediaPipeStatus === "ready") {
          console.log("Starting MediaPipe pose detection...")
          setMediaPipeStatus("running")
          // 비디오가 완전히 준비될 때까지 잠시 대기
          setTimeout(() => {
            if (isActive && videoRef.current && videoRef.current.readyState >= 2) {
              startPoseDetection()
            }
          }, 1000)
        } else {
          console.log("Starting simulation mode...")
          startSimulation()
        }
      }

      setIsLoading(false)
    } catch (err: any) {
      console.error("카메라 시작 실패:", err)
      setIsLoading(false)

      let errorMessage = "카메라에 접근할 수 없습니다."

      if (err.name === "NotAllowedError") {
        errorMessage = "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요."
      } else if (err.name === "NotFoundError") {
        errorMessage = "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요."
      } else if (err.name === "NotReadableError") {
        errorMessage = "카메라가 다른 애플리케이션에서 사용 중입니다."
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "요청한 카메라 설정을 지원하지 않습니다."
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    }
  }

  // 포즈 감지 시작
  const startPoseDetection = () => {
    let frameCount = 0
    let lastProcessTime = 0
    const targetFPS = 15 // FPS 제한으로 성능 최적화
    const frameInterval = 1000 / targetFPS

    console.log("Starting pose detection...")

    const detectPose = async () => {
      if (!isActive || !videoRef.current || !poseDetector) {
        console.log("Detection stopped:", { isActive, hasVideo: !!videoRef.current, hasPoseDetector: !!poseDetector })
        return
      }

      const now = performance.now()
      
      // FPS 제한
      if (now - lastProcessTime < frameInterval) {
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(detectPose)
        }
        return
      }
      lastProcessTime = now

      try {
        // FPS 계산
        frameCount++
        const currentTime = Date.now()
        if (currentTime - lastFpsTimeRef.current >= 1000) {
          setFps(frameCount)
          frameCount = 0
          lastFpsTimeRef.current = currentTime
        }

        // 비디오 준비 상태 상세 확인
        const video = videoRef.current
        const isVideoReady = video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA
        const hasValidDimensions = video.videoWidth > 0 && video.videoHeight > 0
        const isNotPaused = !video.paused && !video.ended
        
        if (isVideoReady && hasValidDimensions && isNotPaused) {
          console.log("Sending frame to MediaPipe...", {
            readyState: video.readyState,
            dimensions: `${video.videoWidth}x${video.videoHeight}`,
            currentTime: video.currentTime
          })
          
          await poseDetector.send({ image: video })
        } else {
          console.log("Video not ready:", {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            paused: video.paused,
            ended: video.ended
          })
        }
      } catch (err) {
        console.error("포즈 감지 오류:", err)
        // 에러 카운터 추가
        if (err.message && err.message.includes("send")) {
          setError("카메라 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.")
        }
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectPose)
      }
    }

    // 초기 시작 전 짧은 대기 시간
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
        // center로 돌아왔을 때
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
    setIsActive(false)
    setMediaPipeStatus("ready")

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // 정리
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // 상태 초기화
    setExerciseCount(0)
    setExerciseProgress(0)
    setFeedbackMessage("카메라가 중지되었습니다")
    setCurrentDirection("center")
    setLastDirection("center")
  }

  // 운동 재시작
  const resetExercise = () => {
    setExerciseCount(0)
    setExerciseProgress(0)
    setCurrentDirection("center")
    setLastDirection("center")
    setFeedbackMessage("운동을 다시 시작합니다")

    // 재시작
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

  // 상태 색상
  const getStatusColor = () => {
    if (!isActive) return "bg-gray-400"
    if (useRealDetection && mediaPipeStatus === "running") return "bg-green-500"
    if (mediaPipeStatus === "error") return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getStatusText = () => {
    if (!isActive) return "대기중"
    if (useRealDetection && mediaPipeStatus === "running") return "실제감지"
    if (mediaPipeStatus === "error") return "시뮬레이션"
    return "로딩중"
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
              onClick={() => {
                setError(null)
                startCamera()
              }}
              className="w-full"
            >
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => setError(null)} className="w-full">
              취소
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && mediaPipeStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">MediaPipe 라이브러리 로딩 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요.</p>
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
              <span className="text-sm font-medium">{useRealDetection ? "실제 포즈 감지 모드" : "시뮬레이션 모드"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (useRealDetection) {
                  fallbackToSimulation()
                } else {
                  loadMediaPipe()
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {useRealDetection ? "시뮬레이션으로" : "실제감지 시도"}
            </Button>
          </div>
        </div>
      )}

      {/* 운동 진행 상황 - 전체화면에서는 상단 오버레이 */}
      {isActive && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-black bg-opacity-60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">운동 진행률</span>
            <span className="text-sm text-blue-300">
              {exerciseCount}/{requiredCount}회
            </span>
          </div>
          <Progress value={exerciseProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>목표: 20회 완료</span>
            <span>{Math.round(exerciseProgress)}%</span>
          </div>
        </div>
      )}

      {/* 상태 표시 */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isActive ? "animate-pulse" : ""}`}></div>
          <span className="text-sm font-medium text-gray-700">상태: {getStatusText()}</span>
          {detectedPoses > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {useRealDetection ? `${detectedPoses}명 감지` : "시뮬레이션 활성"}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {isActive && <span>FPS: {fps}</span>}
          <Button variant="ghost" size="sm" onClick={() => setShowLandmarks(!showLandmarks)} className="h-6 px-2">
            {showLandmarks ? "랜드마크 표시" : "랜드마크 숨기기"}
          </Button>
        </div>
      </div>

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

        {/* 랜드마크 토글 - 전체화면 대응 */}
        <div className={`absolute z-30 ${
          isActive ? 'top-6 right-4' : 'top-2 right-2'
        }`}>
          <Button
            variant="ghost"
            size={isActive ? "default" : "sm"}
            onClick={() => {
              console.log("Toggling landmarks:", !showLandmarks)
              setShowLandmarks(!showLandmarks)
            }}
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
          <div className="absolute bottom-16 right-2 z-30">
            <div className="bg-black bg-opacity-70 text-white text-xs p-2 rounded">
              <div>FPS: {fps}</div>
              <div>인식: {detectedPoses > 0 ? '성공' : '실패'}</div>
              <div>랜드마크: {showLandmarks ? 'ON' : 'OFF'}</div>
              <div>MediaPipe: {mediaPipeStatus}</div>
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
          <div className="absolute top-12 left-4 right-4">
            <div className="flex justify-center space-x-4">
              <div
                className={`w-4 h-4 rounded-full ${currentDirection === "left" ? "bg-yellow-400 animate-pulse" : "bg-gray-400"}`}
              ></div>
              <div
                className={`w-4 h-4 rounded-full ${currentDirection === "center" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
              ></div>
              <div
                className={`w-4 h-4 rounded-full ${currentDirection === "right" ? "bg-yellow-400 animate-pulse" : "bg-gray-400"}`}
              ></div>
            </div>
            <div className="text-center text-white text-sm mt-1 bg-black bg-opacity-50 rounded px-2 py-1">
              ← 왼쪽 | 중앙 | 오른쪽 →
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

      {/* 컨트롤 버튼 */}
      <div className="flex space-x-3">
        {!isActive ? (
          <Button onClick={startCamera} className="flex-1" disabled={isLoading}>
            <Camera className="w-4 h-4 mr-2" />
            {isLoading ? "시작 중..." : "카메라 시작"}
          </Button>
        ) : (
          <>
            <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
              <CameraOff className="w-4 h-4 mr-2" />
              카메라 중지
            </Button>
            <Button onClick={resetExercise} variant="outline" className="flex-1 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 시작
            </Button>
          </>
        )}
      </div>

      {/* 사용 안내 */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• 편안하게 누워서 목에 수숨슬립을 받치세요</p>
        <p>• 목을 좌우로 천천히 20회 돌려주세요</p>
        <p>• 들숨에 좌우로, 날숨에 중앙으로 돌아오세요</p>
        {useRealDetection ? (
          <p className="text-green-600">• ✅ 실제 MediaPipe 포즈 감지가 활성화되었습니다!</p>
        ) : (
          <p className="text-yellow-600">• ⚠️ 현재 시뮬레이션 모드로 실행 중입니다</p>
        )}
      </div>
    </div>
  )
}
