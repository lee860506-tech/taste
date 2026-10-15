import Image from 'next/image';
import type {Category} from '@/types/restaurant';

const filenames: Record<Category, string> = {
  한식: '한식',
  중식: '중식',
  일식: '일식',
  양식: '양식',
  카페: '커피',
  디저트: '디저트',
  분식: '분식',
  기타: '기타',
};

export default function CategoryIcon({category, size = 64}: {category: Category; size?: number}) {
  return <Image src={`/assets/categories/${filenames[category]}.png`} alt="" width={size} height={size} className="category-symbol" />;
}
