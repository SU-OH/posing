"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save } from "lucide-react"
import Link from "next/link"

interface PostureStep {
  id: number
  title: string
  description: string
  instructions: string[]
  warnings: string[]
  duration: number
}

interface Posture {
  id: string
  name: string
  description: string
  difficulty: string
  duration: string
  steps: PostureStep[]
}

export default function AdminPage() {
  const [postures, setPostures] = useState<Posture[]>([
    {
      id: "manse",
      name: "만세 자세",
      description: "어깨와 팔의 올바른 정렬을 위한 기본 자세",
      difficulty: "초급",
      duration: "5분",
      steps: [
        {
          id: 1,
          title: "준비 자세",
          description: "편안하게 서서 어깨의 힘을 빼고 자연스럽게 팔을 내려놓습니다.",
          instructions: ["발을 어깨너비로 벌리고 서세요", "어깨의 힘을 완전히 빼세요"],
          warnings: ["무릎을 과도하게 굽히지 마세요"],
          duration: 30,
        },
      ],
    },
  ])

  const [selectedPosture, setSelectedPosture] = useState<Posture | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Posture>>({})

  const handleEditPosture = (posture: Posture) => {
    setSelectedPosture(posture)
    setEditForm(posture)
    setIsEditing(true)
  }

  const handleSavePosture = () => {
    if (editForm.id) {
      setPostures((prev) => prev.map((p) => (p.id === editForm.id ? ({ ...p, ...editForm } as Posture) : p)))
    }
    setIsEditing(false)
    setSelectedPosture(null)
    setEditForm({})
  }

  const handleAddStep = () => {
    if (editForm.steps) {
      const newStep: PostureStep = {
        id: editForm.steps.length + 1,
        title: "새 단계",
        description: "단계 설명을 입력하세요",
        instructions: ["지시사항을 입력하세요"],
        warnings: ["주의사항을 입력하세요"],
        duration: 30,
      }
      setEditForm({
        ...editForm,
        steps: [...editForm.steps, newStep],
      })
    }
  }

  const handleUpdateStep = (stepIndex: number, field: keyof PostureStep, value: any) => {
    if (editForm.steps) {
      const updatedSteps = [...editForm.steps]
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value }
      setEditForm({ ...editForm, steps: updatedSteps })
    }
  }

  const handleDeleteStep = (stepIndex: number) => {
    if (editForm.steps) {
      const updatedSteps = editForm.steps.filter((_, index) => index !== stepIndex)
      setEditForm({ ...editForm, steps: updatedSteps })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-gray-600">자세 프로그램 관리</p>
            </div>
          </div>
        </div>

        {!isEditing ? (
          /* Posture List */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">등록된 자세</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />새 자세 추가
              </Button>
            </div>

            {postures.map((posture) => (
              <Card key={posture.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{posture.name}</span>
                        <Badge variant="outline">{posture.difficulty}</Badge>
                      </CardTitle>
                      <CardDescription>{posture.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPosture(posture)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>소요시간: {posture.duration}</span>
                    <span>단계: {posture.steps.length}개</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Edit Form */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">자세 편집</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button onClick={handleSavePosture}>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">자세 이름</label>
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">설명</label>
                  <Textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">난이도</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editForm.difficulty || ""}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    >
                      <option value="초급">초급</option>
                      <option value="중급">중급</option>
                      <option value="고급">고급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">소요시간</label>
                    <Input
                      value={editForm.duration || ""}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>단계 관리</CardTitle>
                  <Button onClick={handleAddStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    단계 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editForm.steps?.map((step, index) => (
                  <Card key={step.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">단계 {index + 1}</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStep(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">제목</label>
                        <Input value={step.title} onChange={(e) => handleUpdateStep(index, "title", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">설명</label>
                        <Textarea
                          value={step.description}
                          onChange={(e) => handleUpdateStep(index, "description", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">지시사항 (줄바꿈으로 구분)</label>
                        <Textarea
                          value={step.instructions.join("\n")}
                          onChange={(e) => handleUpdateStep(index, "instructions", e.target.value.split("\n"))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">주의사항 (줄바꿈으로 구분)</label>
                        <Textarea
                          value={step.warnings.join("\n")}
                          onChange={(e) => handleUpdateStep(index, "warnings", e.target.value.split("\n"))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">지속시간 (초)</label>
                        <Input
                          type="number"
                          value={step.duration}
                          onChange={(e) => handleUpdateStep(index, "duration", Number.parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
