import fetch from 'node-fetch';
import { URL } from 'url';

type ImageFormat = 'jpg' | 'png' | 'webp';

export interface RequestOptions {
  format: ImageFormat;
  width: number;
  height: number;
}

export const RANDOM_URL = 'https://source.unsplash.com/random/';

export const unsplashRequest = async (
  options: RequestOptions = { format: 'jpg', width: 1800, height: 1200 }
): Promise<Uint8Array> =>
  fetch(`${RANDOM_URL}${options.width}x${options.height}`, {})
    .then(async (res) => {
      const { format } = options;
      const { url } = res;

      const u = new URL(url);
      u.searchParams.set('fm', format);

      return fetch(u.toString());
    })
    .then((res) => res.buffer());

export default unsplashRequest;
