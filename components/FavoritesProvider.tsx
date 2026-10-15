'use client';
import { createContext,useContext,useEffect,useState,ReactNode } from 'react';
import { readFavorites,writeFavorites } from '@/lib/favorites';
const Context=createContext<{ids:string[];toggle:(id:string)=>void;ready:boolean}>({ids:[],toggle:()=>{},ready:false});
export function FavoritesProvider({children}:{children:ReactNode}) { const [ids,setIds]=useState<string[]>([]);const [ready,setReady]=useState(false);const [error,setError]=useState('');useEffect(()=>{const sync=()=>setIds(readFavorites());sync();setReady(true);window.addEventListener('storage',sync);window.addEventListener('favorites-change',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('favorites-change',sync)}},[]);function toggle(id:string){try{const current=readFavorites();writeFavorites(current.includes(id)?current.filter(x=>x!==id):[...current,id]);setError('')}catch{setError('브라우저 저장 공간을 사용할 수 없어요. 저장 설정을 확인해 주세요.')}}return <Context.Provider value={{ids,toggle,ready}}>{children}{error&&<p className="toast" role="alert">{error}</p>}</Context.Provider> }
export const useFavorites=()=>useContext(Context);
