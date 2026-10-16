import type {MetadataRoute} from 'next';

export default function manifest():MetadataRoute.Manifest{return {name:'준혁이랑 냠냠지도',short_name:'냠냠지도',description:'준혁이와 함께 찾는 동네 음식점',start_url:'/',scope:'/',display:'standalone',background_color:'#fff8f0',theme_color:'#a88bff',icons:[{src:'/assets/map-marker.svg',sizes:'any',type:'image/svg+xml'}]}}
