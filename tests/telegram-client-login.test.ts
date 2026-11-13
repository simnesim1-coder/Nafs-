// @vitest-environment happy-dom
import {it,expect,vi,afterEach} from 'vitest';
import {authenticateTelegram,isGuestLaunch,rememberGuestLaunch} from '../lib/telegram/login';
import type {TelegramWebApp} from '../lib/telegram/client';
const launch=(initData:string)=>({initData} as TelegramWebApp);
afterEach(()=>{vi.unstubAllGlobals();sessionStorage.clear()});
it('shares concurrent login requests and permits a retry after a temporary failure',async()=>{
 let finish!:(response:Response)=>void;
 const request=vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve}));vi.stubGlobal('fetch',request);
 const first=authenticateTelegram(launch('signed-test-launch'));const second=authenticateTelegram(launch('signed-test-launch'));
 expect(second).toBe(first);expect(request).toHaveBeenCalledOnce();
 finish(new Response(JSON.stringify({code:'DATABASE_UNREACHABLE',diagnosticId:'test',error:'Unavailable'}),{status:503}));
 await expect(first).rejects.toThrow('DATABASE_UNREACHABLE');
 const retry=authenticateTelegram(launch('signed-test-launch'));expect(request).toHaveBeenCalledTimes(2);
 finish(new Response(JSON.stringify({ok:true})));await retry;
});
it('does not let a previous logout suppress a new Telegram launch or another account',async()=>{
 const a=launch('signed-account-A-launch-one'),b=launch('signed-account-B-launch-two');
 await rememberGuestLaunch(a);expect(sessionStorage.getItem('nafs-telegram-guest')).toMatch(/^[a-f0-9]{64}$/);
 expect(await isGuestLaunch(a)).toBe(true);expect(await isGuestLaunch(b)).toBe(false);
 expect(sessionStorage.getItem('nafs-telegram-guest')).toBeNull();
 sessionStorage.setItem('nafs-telegram-guest','1');expect(await isGuestLaunch(a)).toBe(false);
});
