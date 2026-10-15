import proj4 from 'proj4';
import { inKorea } from './geo';
// EPSG:5174, traditional GIS input order easting/northing, as returned by CRD_INFO_X/Y.
// EPSG operation 5191 uses Molodensky-Badekas in coordinate-frame convention.
// Equivalent position-vector Helmert: T'=T+P-(1+s)R*P, rotation signs reversed.
// P=(-3159521.31,4068151.32,3748113.85); validated against PROJ's EPSG pipeline.
export const EPSG5174='+proj=tmerc +lat_0=38 +lon_0=127.002890277778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +towgs84=-114.61998513899744,475.96296987030655,675.0183286857791,1.162,-2.347,-1.592,6.342 +units=m +no_defs';
export function convert5174(x:unknown,y:unknown) {
  if(x===null||y===null||String(x??'').trim()===''||String(y??'').trim()==='')return undefined;
  const e=Number(x),n=Number(y);if(!Number.isFinite(e)||!Number.isFinite(n)||e===0||n===0)return undefined;
  try {const [longitude,latitude]=proj4(EPSG5174,'EPSG:4326',[e,n]);const p={latitude,longitude};if(!inKorea(p))return undefined;
    const back=proj4('EPSG:4326',EPSG5174,[longitude,latitude]);if(Math.hypot(back[0]-e,back[1]-n)>1)return undefined;return p;
  }catch{return undefined;}
}

