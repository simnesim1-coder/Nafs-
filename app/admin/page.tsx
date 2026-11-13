import Link from 'next/link';
import {ApiError} from '@/lib/server-errors';
import {requireOwner} from '@/lib/owner-admin';
import {BroadcastConsole} from './console';
import {VisitorPanel} from './visitors';
export const dynamic='force-dynamic';
export default async function AdminPage(){
 try{await requireOwner()}catch(error){const unavailable=error instanceof ApiError&&error.status>=500;return <main style={{maxWidth:640,margin:'auto',padding:24}}><h1>Админ-панель NAFS</h1>{unavailable?<p role="alert">Проверка доступа временно недоступна. Повторите попытку. Код: {error.code} · {error.diagnosticId}</p>:<p>Доступ возможен только из Telegram Mini App после подтверждённого входа владельца.</p>}<Link href="/">Вернуться в NAFS</Link></main>}
 return <main className="admin-shell"><Link href="/">← NAFS</Link><h1>NAFS · управление</h1><VisitorPanel/><hr style={{opacity:.2,margin:'24px 0'}}/><BroadcastConsole/></main>;
}
