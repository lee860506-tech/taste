import { categories, Restaurant } from '@/types/restaurant';
export const regions = ['햇살마을','달빛마을','별빛마을'];
const names = ['포근한 밥상','구름 만두집','달빛 초밥','작은 파스타집','느린 오후 카페','복숭아 과자점','별별 떡볶이','소풍 식탁','참깨 한상','대나무 볶음집','고양이 우동','올리브 키친','라벤더 커피','달콤한 오븐','동그란 김밥','마을 한입','봄날 비빔밥','연꽃 반점','숲속 돈가스','햇살 피자'];
export const restaurants: Restaurant[] = names.map((name,i)=>({id:`sample-${i+1}`,name,category:categories[i%8],region:regions[i%3],isSample:true,demoPosition:{x:15+(i%5)*17,y:20+Math.floor(i/5)*19}}));
