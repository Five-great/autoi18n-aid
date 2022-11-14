import { translate } from './translate';

(async () => {
const { text, raw } = await translate('Привет, мир! Как дела?', { to: 'en' });
 console.log(text);
 console.log(raw);
 
})()