"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Moon, Heart, Zap, CheckCircle, Star, Users, Award } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const benefits = [
    {
      icon: <Moon className="w-6 h-6 text-blue-500" />,
      title: "수면의 질 향상",
      description: "올바른 자세로 깊고 편안한 잠을 경험하세요",
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "목과 어깨 통증 완화",
      description: "일상의 피로와 긴장을 풀어주는 자세교정",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "에너지 충전",
      description: "올바른 자세로 하루 종일 활력을 유지하세요",
    },
  ]

  const features = [
    "AI 기반 실시간 자세 분석",
    "개인 맞춤형 교정 프로그램",
    "단계별 가이드와 피드백",
    "목침 활용 전문 케어",
  ]

  const stats = [
    { number: "95%", label: "사용자 만족도" },
    { number: "30일", label: "평균 개선 기간" },
    { number: "10,000+", label: "누적 사용자" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-purple-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400 rounded-full blur-xl"></div>
        </div>

        <div className="relative px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                수면 케어 전문
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              올바른 자세로
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                깊은 잠
              </span>
              을 찾아보세요
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              목침을 활용한 전문적인 자세교정으로
              <br />
              수면의 질을 향상시키고 건강한 하루를 시작하세요
            </p>

            {/* CTA Button */}
            <Link href="/postures">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                자세교정 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-3">✨ 무료로 시작하고 즉시 효과를 경험하세요</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">왜 자세교정이 중요할까요?</h2>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">스마트한 자세교정 시스템</h2>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Illustration Placeholder */}
          <div className="mt-8 aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Moon className="w-10 h-10 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600">AI 자세 분석 시스템</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">검증된 효과</h2>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stat.number}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="px-4 py-12 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "목침을 활용한 자세교정 후 수면의 질이 정말 좋아졌어요. 아침에 일어날 때 목과 어깨가 한결 편해졌습니다!"
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">김○○님</div>
                  <div className="text-gray-500">직장인, 30대</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="px-4 py-16 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Award className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">지금 시작하세요</h2>

          <p className="text-blue-100 mb-8">
            건강한 수면과 올바른 자세,
            <br />두 마리 토끼를 모두 잡으세요
          </p>

          <Link href="/postures">
            <Button
              size="lg"
              className="w-full bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              무료로 체험하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="text-sm text-blue-200 mt-4">📱 모바일 최적화 • 🎯 개인 맞춤형 • 🔒 안전한 사용</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-gray-500">© 2024 자세교정 앱. 건강한 수면을 위한 첫걸음</p>
        </div>
      </div>
    </div>
  )
}
