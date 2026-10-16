'use client';
import {useEffect} from 'react';

export default function PwaRegistration(){useEffect(()=>{if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='127.0.0.1'||location.hostname==='localhost'))navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});},[]);return null}
