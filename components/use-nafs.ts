'use client';
import {authenticateTelegram,isGuestLaunch} from '@/lib/telegram/login';
import {initializeTelegram,telegramApp} from '@/lib/telegram/client';
import {completionContext,type MotivationContext} from '@/lib/motivation';
import {ZodError} from 'zod';
import {actionSchema} from '@/lib/validation';
import {useEffect,useRef,useState} from 'react';
import {initialState,loadGuest,reduce,STORAGE_KEY,type State,type Action,migrateState,today} from '@/lib/domain';
export function useNafs(){
 const [authBlocked,setAuthBlocked]=useState(false);
 const [state,setState]=useState<State>(initialState),[ready,setReady]=useState(false),[user,setUser]=useState<string|null>(null),[accountId,setAccountId]=useState<string|null>(null),[isOwner,setIsOwner]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[storageError,setStorageError]=useState(false);
 const [completion,setCompletion]=useState<{context:MotivationContext;id:number}|null>(null);const completionId=useRef(0);
 useEffect(()=>{if(!completion)return;const timer=setTimeout(()=>setCompletion(null),18000);return()=>clearTimeout(timer)},[completion]);
 const current=useRef(state),saving=useRef(false),account=useRef<string|null>(null),accountOwner=useRef<string|null>(null);const commit=(s:State)=>{current.current=s;setState(s)};
 useEffect(()=>{let disposed=false;try{const raw=localStorage.getItem(STORAGE_KEY);if(raw&&!localStorage.getItem(STORAGE_KEY+'-before-free-v2'))localStorage.setItem(STORAGE_KEY+'-before-free-v2',raw);const local=loadGuest(localStorage);commit(local)}catch(e){setStorageError(true);setError((e as Error).message);setReady(true)}
 (async()=>{const app=await initializeTelegram();
 if(!app&&/(?:^|[&#?])tgWebAppData=/.test(location.hash))throw Error('Telegram SDK unavailable. Reopen the Mini App.');
 if(app){if(await isGuestLaunch(app))return {user:null};await authenticateTelegram(app)}
 const response=await fetch('/api/data',{credentials:'same-origin',signal:AbortSignal.timeout(30000),cache:'no-store'});const payload=await response.json();
 if(app&&(!response.ok||!payload.userId||payload.provider!=='telegram'))throw Error(JSON.stringify({code:payload.code||'SESSION_UNAVAILABLE',diagnosticId:payload.diagnosticId||'',message:payload.error||'Telegram session unavailable. Reopen the Mini App.'}));
 return payload;
 })().then(d=>{if(disposed)return;if(d.user&&d.userId){accountOwner.current=d.userId;setAccountId(d.userId);account.current=d.user;setUser(d.user);setIsOwner(d.isOwner === true);commit(migrateState(d.state));setStorageError(false)}else if(d.error&&!d.error.includes('Sign in'))setError(d.error)}).catch(e=>{if(disposed)return;if(telegramApp()||/(?:^|[&#?])tgWebAppData=/.test(location.hash))setAuthBlocked(true);setError(e instanceof Error?e.message:'Telegram sign-in unavailable.')}).finally(()=>{if(!disposed)setReady(true)});
 const sync=(event:StorageEvent)=>{if(event.key===STORAGE_KEY&&!account.current&&event.newValue){try{commit(migrateState(JSON.parse(event.newValue)))}catch{setError('Another tab saved unreadable data. Your current data is unchanged.')}}};window.addEventListener('storage',sync);return()=>{disposed=true;window.removeEventListener('storage',sync)}},[]);
 useEffect(()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{})},[]);
 useEffect(()=>{const root=document.documentElement;root.lang=state.preferences.language;root.dir=state.preferences.language==='ar'?'rtl':'ltr';root.dataset.mode=state.preferences.islamic?'islamic':'regular';root.dataset.appearance=state.preferences.dark?'dark':'light';const app=telegramApp();root.classList.toggle('dark',app&&state.preferences.followTelegramTheme!==false?app.colorScheme==='dark':state.preferences.dark)},[state.preferences]);
 async function dispatch(action:Action){if(saving.current||storageError||authBlocked||!ready)return false;saving.current=true;setBusy(true);try{action=actionSchema.parse(action);const before=current.current;if(account.current){const r=await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json','x-nafs-workspace':accountOwner.current||'','x-nafs-timezone':Intl.DateTimeFormat().resolvedOptions().timeZone},body:JSON.stringify(action)});const d=await r.json();if(!r.ok)throw Error(d.error);commit(migrateState(d.state))}else{const next=migrateState(reduce(current.current,action));localStorage.setItem(STORAGE_KEY,JSON.stringify(next));commit(next)}const context=completionContext(before,current.current,action,today());if(context)setCompletion({context,id:++completionId.current});return true}catch(e){setError(e instanceof ZodError?'Please check the fields and try again.':(e as Error).message);return false}finally{saving.current=false;setBusy(false)}}
 return {authBlocked,isOwner,completion,dismissCompletion:()=>setCompletion(null),state,ready,user,accountId,busy,error,setError,storageError,dispatch};
}
