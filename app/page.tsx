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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjAgMEwyMCA0ME0wIDIwTDQwIDIwIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMC4yIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
      </div>
      {/* Hero Section */}
      <div className="relative z-10">
        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full blur-xl opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400 to-blue-300 rounded-full blur-xl opacity-35 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-blue-500/25 ring-2 ring-white/20 backdrop-blur-sm">
                <Moon className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <Badge variant="secondary" className="bg-white/10 text-cyan-100 border-white/20 backdrop-blur-sm px-4 py-1">
                수면 케어 전문
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
              올바른 자세로
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                깊은 잠
              </span>
              을 찾아보세요
            </h1>

            <p className="text-lg text-blue-100/90 mb-8 leading-relaxed drop-shadow-sm">
              목침을 활용한 전문적인 자세교정으로
              <br />
              수면의 질을 향상시키고 건강한 하루를 시작하세요
            </p>

            {/* CTA Button */}
            <Link href="/postures">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-white shadow-2xl shadow-blue-500/25 hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-105 ring-2 ring-white/20 backdrop-blur-sm border-0"
                aria-label="자세교정 프로그램 시작하기 - 수숨슬립 운동법 페이지로 이동"
              >
                자세교정 시작하기
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            </Link>

            <p className="text-sm text-blue-200/80 mt-3 drop-shadow-sm">✨ 무료로 시작하고 즉시 효과를 경험하세요</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 px-4 py-12 bg-white/5 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8 drop-shadow-lg">왜 자세교정이 중요할까요?</h2>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 ring-1 ring-white/20 hover:ring-white/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm ring-1 ring-white/30">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1 drop-shadow-sm">{benefit.title}</h3>
                      <p className="text-sm text-blue-100/80 drop-shadow-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-12 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8 drop-shadow-lg">스마트한 자세교정 시스템</h2>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-400/20 rounded-full flex items-center justify-center backdrop-blur-sm ring-1 ring-emerald-400/30">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                </div>
                <span className="text-blue-100/90 drop-shadow-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Illustration Placeholder */}
          <div className="mt-8 aspect-video bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-2 ring-white/30">
                <Moon className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <p className="text-sm text-blue-100/80 drop-shadow-sm">AI 자세 분석 시스템</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-4 py-12 bg-white/5 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8 drop-shadow-lg">검증된 효과</h2>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-cyan-300 mb-1 drop-shadow-sm">{stat.number}</div>
                  <div className="text-xs text-blue-100/70 drop-shadow-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="relative z-10 px-4 py-12 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/30">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-300 fill-current drop-shadow-sm" />
                ))}
              </div>
              <p className="text-blue-50/90 mb-4 italic drop-shadow-sm">
                "목침을 활용한 자세교정 후 수면의 질이 정말 좋아졌어요. 아침에 일어날 때 목과 어깨가 한결 편해졌습니다!"
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm ring-1 ring-white/30">
                  <Users className="w-4 h-4 text-cyan-200" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white drop-shadow-sm">김○○님</div>
                  <div className="text-blue-200/70 drop-shadow-sm">직장인, 30대</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10 px-4 py-16 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl ring-2 ring-white/30 backdrop-blur-sm">
            <Award className="w-8 h-8 text-white drop-shadow-lg" aria-hidden="true" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">지금 시작하세요</h2>

          <p className="text-blue-100/90 mb-8 drop-shadow-sm">
            건강한 수면과 올바른 자세,
            <br />두 마리 토끼를 모두 잡으세요
          </p>

          <Link href="/postures">
            <Button
              size="lg"
              className="w-full bg-white/95 text-blue-700 hover:bg-white hover:text-blue-800 shadow-2xl hover:shadow-cyan-400/20 transition-all duration-300 transform hover:scale-105 ring-2 ring-white/20 backdrop-blur-sm"
              aria-label="무료 체험하기 - 자세교정 운동 프로그램 시작"
            >
              무료로 체험하기
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
          </Link>

          <p className="text-sm text-blue-200/80 mt-4 drop-shadow-sm">📱 모바일 최적화 • 🎯 개인 맞춤형 • 🔒 안전한 사용</p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 py-8 bg-black/20 backdrop-blur-sm">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-blue-200/60 drop-shadow-sm">© 2024 자세교정 앱. 건강한 수면을 위한 첫걸음</p>
        </div>
      </div>
    </div>
  )
}
