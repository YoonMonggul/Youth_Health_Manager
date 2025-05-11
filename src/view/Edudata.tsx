"use client"

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 더미 교육자료 데이터
const eduList = [
  {
    title: "[질병예방교육] 봄철 알레르기 예방",
    content:
      "봄의 미세먼지와 황사, 꽃가루로 불안한 봄철! 기침을 심해지지만, 동시에 꽃가루 알레르기(폴린증)는 불편함의 시작을 알리기도 합니다. 봄철 알레르기와 같은 불편함을 최소화하면서 봄을 즐길 수 있도록 봄철 알레르기의 원인, 증상, 그리고 이를 효과적으로 예방하고 관리하는 방법을 알아보았습니다.",
  },
  {
    title: "[질병예방교육] 봄철 알레르기 예방",
    content:
      "봄의 미세먼지와 황사, 꽃가루로 불안한 봄철! 기침을 심해지지만, 동시에 꽃가루 알레르기(폴린증)는 불편함의 시작을 알리기도 합니다. 봄철 알레르기와 같은 불편함을 최소화하면서 봄을 즐길 수 있도록 봄철 알레르기의 원인, 증상, 그리고 이를 효과적으로 예방하고 관리하는 방법을 알아보았습니다.",
  },
  {
    title: "[질병예방교육] 봄철 알레르기 예방",
    content:
      "봄의 미세먼지와 황사, 꽃가루로 불안한 봄철! 기침을 심해지지만, 동시에 꽃가루 알레르기(폴린증)는 불편함의 시작을 알리기도 합니다. 봄철 알레르기와 같은 불편함을 최소화하면서 봄을 즐길 수 있도록 봄철 알레르기의 원인, 증상, 그리고 이를 효과적으로 예방하고 관리하는 방법을 알아보았습니다.",
  },
];

export default function Edudata() {
  return (
    <div className="p-8 w-full">
      {/* 상단 탭 및 전체 버튼 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span>보건소식</span>
          <span className="text-gray-300">|</span>
          <span className="text-black">교육자료</span>
        </div>
        <button className="ml-2 px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100">전체</button>
      </div>

      {/* 교육자료 리스트 */}
      <div className="flex flex-col gap-4">
        {eduList.map((item, idx) => (
          <div key={idx} className="bg-white border-b border-gray-200 pb-4">
            <div className="font-bold text-base mb-1">{item.title}</div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {item.content}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded border border-gray-300 bg-white text-blue-600 font-bold">1</button>
          <button className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-500">2</button>
          <button className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-500">3</button>
          <button className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-500">4</button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
          <button className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-500">32</button>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 