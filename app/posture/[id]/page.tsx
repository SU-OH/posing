"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Play, Camera, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import PostureDetection from "@/components/posture-detection"

const postureData = {
  "sleep-posture": {
    name: "수숨슬립 자세",
    description: "수숨슬립을 활용한 전신 이완 및 수면의 질 향상 프로그램",
    totalDuration: "40분",
    steps: [
      {
        id: 1,
        title: "목 유연운동 (경추 1~7번)",
        description: "수숨슬립의 둥근면에 목을 받치고 도리도리 운동으로 경추를 이완시킵니다.",
        instructions: [
          "수숨슬립의 둥근면에 목(경추 1~7번)을 받치고 편하게 눕습니다",
          "전신에 힘을 빼고 천천히 호흡하면서 목을 어깨선에 맞춥니다",
          "들숨에 목을 왼쪽으로 천천히 돌립니다",
          "날숨에 천천히 중앙으로 돌아와서 날숨에 목을 오른쪽으로 돌립니다",
          "이 동작을 20회 반복합니다 (도리도리 운동)",
        ],
        warnings: [
          "목에 무리가 가지 않도록 천천히 움직이세요",
          "통증이 있다면 즉시 중단하세요",
          "호흡과 함께 자연스럽게 움직이세요",
        ],
        gif: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bbda9acb-b5d6-468c-bf50-7aaa6f3c529e-LU5J3kANJ3r7XzGxshTbbcmjfgVopu.mp4",
        duration: 180,
        repetitions: "20회",
        targetArea: "경추 1~7번",
      },
      {
        id: 2,
        title: "목 유연운동 (뇌척수액 순환)",
        description: "수숨슬립의 평면부를 베고 양손등을 이마에 올려 뇌척수액 순환을 돕습니다.",
        instructions: [
          "수숨슬립의 평면부를 베고 편하게 눕습니다",
          "자연스럽게 양 손등을 이마 위에 올립니다 (뇌척수액 흐름 도움)",
          "천천히 호흡하면서 들숨에 목을 왼쪽으로 천천히 돌립니다",
          "날숨에 천천히 중앙으로 돌아와서 날숨에 목을 오른쪽으로 돌립니다",
          "이 동작을 20회 반복합니다 (도리도리 운동)",
        ],
        warnings: [
          "손등이 이마에 자연스럽게 올라가도록 하세요",
          "목 움직임은 부드럽게 천천히 하세요",
          "뇌척수액 순환을 의식하며 호흡하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=목+유연운동+뇌척수액",
        duration: 180,
        repetitions: "20회",
        targetArea: "목, 뇌척수액 순환",
      },
      {
        id: 3,
        title: "머리 유연운동 (흉추 1,2번)",
        description: "수숨슬립의 곡면부를 머리에 받치고 머리 도리도리 운동을 합니다.",
        instructions: [
          "수숨슬립의 곡면부를 머리(흉추 1,2번)에 받치고 편하게 눕습니다",
          "천천히 호흡하면서 누운 자세에서 머리에 수숨슬립을 두고 전신에 힘을 뺍니다",
          "들숨에 머리를 왼쪽으로 천천히 돌립니다",
          "날숨에 천천히 중앙으로 돌아와서 날숨에 목을 오른쪽으로 돌립니다",
          "이 동작을 20회 반복합니다 (도리도리 운동)",
        ],
        warnings: [
          "머리 움직임은 목보다 더 부드럽게 하세요",
          "흉추 상부의 이완을 의식하세요",
          "어지러움을 느끼면 잠시 휴식하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=머리+유연운동+흉추",
        duration: 200,
        repetitions: "20회",
        targetArea: "흉추 1,2번",
      },
      {
        id: 4,
        title: "가슴열기운동 (흉추 4,5번)",
        description: "수숨슬립을 어깨 밑에 받치고 척추 전후운동으로 가슴을 열어줍니다.",
        instructions: [
          "수숨슬립의 평면부를 어깨 밑(흉추 4,5번)에 받치고 편하게 눕습니다",
          "어깨를 의식하면서 양팔을 자연스럽게 내리고, 양발을 모아 발등을 폈다 굽혔다 합니다 (20회)",
          "어깨를 의식하면서 기지개를 펴듯 양손을 머리 위에 올립니다",
          "양발을 모아서 발등을 폈다 굽혔다 하면서 상하운동을 합니다 (20회)",
          "척추 전후운동으로 가슴이 열리는 것을 느껴보세요",
        ],
        warnings: [
          "어깨에 무리가 가지 않도록 주의하세요",
          "척추의 자연스러운 움직임을 따라가세요",
          "호흡과 함께 부드럽게 움직이세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=가슴열기+흉추4-5",
        duration: 240,
        repetitions: "20회 × 2세트",
        targetArea: "흉추 4,5번",
      },
      {
        id: 5,
        title: "굽은 등 펴기 운동 (흉추 7,8번)",
        description: "수숨슬립을 등에 받치고 척추 전후운동으로 굽은 등을 펴줍니다.",
        instructions: [
          "수숨슬립의 평면부를 등(흉추 7,8번)에 받치고 편하게 눕습니다",
          "등을 의식하면서 양팔을 자연스럽게 내리고, 양발을 모아 발등을 폈다 굽혔다 합니다 (20회)",
          "등을 의식하면서 기지개를 펴듯 양손을 머리 위에 올립니다",
          "양발을 모아서 발등을 폈다 굽혔다 하면서 상하운동을 합니다 (20회)",
          "척추 전후운동으로 등이 펴지는 것을 느껴보세요",
        ],
        warnings: [
          "등 중앙 부위의 이완을 의식하세요",
          "과도하게 힘을 주지 마세요",
          "자연스러운 척추 곡선을 유지하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=등펴기+흉추7-8",
        duration: 240,
        repetitions: "20회 × 2세트",
        targetArea: "흉추 7,8번",
      },
      {
        id: 6,
        title: "허리만곡(S) 운동 (요추 4,5번)",
        description: "수숨슬립을 허리에 받치고 척추의 자연스러운 S자 곡선을 만들어줍니다.",
        instructions: [
          "수숨슬립의 평면부를 허리(요추 4,5번)에 받치고 편하게 눕습니다",
          "허리를 의식하면서 양팔을 자연스럽게 내리고, 양발을 모아 발등을 폈다 굽혔다 합니다 (20회)",
          "허리를 의식하면서 기지개를 펴듯 양손을 머리 위에 올립니다",
          "양발을 모아서 발등을 폈다 굽혔다 하면서 상하운동을 합니다 (20회)",
          "척추 전후운동으로 허리의 자연스러운 곡선을 느껴보세요",
        ],
        warnings: [
          "허리에 무리가 가지 않도록 주의하세요",
          "요추의 자연스러운 곡선을 의식하세요",
          "통증이 있다면 강도를 줄이세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=허리만곡+요추4-5",
        duration: 240,
        repetitions: "20회 × 2세트",
        targetArea: "요추 4,5번",
      },
      {
        id: 7,
        title: "골반 교정운동 (천골)",
        description: "수숨슬립을 꼬리뼈에 받치고 천골 부위를 이완시켜 골반을 교정합니다.",
        instructions: [
          "수숨슬립의 평면부를 꼬리뼈(천골)에 받치고 천천히 눕습니다",
          "천골을 의식하면서 양팔을 자연스럽게 내리고, 양발을 모아 발등을 폈다 굽혔다 합니다 (20회)",
          "천골을 의식하면서 기지개를 펴듯 양손을 머리 위에 올립니다",
          "양발을 모아서 발등을 폈다 굽혔다 하면서 상하운동을 합니다 (20회)",
          "천추 전후운동으로 골반의 균형을 맞춰보세요",
        ],
        warnings: [
          "꼬리뼈 부위가 아프지 않도록 조심하세요",
          "골반의 균형을 의식하며 움직이세요",
          "천골 부위의 이완을 느껴보세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=골반교정+천골",
        duration: 240,
        repetitions: "20회 × 2세트",
        targetArea: "천골",
      },
      {
        id: 8,
        title: "뭉친 허벅지 풀어주기 운동",
        description: "수숨슬립의 둥근면에 허벅지를 받치고 5분간 이완시킵니다.",
        instructions: [
          "수숨슬립의 둥근면에 허벅지를 받치고 천천히 눕습니다",
          "누운 자세에서 전신에 힘을 빼고 천천히 호흡합니다",
          "허벅지 근육이 수숨슬립에 의해 자연스럽게 이완되는 것을 느껴보세요",
          "5분간 이 자세를 유지하며 깊게 호흡합니다",
          "허벅지의 긴장이 풀리는 것을 의식하세요",
        ],
        warnings: [
          "허벅지에 무리가 가지 않도록 편안한 자세를 유지하세요",
          "혈액순환이 잘 되도록 자연스럽게 호흡하세요",
          "불편함을 느끼면 자세를 조정하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=허벅지+이완",
        duration: 300,
        repetitions: "5분간 유지",
        targetArea: "허벅지",
      },
      {
        id: 9,
        title: "무릎 통증예방 운동 (오금)",
        description: "수숨슬립에 양발의 오금을 받치고 좌우 이동 운동을 합니다.",
        instructions: [
          "수숨슬립의 둥근면에 양발의 오금을 받치고 천천히 눕습니다",
          "누운 자세에서 전신에 힘을 빼고 천천히 호흡을 들여마시고 내쉽니다",
          "양쪽 오금을 정면에 두고 들숨을 쉬고 천천히 내쉬면서 양쪽 오금을 오른쪽으로 최대한 이동합니다",
          "천천히 들숨으로 양쪽 무릎이 정면으로 오면 날숨을 내쉬면서 왼쪽으로 이동합니다",
          "이 동작을 양쪽 20회씩 반복합니다",
        ],
        warnings: [
          "무릎에 통증이 있다면 중단하세요",
          "좌우 이동 시 무리하지 마세요",
          "호흡과 함께 부드럽게 움직이세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=오금+좌우운동",
        duration: 200,
        repetitions: "양쪽 20회",
        targetArea: "오금, 무릎",
      },
      {
        id: 10,
        title: "종아리 순환 운동",
        description: "수숨슬립에 종아리를 받치고 좌우 이동으로 혈액순환을 개선합니다.",
        instructions: [
          "수숨슬립의 둥근면에 종아리를 받치고 천천히 눕습니다",
          "누운 자세에서 전신에 힘을 빼고 천천히 호흡을 들여마시고 내쉽니다",
          "양쪽 종아리를 정면에 두고 들숨을 쉬고 천천히 내쉬면서 양쪽 종아리를 오른쪽으로 최대한 이동합니다",
          "천천히 들숨으로 양쪽 종아리가 정면으로 오면 날숨을 내쉬면서 왼쪽으로 이동합니다",
          "이 동작을 양쪽 20회씩 반복합니다",
        ],
        warnings: [
          "종아리에 무리가 가지 않도록 하세요",
          "혈액순환을 의식하며 움직이세요",
          "부드럽게 좌우로 이동하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=종아리+순환운동",
        duration: 200,
        repetitions: "양쪽 20회",
        targetArea: "종아리",
      },
      {
        id: 11,
        title: "발목 순환 운동 (아킬레스건)",
        description: "수숨슬립에 발목을 얹고 다리 떨어뜨리기 운동으로 발목을 이완시킵니다.",
        instructions: [
          "누운 자세에서 두 다리를 쭉 펴고 수숨슬립 위에 발목(아킬레스건)을 얹습니다",
          "오른발을 20~30cm 정도 들었다가 힘을 빼고 물건을 떨어뜨리듯이 떨어뜨립니다",
          "이 동작을 오른쪽 다리로 25회 반복합니다",
          "오른쪽 다리로 정해진 횟수만큼 반복한 후 왼쪽 다리로 옮겨서 같은 방법으로 반복합니다",
          "각 다리마다 25회씩 실시합니다",
        ],
        warnings: [
          "발목에 무리가 가지 않도록 하세요",
          "자연스럽게 떨어뜨리는 느낌으로 하세요",
          "아킬레스건 부위의 이완을 의식하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=발목+떨어뜨리기",
        duration: 200,
        repetitions: "각 다리 25회",
        targetArea: "발목, 아킬레스건",
      },
      {
        id: 12,
        title: "모관 운동 (전신 순환)",
        description: "수숨슬립 없이 누워서 손끝 발끝을 털어주는 전신 순환 운동입니다.",
        instructions: [
          "주변에 있는 수숨슬립은 옆으로 치웁니다",
          "누운 자세에서 두 다리를 쭉 펴고 전신에 힘을 빼고 천천히 호흡합니다",
          "팔은 앞으로 나란히 형태로 손을 펴고 뻗습니다",
          "다리도 앞으로 나란히 형태로 발바닥이 천장을 향하게 합니다",
          "그 자세로 손끝 발끝을 사용하여 1분간 털어줍니다",
        ],
        warnings: [
          "어지러움을 느끼면 즉시 중단하세요",
          "팔다리에 무리가 가지 않도록 하세요",
          "전신의 혈액순환을 의식하며 실시하세요",
        ],
        gif: "/placeholder.svg?height=300&width=400&text=모관운동+전신순환",
        duration: 180,
        repetitions: "1분간 지속",
        targetArea: "전신 순환",
      },
    ],
  },
}

export default function PosturePage() {
  const params = useParams()
  const postureId = params.id as string
  const [currentStep, setCurrentStep] = useState(0)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResult, setDetectionResult] = useState<"success" | "warning" | null>(null)

  const posture = postureData[postureId as keyof typeof postureData]

  if (!posture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">자세를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청하신 자세 프로그램이 존재하지 않습니다.</p>
            <Link href="/postures">
              <Button>자세 목록으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepData = posture.steps[currentStep]
  const progress = ((currentStep + 1) / posture.steps.length) * 100
  const totalTimeSpent = posture.steps.slice(0, currentStep).reduce((sum, step) => sum + step.duration, 0)
  const remainingTime = posture.steps.slice(currentStep).reduce((sum, step) => sum + step.duration, 0)

  const handleNextStep = () => {
    if (currentStep < posture.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setDetectionResult(null)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setDetectionResult(null)
    }
  }

  const handleStartDetection = () => {
    setIsDetecting(true)
    // 테스트용 자동 성공 처리 제거 - 실제 MediaPipe 사용
  }

  const handleDetectionComplete = (result: "success" | "warning") => {
    setDetectionResult(result)
    setIsDetecting(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}분 ${remainingSeconds}초`
  }

  // 12단계 완료 시 완료 페이지로 이동
  const isCompleted = currentStep === posture.steps.length - 1 && detectionResult === "success"
  const isLastStep = currentStep === posture.steps.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/postures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{posture.name}</h1>
            <p className="text-sm text-gray-600">
              {currentStep + 1}/{posture.steps.length}단계
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>진행: {Math.round(progress)}%</span>
            <span>남은 시간: {formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Step Info Card */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>현재 단계: {formatTime(currentStepData.duration)}</span>
              </div>
              <div className="text-right">
                <div className="text-gray-600">{currentStepData.repetitions}</div>
                <div className="text-xs text-blue-600">{currentStepData.targetArea}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <Badge variant="outline">{formatTime(currentStepData.duration)}</Badge>
            </div>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video/Image */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {currentStepData.gif?.endsWith(".mp4") ? (
                <video
                  src={currentStepData.gif}
                  controls
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg?height=300&width=400&text=목+유연운동+경추"
                >
                  <source src={currentStepData.gif} type="video/mp4" />
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              ) : (
                <img
                  src={currentStepData.gif || "/placeholder.svg"}
                  alt={currentStepData.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Target Area & Repetitions */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-blue-900">대상 부위</span>
                <p className="text-blue-700">{currentStepData.targetArea}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-900">반복 횟수</span>
                <p className="text-blue-700">{currentStepData.repetitions}</p>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Play className="w-4 h-4 mr-2 text-green-600" />
                수행 방법
              </h3>
              <ul className="space-y-2">
                {currentStepData.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                주의사항
              </h3>
              <ul className="space-y-1">
                {currentStepData.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-700 flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Posture Detection */}
        {isDetecting && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                자세 측정 중...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PostureDetection
                onDetectionComplete={handleDetectionComplete}
                targetPose="sleep-posture"
                stepId={currentStepData.id}
              />
            </CardContent>
          </Card>
        )}

        {/* Detection Result */}
        {detectionResult && (
          <Card
            className={`mb-6 ${detectionResult === "success" ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {detectionResult === "success" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                )}
                <div>
                  <p className={`font-medium ${detectionResult === "success" ? "text-green-900" : "text-orange-900"}`}>
                    {detectionResult === "success" ? "훌륭합니다!" : "자세를 다시 확인해보세요"}
                  </p>
                  <p className={`text-sm ${detectionResult === "success" ? "text-green-700" : "text-orange-700"}`}>
                    {detectionResult === "success"
                      ? "올바른 자세입니다. 다음 단계로 진행하세요."
                      : "자세를 조금 더 정확하게 맞춰보세요."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isDetecting && !detectionResult && (
            <Button onClick={handleStartDetection} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              자세 측정하기
            </Button>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>

            {currentStep < posture.steps.length - 1 ? (
              <Button
                onClick={handleNextStep}
                disabled={!detectionResult || detectionResult !== "success"}
                className="flex-1"
              >
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : // 12단계 완료 시 - 자세 측정 성공했으면 완료 페이지로, 아니면 비활성화
            detectionResult === "success" ? (
              <Link href="/complete" className="flex-1">
                <Button className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  완료하기
                </Button>
              </Link>
            ) : (
              <Button className="flex-1 bg-transparent" disabled={true} variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                {detectionResult === null ? "자세 측정 필요" : "완료"}
              </Button>
            )}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">전체 단계</h3>
          <div className="grid grid-cols-4 gap-2">
            {posture.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`p-2 text-xs rounded-lg border transition-colors ${
                  index === currentStep
                    ? "bg-blue-500 text-white border-blue-500"
                    : index < currentStep
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {index + 1}단계
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
