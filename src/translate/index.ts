import fetch,{ RequestInit } from 'node-fetch';

export interface TranslateOptions {
  from?: string;
  to?: string;
  host?: string;
  fetchOptions?: Partial<RequestInit>;
}

export interface TranslateResult {
  text: string;
  raw: RawResponse;
}

export interface RawResponse {
  sentences: (Sentence | SrcTranslit)[];
  src: string;
  confidence: number;
  ld_result: {
    srclangs: string[];
    srclangs_confidences: number[];
    extended_srclangs: string[];
  }
}

export interface Sentence {
  trans: string;
  orig: string;
}

export interface SrcTranslit {
  src_translit: string;
}

function createHttpError(status: any,statusText: any){
  console.error(status);
  console.error(statusText);
  
}
const defaults: Required<Pick<TranslateOptions, 'from' | 'to' | 'host'>> = {
  from: 'auto',
  to: 'en',
  host: 'translate.google.hk',
};

export async function translate(inputText: string, options?: TranslateOptions) {
  return new Translator(inputText, options).translate();
}

export class Translator {
  protected options: typeof defaults & TranslateOptions;

  constructor(protected inputText: string, options?: TranslateOptions) {
    this.options = Object.assign({}, defaults, options);
  }

  async translate() {
    const url = this.buildUrl();
    const fetchOptions = this.buildFetchOptions();
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw createHttpError(res.status, res.statusText);
    const raw = await res.json() as RawResponse;
    const text = this.buildResText(raw);
    return { text, raw };
  }

  protected buildUrl() {
    const { host } = this.options;
    return [
      `https://${host}/translate_a/single`,
      '?client=at',
      '&dt=t',  // return sentences
      '&dt=rm', // add translit to sentences
      '&dj=1',  // result as pretty json instead of deep nested arrays
    ].join('');
  }

  protected buildBody() {
    const { from, to } = this.options;
    const params = {
      sl: from,
      tl: to,
      q: this.inputText,
    };
    return new URLSearchParams(params).toString();
  }

  protected buildFetchOptions() {
    const { fetchOptions } = this.options;
    const res = Object.assign({}, fetchOptions);
    res.method = 'POST';
    res.headers = Object.assign({}, res.headers, {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    });
    res.body = this.buildBody();
    return res;
  }

  protected buildResText({ sentences }: RawResponse) {
    return sentences
      .filter((s): s is Sentence => 'trans' in s)
      .map(s => s.trans)
      .join('');
  }
}
