import 'server-only';
import {admin,requireUser} from './server';
/** Never accept the owner Telegram ID from the request or an unverified browser value. */
export const OWNER_TELEGRAM_ID = '6123609704';
export async function isTelegramOwner(userId: string, provider: string) {
  if (provider !== 'telegram') return false;
  const {data,error} = await admin().from('telegram_identities').select('telegram_id').eq('user_id',userId).maybeSingle();
  if (error) throw Error('Owner verification unavailable.');
  return String(data?.telegram_id ?? '') === OWNER_TELEGRAM_ID;
}
export async function requireOwner() {
  const identity = await requireUser();
  if (!await isTelegramOwner(identity.user.id, identity.provider)) throw Error('Administrator access required.');
  return identity;
}
