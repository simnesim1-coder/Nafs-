'use client';
import {useEffect,useState} from 'react';
type Visitor={telegram_id:number|string;display_name:string;username:string|null;created_at:string;first_login_at:string|null;last_seen_at:string|null;login_count:number};
type Report={total:number;active24h:number;active7d:number;active30d:number;new24h:number;new7d:number;new30d:number;successfulLogins:number;matching:number;page:number;pageSize:number;users:Visitor[]};
export function VisitorPanel(){
 const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[search,setSearch]=useState(''),[page,setPage]=useState(1),[revision,setRevision]=useState(0);
 useEffect(()=>{const controller=new AbortController();setBusy(true);setError('');const timer=setTimeout(()=>{
  fetch('/api/admin/visitors?'+new URLSearchParams({search,page:String(page)}),{cache:'no-store',signal:controller.signal}).then(async res=>{const payload=await res.json();if(!res.ok)throw Error((payload.error||'Ошибка загрузки')+(payload.diagnosticId?' · '+payload.diagnosticId:''));return payload}).then(setReport).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setBusy(false)});
 },250);return()=>{clearTimeout(timer);controller.abort()}},[search,page,revision]);
 const timestamp=(raw:string|null)=>raw?new Date(raw).toLocaleString('ru-RU'):'Нет данных';
 return <section className="admin-visitors" aria-busy={busy}>
  <div className="section-header"><div><span className="eyebrow">Обзор сообщества</span><h2>Пользователи NAFS</h2></div><button className="btn" disabled={busy} onClick={()=>setRevision(v=>v+1)}>Обновить</button></div>
  <p>Только подтверждённые Telegram-аккаунты. Личные задачи, дневники и SOS-записи здесь недоступны. Активность показывает последнее обращение к аккаунту, а не время онлайн.</p>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {report&&<div className="admin-stat-grid">{[['Всего аккаунтов',report.total],['Активны за сутки',report.active24h],['Активны за неделю',report.active7d],['Активны за месяц',report.active30d],['Новые за сутки',report.new24h],['Новые за неделю',report.new7d],['Новые за месяц',report.new30d],['Успешные входы',report.successfulLogins]].map(([label,value])=><article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>}
  <label className="admin-search">Поиск пользователя<input type="search" value={search} maxLength={80} placeholder="Имя, username или Telegram ID" onChange={event=>{setSearch(event.target.value);setPage(1)}}/></label>
  <p role="status">{busy?'Загрузка…':report?`Найдено: ${report.matching}`:''}</p>
  {!busy&&!error&&report?.users.length===0&&<div className="empty-state">Пользователи не найдены. Попробуйте другой запрос.</div>}
  {report&&<><div className="admin-user-list">{report.users.map(user=><article key={String(user.telegram_id)}><header><strong>{user.display_name}</strong><span>{user.username?'@'+user.username:'Без username'}</span><small>ID: {user.telegram_id}</small></header><dl><div><dt>Регистрация</dt><dd>{timestamp(user.created_at)}</dd></div><div><dt>Первый подтверждённый вход</dt><dd>{timestamp(user.first_login_at)}</dd></div><div><dt>Последняя активность</dt><dd>{timestamp(user.last_seen_at)}</dd></div><div><dt>Успешные входы</dt><dd>{user.login_count}</dd></div></dl></article>)}</div><div className="admin-pagination"><button disabled={busy||page<=1} onClick={()=>setPage(n=>n-1)}>Назад</button><span>{page} / {Math.max(1,Math.ceil(report.matching/report.pageSize))}</span><button disabled={busy||page*report.pageSize>=report.matching} onClick={()=>setPage(n=>n+1)}>Далее</button></div></>}
 </section>;
}
