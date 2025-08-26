"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Star,
  Trophy,
  Calendar,
  Share2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Heart,
  Target,
} from "lucide-react"
import Link from "next/link"

export default function CompletePage() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // 3초 후 축하 애니메이션 숨기기
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 축하 헤더 */}
        <div className="text-center mb-8 relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="animate-bounce absolute top-0 left-1/4 text-2xl">🎉</div>
              <div className="animate-bounce absolute top-2 right-1/4 text-2xl" style={{ animationDelay: "0.2s" }}>
                ✨
              </div>
              <div className="animate-bounce absolute top-4 left-1/2 text-2xl" style={{ animationDelay: "0.4s" }}>
                🎊
              </div>
            </div>
          )}

          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">축하합니다! 🎉</h1>
          <p className="text-gray-600">12단계 수숨슬립 자세교정을 완료하셨습니다</p>
        </div>

        {/* 완료 통계 */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm opacity-90">완료 단계</div>
              </div>
              <div>
                <div className="text-2xl font-bold">40분</div>
                <div className="text-sm opacity-90">총 소요시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-90">달성률</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 성취 배지들 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              획득한 성취
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">첫 완주자</p>
                <p className="text-sm text-gray-600">12단계를 모두 완료했습니다</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">자세 마스터</p>
                <p className="text-sm text-gray-600">올바른 자세를 익혔습니다</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">건강 지킴이</p>
                <p className="text-sm text-gray-600">건강한 수면을 위한 첫걸음</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 다음 단계 추천 */}
        <Card className="mb-6 border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">다음 단계 추천</h3>
            <p className="text-sm text-blue-700 mb-4">더 나은 효과를 위해 매일 꾸준히 실천해보세요!</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              일주일 연속 도전하기
            </Badge>
          </CardContent>
        </Card>

        {/* 피드백 메시지 */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>훌륭합니다!</strong> 오늘 하루 동안 목과 어깨, 척추 전체를 이완시켜주셨네요. 규칙적인
                  자세교정으로 더 건강한 수면을 경험하실 수 있을 거예요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="space-y-3 mb-6">
          <Link href="/analysis">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              상세 분석 결과 보기
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/postures">
              <Button variant="outline" className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 하기
              </Button>
            </Link>

            <Button variant="outline" className="w-full bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>

          <Button variant="ghost" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            내일 알림 설정
          </Button>
        </div>

        {/* 격려 메시지 */}
        <div className="text-center space-y-2 mb-8">
          <p className="text-sm text-gray-600">🌟 매일 조금씩, 꾸준히 하는 것이 가장 중요해요</p>
          <p className="text-xs text-gray-500">건강한 자세로 더 나은 내일을 만들어가세요</p>
        </div>

        {/* 홈으로 돌아가기 */}
        <Link href="/">
          <Button variant="outline" className="w-full bg-transparent">
            홈으로 돌아가기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
