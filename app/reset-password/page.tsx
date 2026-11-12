'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {loadGuest} from '@/lib/domain';
import {translate} from '@/lib/i18n';
export default function Reset(){const [message,setMessage]=useState(''),[locale,setLocale]=useState('en');useEffect(()=>{setLocale(loadGuest(localStorage).preferences.language)},[]);const t=(key:string)=>translate(locale,key);return <main><section className="card"><h1>{t('Set a new password')}</h1><form onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'password',password:f.get('password')})});const d=await r.json();setMessage(r.ok?t('Password updated. You can return to NAFS.'):d.error)}}><label>{t('New password')}<input name="password" type="password" minLength={10} required/></label><button className="btn primary">{t('Save password')}</button></form><p role="status">{message}</p><Link href="/">{t('Return to NAFS')}</Link></section></main>}
