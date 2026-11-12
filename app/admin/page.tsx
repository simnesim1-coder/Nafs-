import Link from 'next/link';
import {requireOwner} from '@/lib/owner-admin';
import {BroadcastConsole} from './console';
import {VisitorPanel} from './visitors';
export const dynamic='force-dynamic';
export default async function AdminPage(){
 try{await requireOwner()}catch{return <main style={{maxWidth:640,margin:'auto',padding:24}}><h1>Админ-панель NAFS</h1><p>Доступ возможен только из Telegram Mini App после подтверждённого входа владельца.</p><Link href="/">Вернуться в NAFS</Link></main>}
 return <main style={{maxWidth:820,margin:'auto',padding:20}}><Link href="/">← NAFS</Link><h1>NAFS · управление</h1><VisitorPanel/><hr style={{opacity:.2,margin:'24px 0'}}/><BroadcastConsole/></main>;
}
