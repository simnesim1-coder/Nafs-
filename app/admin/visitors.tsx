'use client';
import {useEffect,useState} from 'react';
type Visitor={telegram_id:number|string;display_name:string;username:string|null;language_code:string|null;created_at:string;last_seen_at:string|null;login_count:number};
type Report={total:number;active24h:number;users:Visitor[];showing:string};
export function VisitorPanel(){
 const [report,setReport]=useState<Report|null>(null),[error,setError]=useState('');
 async function refresh(){const res=await fetch('/api/admin/visitors',{cache:'no-store'});const payload=await res.json();if(!res.ok)throw Error(payload.error||'Ошибка загрузки');setReport(payload)}
 useEffect(()=>{void refresh().catch(e=>setError(e.message))},[]);
 const style={border:'1px solid var(--line, #776e62)',borderRadius:16,padding:16} as const;
 const timestamp=(raw:string|null)=>raw?new Date(raw).toLocaleString('ru-RU'):'Нет данных';
 return <section style={{margin:'22px 0 30px'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><h2>Посетители NAFS</h2><button className="btn" onClick={()=>void refresh().catch(e=>setError(e.message))}>Обновить</button></div>
 <p style={{margin:'10px 0'}}>Только пользователи, вошедшие через подтверждённый Telegram Mini App. Гости браузера сюда не входят. Активность — успешное открытие приложения с проверкой Telegram, а не время онлайн.</p>
 {error&&<p role="alert">{error}</p>}
 {report&&<><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12,margin:'18px 0'}}><div style={style}><strong style={{fontSize:28}}>{report.total}</strong><p>Всего аккаунтов</p></div><div style={style}><strong style={{fontSize:28}}>{report.active24h}</strong><p>Заходили за 24 часа</p></div></div>
 <h3>Последние регистрации</h3><p style={{fontSize:12}}>{report.showing}</p>
 <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr><th align="left">Пользователь</th><th align="left">Первый вход</th><th align="left">Последний вход</th><th align="right">Входов</th></tr></thead><tbody>{report.users.map(u=><tr key={String(u.telegram_id)} style={{borderTop:'1px solid var(--line,#66584e)'}}><td style={{padding:'12px 8px'}}><strong>{u.display_name}</strong><div>{u.username?'@'+u.username:''}</div><small>ID: {u.telegram_id}</small></td><td>{timestamp(u.created_at)}</td><td>{timestamp(u.last_seen_at)}</td><td align="right">{u.login_count}</td></tr>)}</tbody></table></div></>}
 </section>
}
