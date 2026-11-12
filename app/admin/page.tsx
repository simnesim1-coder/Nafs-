import Link from 'next/link';
import {requireBroadcastAdmin} from '@/lib/broadcast-server';
import {BroadcastConsole} from './console';
export const dynamic='force-dynamic';
export default async function AdminPage(){
 try{await requireBroadcastAdmin()}catch{return <main style={{maxWidth:640,margin:'auto',padding:24}}><h1>Рассылки NAFS</h1><p>Нужен вход в разрешённый аккаунт администратора. В гостевом предпросмотре рассылки недоступны.</p><Link href="/">Вернуться в NAFS</Link></main>}
 return <BroadcastConsole/>;
}
