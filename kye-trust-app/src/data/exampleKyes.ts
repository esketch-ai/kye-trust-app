export const exampleKyes: KyeData[] = [
  {
    id: 'example-kye-1',
    name: '여행 자금 모으기',
    goalAmount: 5000000,
    currentAmount: 2500000,
    progress: 50,
    themeImage: 'https://picsum.photos/300/180?random=1',
    aiSafetyScore: 85,
    description: '친구들과 함께 떠나는 유럽 여행을 위한 곗돈입니다. 매월 50만원씩 10개월간 모아요.',
  },
  {
    id: 'example-kye-2',
    name: '내 집 마련 곗돈',
    goalAmount: 100000000,
    currentAmount: 75000000,
    progress: 75,
    themeImage: 'https://picsum.photos/300/180?random=2',
    aiSafetyScore: 60,
    description: '내 집 마련의 꿈을 위한 곗돈입니다. 매월 1000만원씩 10개월간 모아요.',
  },
  {
    id: 'example-kye-3',
    name: '자동차 구매 곗돈',
    goalAmount: 30000000,
    currentAmount: 15000000,
    progress: 50,
    themeImage: 'https://picsum.photos/300/180?random=3',
    aiSafetyScore: 90,
    description: '새로운 자동차 구매를 위한 곗돈입니다. 매월 300만원씩 10개월간 모아요.',
  },
  {
    id: 'example-kye-4',
    name: '교육비 마련 곗돈',
    goalAmount: 20000000,
    currentAmount: 5000000,
    progress: 25,
    themeImage: 'https://picsum.photos/300/180?random=4',
    aiSafetyScore: 70,
    description: '자녀 교육비 마련을 위한 곗돈입니다. 매월 200만원씩 10개월간 모아요.',
  },
];

// KyeData 인터페이스 정의 (KyeCard.tsx와 동일하게 유지)
export interface KyeData {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  progress: number; // 0-100
  themeImage: string;
  aiSafetyScore: number; // 0-100
  description: string;
}
