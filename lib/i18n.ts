import en from '@/messages/en.json';
import ru from '@/messages/ru.json';
import tr from '@/messages/tr.json';
import ar from '@/messages/ar.json';
const messages:Record<string,Record<string,string>>={en,ru,tr,ar};
export function translate(locale:string,key:string){return messages[locale]?.[key]||messages.en[key]||key}
