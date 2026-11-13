'use client';
import {useEffect,useState} from 'react';
import {Download,Send,ArrowUpRight} from 'lucide-react';
import {initializeTelegram,telegramApp,canInstall,openDeveloper} from '@/lib/telegram/client';
import {Button} from '../ui/button';
export function useTelegram(back:()=>void,canGoBack:boolean,dark:boolean,followTheme:boolean){
 const [active,setActive]=useState(false);
 useEffect(()=>{let disposed=false;let clean=()=>{};initializeTelegram().then(app=>{if(!app||disposed)return;setActive(true);
 const update=()=>{const root=document.documentElement;root.classList.add('telegram-app');for(const [key,value]of Object.entries({top:app.safeAreaInset?.top||0,bottom:app.safeAreaInset?.bottom||0,left:app.safeAreaInset?.left||0,right:app.safeAreaInset?.right||0,'content-top':app.contentSafeAreaInset?.top||0,'content-bottom':app.contentSafeAreaInset?.bottom||0}))root.style.setProperty('--tg-'+key,value+'px');if(app.viewportStableHeight>0)root.style.setProperty('--tg-height',app.viewportStableHeight+'px');root.classList.toggle('dark',followTheme?app.colorScheme==='dark':dark);try{app.setHeaderColor?.(followTheme?(app.themeParams.bg_color||'#101916'):dark?'#101916':'#f5f5ef');if(app.isVersionAtLeast('7.10'))app.setBottomBarColor?.(followTheme?(app.themeParams.secondary_bg_color||'#192520'):dark?'#192520':'#ffffff')}catch{}};
 update();const events=['themeChanged','viewportChanged','safeAreaChanged','contentSafeAreaChanged'];events.forEach(e=>app.onEvent(e,update));clean=()=>events.forEach(e=>app.offEvent(e,update));});return()=>{disposed=true;clean()}},[dark,followTheme]);
 useEffect(()=>{const app=telegramApp();if(!app)return;if(canGoBack)app.BackButton.show();else app.BackButton.hide();app.BackButton.onClick(back);return()=>app.BackButton.offClick(back)},[active,back,canGoBack]);return active;
}
export function DeveloperContact({t}:{t:(key:string)=>string}){return <button className="developer-contact" onClick={openDeveloper}><span><Send size={23}/></span><div><b>{t('Contact the developer')}</b><small>{t('Ideas, suggestions, bugs or collaboration.')}</small><strong>@werllap</strong></div><ArrowUpRight size={18}/></button>}
export function TelegramInstall({t}:{t:(key:string)=>string}){
 const [status,setStatus]=useState(''),[supported,setSupported]=useState(false);
 useEffect(()=>{const app=telegramApp();setSupported(canInstall(app));if(!canInstall(app))return;let live=true;app!.checkHomeScreenStatus?.(value=>{if(live){setStatus(value);if(value==='unsupported')setSupported(false)}});const added=()=>setStatus('added');app!.onEvent('homeScreenAdded',added);return()=>{live=false;app!.offEvent('homeScreenAdded',added)}},[]);
 return <div className="installation-card"><Button variant="outline" onClick={()=>{const app=telegramApp();if(supported&&canInstall(app)){app!.addToHomeScreen!();setStatus('requested')}else setStatus('fallback')}}><Download size={17}/>{t('Add NAFS to your home screen')}</Button><p className="form-note">{t(status==='added'?'Telegram confirmed the home-screen shortcut.':status==='requested'?'Complete the Telegram prompt. Installation is not confirmed yet.':supported?'Use Telegram to add a shortcut to your device.':'If available, use Telegram’s menu to add a shortcut. In Safari use Share → Add to Home Screen; in Chrome use Install app. Options vary by device.')}</p></div>
}
