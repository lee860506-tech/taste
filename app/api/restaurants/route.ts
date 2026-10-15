import {DataError,searchPublicData,type SearchInput} from '@/lib/public-data/client';
export async function POST(request:Request){
 try{const input=await request.json() as SearchInput;const result=await searchPublicData(input);return Response.json(result,{headers:{'Cache-Control':'no-store'}});}
 catch(error){if(error instanceof DataError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});return Response.json({error:'조회 조건 또는 서버 설정을 확인해 주세요.'},{status:400,headers:{'Cache-Control':'no-store'}});}
}
