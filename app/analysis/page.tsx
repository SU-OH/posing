"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  Brain,
  Zap,
  Moon,
  Target,
  TrendingUp,
  Calendar,
  Share2,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"

interface AnalysisData {
  stepId: number
  title: string
  issues: string[]
  painLevel: number // 0-10
  comfort: number // 0-10
  notes: string
}

interface HealthInsight {
  type: "warning" | "info" | "success"
  category: string
  title: string
  description: string
  recommendations: string[]
  icon: React.ReactNode
}

export default function AnalysisPage() {
  const [analysisData] = useState<AnalysisData[]>([
    {
      stepId: 1,
      title: "목 유연운동 (경추 1~7번)",
      issues: ["뒷통수가 바닥에 닿지 않음", "목 돌리기 시 뻣뻣함"],
      painLevel: 6,
      comfort: 4,
      notes: "목을 돌릴 때 약간의 저항감이 있었음",
    },
    {
      stepId: 4,
      title: "가슴열기운동 (흉추 4,5번)",
      issues: ["어깨가 많이 굽어있음"],
      painLevel: 3,
      comfort: 7,
      notes: "가슴이 열리는 느낌이 좋았음",
    },
    {
      stepId: 6,
      title: "허리만곡(S) 운동 (요추 4,5번)",
      issues: ["허리가 바닥에서 많이 떨어짐"],
      painLevel: 7,
      comfort: 3,
      notes: "허리 부분에 상당한 긴장감이 있었음",
    },
    {
      stepId: 7,
      title: "골반 교정운동 (천골)",
      issues: ["꼬리뼈 부분 통증"],
      painLevel: 8,
      comfort: 2,
      notes: "스트레스로 인한 긴장이 심한 것 같음",
    },
  ])

  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 분석 데이터를 바탕으로 건강 인사이트 생성
    const insights = generateHealthInsights(analysisData)
    setHealthInsights(insights)

    // 전체 점수 계산
    const avgComfort = analysisData.reduce((sum, data) => sum + data.comfort, 0) / analysisData.length
    const avgPain = analysisData.reduce((sum, data) => sum + data.painLevel, 0) / analysisData.length
    const score = Math.round(((avgComfort + (10 - avgPain)) / 2) * 10)
    setOverallScore(score)

    setTimeout(() => setIsLoading(false), 1500)
  }, [analysisData])

  const generateHealthInsights = (data: AnalysisData[]): HealthInsight[] => {
    const insights: HealthInsight[] = []

    // 목 관련 분석
    const neckIssues = data.find((d) => d.stepId === 1)
    if (neckIssues && neckIssues.issues.includes("뒷통수가 바닥에 닿지 않음")) {
      insights.push({
        type: "warning",
        category: "목 건강",
        title: "거북목 증후군 의심",
        description:
          "뒷통수가 바닥에 닿지 않는 것은 목이 앞으로 나온 거북목 자세를 의미합니다. 장시간 컴퓨터 작업이나 스마트폰 사용이 주요 원인입니다.",
        recommendations: [
          "하루 30분씩 목 스트레칭 실시",
          "컴퓨터 모니터를 눈높이에 맞추기",
          "1시간마다 목과 어깨 운동하기",
          "수면 시 적절한 높이의 베개 사용",
        ],
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      })
    }

    // 어깨 관련 분석
    const shoulderIssues = data.find((d) => d.stepId === 4)
    if (shoulderIssues && shoulderIssues.issues.includes("어깨가 많이 굽어있음")) {
      insights.push({
        type: "info",
        category: "자세 교정",
        title: "라운드 숄더 (굽은 어깨)",
        description: "어깨가 앞으로 말린 자세로, 가슴 근육의 긴장과 등 근육의 약화가 원인입니다.",
        recommendations: [
          "가슴 근육 스트레칭 강화",
          "등 근육 강화 운동 실시",
          "벽 푸시업으로 자세 교정",
          "어깨 뒤로 돌리기 운동",
        ],
        icon: <Info className="w-5 h-5 text-blue-500" />,
      })
    }

    // 허리 관련 분석
    const backIssues = data.find((d) => d.stepId === 6)
    if (backIssues && backIssues.painLevel > 6) {
      insights.push({
        type: "warning",
        category: "척추 건강",
        title: "요추 전만증 또는 긴장",
        description: "허리가 바닥에서 많이 떨어지고 통증이 있는 것은 요추의 과도한 곡선이나 근육 긴장을 의미합니다.",
        recommendations: [
          "코어 근육 강화 운동",
          "햄스트링 스트레칭",
          "골반 기울이기 운동",
          "장시간 앉기 피하고 자주 일어나기",
        ],
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      })
    }

    // 스트레스 관련 분석
    const stressIssues = data.find((d) => d.stepId === 7)
    if (stressIssues && stressIssues.painLevel > 7) {
      insights.push({
        type: "warning",
        category: "스트레스 관리",
        title: "높은 스트레스 수준",
        description: "꼬리뼈 부분의 심한 통증은 스트레스로 인한 전신 긴장과 관련이 있을 수 있습니다.",
        recommendations: [
          "규칙적인 명상이나 요가 실시",
          "충분한 수면 시간 확보",
          "스트레스 해소 활동 찾기",
          "전문가 상담 고려",
        ],
        icon: <Brain className="w-5 h-5 text-purple-500" />,
      })
    }

    // 긍정적인 피드백도 추가
    const goodComfort = data.filter((d) => d.comfort >= 7)
    if (goodComfort.length > 0) {
      insights.push({
        type: "success",
        category: "긍정적 변화",
        title: "좋은 반응을 보인 부위들",
        description: `${goodComfort.map((d) => d.title.split("(")[0]).join(", ")} 부위에서 좋은 반응을 보였습니다.`,
        recommendations: [
          "현재 상태를 유지하기 위한 꾸준한 관리",
          "좋은 반응을 보인 운동 지속하기",
          "점진적으로 운동 강도 증가",
        ],
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      })
    }

    return insights
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "우수"
    if (score >= 60) return "보통"
    return "주의 필요"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">자세 분석 중...</h2>
            <p className="text-gray-600">12단계 운동 결과를 종합 분석하고 있습니다</p>
            <div className="mt-4">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">AI가 당신의 자세를 분석하고 있어요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/postures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">자세 분석 결과</h1>
            <p className="text-sm text-gray-600">AI 기반 건강 분석</p>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2">{overallScore}점</div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {getScoreLabel(overallScore)}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold mb-2">종합 자세 건강도</h2>
            <p className="text-blue-100 text-sm">12단계 수숨슬립 운동을 통한 종합 분석 결과입니다</p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">{analysisData.filter((d) => d.painLevel <= 3).length}</div>
              <div className="text-xs text-gray-600">편안한 부위</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">{analysisData.filter((d) => d.painLevel > 6).length}</div>
              <div className="text-xs text-gray-600">주의 부위</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">{healthInsights.length}</div>
              <div className="text-xs text-gray-600">개선 제안</div>
            </CardContent>
          </Card>
        </div>

        {/* Health Insights */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            AI 건강 분석
          </h2>

          {healthInsights.map((insight, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                insight.type === "warning"
                  ? "border-l-red-500 bg-red-50"
                  : insight.type === "info"
                    ? "border-l-blue-500 bg-blue-50"
                    : "border-l-green-500 bg-green-50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {insight.category}
                  </Badge>
                  {insight.icon}
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{insight.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">💡 개선 방법</h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              단계별 상세 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisData.map((data, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{data.title}</h4>
                  <div className="flex space-x-2">
                    <Badge
                      variant={data.painLevel <= 3 ? "default" : data.painLevel <= 6 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      통증 {data.painLevel}/10
                    </Badge>
                  </div>
                </div>

                {data.issues.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">발견된 문제:</p>
                    <ul className="space-y-1">
                      {data.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="text-xs text-orange-700 flex items-start">
                          <span className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.notes && <p className="text-xs text-gray-600 italic">"{data.notes}"</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Zap className="w-5 h-5 mr-2" />
              맞춤 운동 계획
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">주 3회 수숨슬립 운동</p>
                  <p className="text-sm text-green-600">특히 1, 6, 7단계 집중 관리</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Moon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">수면 자세 개선</p>
                  <p className="text-sm text-blue-600">적절한 베개 높이와 매트리스 점검</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-purple-800">스트레스 관리</p>
                  <p className="text-sm text-purple-600">명상, 요가 등 이완 활동 추가</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/postures">
            <Button className="w-full" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              다시 운동하기
            </Button>
          </Link>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Calendar className="w-4 h-4 mr-2" />
              일정 설정
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              결과 공유
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>💡 이 분석은 AI 기반 예측이며, 심각한 증상이 있다면 전문의와 상담하세요</p>
        </div>
      </div>
    </div>
  )
}
