import type { KakaoMaps } from '@/types/kakao';
let pending: Promise<KakaoMaps> | undefined;
export function loadKakaoMaps(): Promise<KakaoMaps> {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY?.trim();
  if (!key) return Promise.reject(new Error('missing-key'));
  if (pending) return pending;
  pending = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => fail(), 15000);
    let finished = false;
    function fail() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('sdk-load-failed'));
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key!)}&autoload=false`;
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      try {
        if (!window.kakao?.maps) return fail();
        window.kakao.maps.load(() => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timer);
          resolve(window.kakao!.maps);
        });
      } catch { fail(); }
    };
    document.head.appendChild(script);
  });
  pending.catch(() => { pending = undefined; });
  return pending;
}

