'use client';
import {useSearchParams} from 'next/navigation';
import Explorer from './Explorer';

export default function ExplorerRoute(){const params=useSearchParams();return <Explorer key={params.toString()}/>}
