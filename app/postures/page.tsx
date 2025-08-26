"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Settings, User } from "lucide-react"
import Link from "next/link"

const postureTypes = [
  {
    id: "sleep-posture",
    name: "수숨슬립 자세",
    description: "수숨슬립을 활용한 전신 이완 및 수면의 질 향상 프로그램",
    difficulty: "초급",
    duration: "40분",
    steps: 12,
    image: "/placeholder.svg?height=200&width=300&text=수숨슬립+자세+프로그램",
  },
  {
    id: "neck-stretch",
    name: "목 스트레칭",
    description: "목과 어깨 긴장 완화를 위한 자세",
    difficulty: "초급",
    duration: "3분",
    steps: 4,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shoulder-roll",
    name: "어깨 돌리기",
    description: "어깨 근육 이완과 혈액순환 개선",
    difficulty: "중급",
    duration: "7분",
    steps: 5,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function PosturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              관리자
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">자세교정 프로그램</h1>
          <p className="text-gray-600 text-sm">수숨슬립으로 건강한 자세 만들기</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">안녕하세요!</p>
                <p className="text-sm text-gray-600">오늘도 건강한 자세로 시작해보세요</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posture Types */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">자세 선택하기</h2>

          {postureTypes.map((posture) => (
            <Card key={posture.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={posture.image || "/placeholder.svg"}
                  alt={posture.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={posture.difficulty === "초급" ? "default" : "secondary"}>{posture.difficulty}</Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{posture.name}</CardTitle>
                <CardDescription className="text-sm">{posture.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>⏱️ {posture.duration}</span>
                    <span>📋 {posture.steps}단계</span>
                  </div>
                </div>

                <Link href={`/posture/${posture.id}`}>
                  <Button className="w-full">
                    시작하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>매일 꾸준한 자세교정으로 건강을 지켜보세요</p>
        </div>
      </div>
    </div>
  )
}
