export type TelegramWebApp={
 initData:string;version:string;colorScheme:'light'|'dark';platform:string;
 themeParams:{bg_color?:string;secondary_bg_color?:string};viewportStableHeight:number;
 safeAreaInset?:{top:number;bottom:number;left:number;right:number};contentSafeAreaInset?:{top:number;bottom:number;left:number;right:number};
 ready:()=>void;expand:()=>void;close:()=>void;isVersionAtLeast:(version:string)=>boolean;
 onEvent:(name:string,callback:(data?:unknown)=>void)=>void;offEvent:(name:string,callback:(data?:unknown)=>void)=>void;
 BackButton:{show:()=>void;hide:()=>void;onClick:(fn:()=>void)=>void;offClick:(fn:()=>void)=>void};
 HapticFeedback?:{selectionChanged:()=>void};openTelegramLink:(url:string)=>void;openLink:(url:string)=>void;
 addToHomeScreen?:()=>void;checkHomeScreenStatus?:(callback:(status:string)=>void)=>void;
 setHeaderColor?:(color:string)=>void;setBottomBarColor?:(color:string)=>void;
};
declare global{interface Window{Telegram?:{WebApp?:TelegramWebApp}}}
export const telegramApp=()=>typeof window!=='undefined'&&window.Telegram?.WebApp?.initData?window.Telegram.WebApp:null;
let loading:Promise<TelegramWebApp|null>|undefined;
/** The official SDK is loaded only in a Telegram launch; normal/offline browsers need no third party. */
export function initializeTelegram():Promise<TelegramWebApp|null>{
 if(typeof window==='undefined')return Promise.resolve(null);
 const found=telegramApp();if(found){found.ready();found.expand();return Promise.resolve(found)}
 if(!/(?:^|[&#?])tgWebAppData=/.test(window.location.hash))return Promise.resolve(null);
 if(loading)return loading;
 loading=new Promise(resolve=>{const script=document.createElement('script');script.src='https://telegram.org/js/telegram-web-app.js';script.async=true;
 const timer=setTimeout(()=>resolve(null),8000);script.onload=()=>{clearTimeout(timer);const app=telegramApp();if(app){app.ready();app.expand()}resolve(app)};script.onerror=()=>{clearTimeout(timer);resolve(null)};document.head.appendChild(script)});return loading;
}
export function canInstall(app:TelegramWebApp|null){return !!app&&app.isVersionAtLeast('8.0')&&typeof app.addToHomeScreen==='function'&&typeof app.checkHomeScreenStatus==='function'}
export function openDeveloper(){const url='https://t.me/werllap',app=telegramApp();if(app)app.openTelegramLink(url);else window.open(url,'_blank','noopener,noreferrer')}
