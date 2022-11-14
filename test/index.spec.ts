import assert from 'assert';
import { translate } from '../src/translate';

type Assert = typeof assert.strict;
type TranslateFn = typeof translate;

declare global {
  const assert: Assert;
  const translate: TranslateFn;
}

Object.assign(global, {
  assert: assert.strict,
  translate,
});

it('translate', async () => {
  const { text, raw } = await translate('Привет, мир! Как дела?', { to: 'en' });
  assert.equal(text, 'Hello World! How are you?');
  assert.equal(raw.src, 'ru');
  assert.equal(raw.sentences.length, 3);
  assert.deepEqual(raw.sentences.slice(-1), [
    { src_translit: 'Privet, mir! Kak dela?' }
  ]);
});

it('invalid host', async () => {
  const promise = translate('Привет, мир! Как дела?', { host: 'foo' });
  await assert.rejects(promise, /FetchError/);
});
