// @vitest-environment happy-dom
import React,{act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {NafsApp} from '../components/nafs-app';
import {initialState,STORAGE_KEY,today} from '../lib/domain';
import {motivationById} from '../lib/motivation';
let root:Root,container:HTMLDivElement;
const click=async(element:Element|null)=>{expect(element).toBeTruthy();await act(async()=>{(element as HTMLElement).click()})};
const byText=(text:string)=>[...container.querySelectorAll('button')].find(button=>button.textContent?.trim()===text)||null;
const data=()=>JSON.parse(localStorage.getItem(STORAGE_KEY)!);
const current=()=>container.querySelector('.today-hub .motivation-card')?.getAttribute('data-message-id');
async function mount(){root=createRoot(container);await act(async()=>{root.render(<NafsApp/>)})}
beforeEach(async()=>{
 (globalThis as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
 localStorage.clear();localStorage.setItem(STORAGE_KEY,JSON.stringify({...initialState,preferences:{...initialState.preferences,language:'en'}}));vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({user:null,configured:false}),{headers:{'Content-Type':'application/json'}})));
 window.scrollTo=vi.fn();container=document.createElement('div');document.body.append(container);await mount();
});
afterEach(async()=>{vi.useRealTimers();await act(async()=>root.unmount());container.remove();vi.unstubAllGlobals()});
it('refreshes without repeats, saves a favorite and keeps the same daily text across reload',async()=>{
 const first=current();expect(first).toBeTruthy();expect(data().motivation.daily.day).toBe(today());
 await click(container.querySelector('.today-hub [aria-label="Save message"]'));
 expect(data().motivation.favorites).toEqual([first]);expect(container.querySelector('.today-hub [aria-pressed=true]')).toBeTruthy();
 const recent=new Set([first]);
 for(let i=0;i<8;i++){await click(container.querySelector('.today-hub [aria-label="Another message"]'));expect(recent.has(current())).toBe(false);recent.add(current())}
 const last=current();await act(async()=>root.unmount());await mount();
 expect(current()).toBe(last);expect(data().motivation.favorites).toEqual([first]);expect(data().xp).toEqual({});
});
it('provides a dedicated favorites screen and removal without adding a navigation tab',async()=>{
 const first=current();await click(container.querySelector('.today-hub [aria-label="Save message"]'));
 await click(container.querySelector('[aria-label="Profile and settings"]'));await click(byText('Saved motivation'));
 const favorite=container.querySelector(`[role=dialog] [data-message-id="${first}"]`);expect(favorite?.textContent).toContain(motivationById(first!)!.text.en);
 await click(favorite!.querySelector('[aria-label="Remove from favorites"]'));
 expect(data().motivation.favorites).toEqual([]);expect(container.querySelector('.motivation-empty')).toBeTruthy();
 const before=container.querySelector('.motivation-library .motivation-card')?.getAttribute('data-message-id');
 await click(container.querySelector('.motivation-library [aria-label="Another message"]'));
 expect(container.querySelector('.motivation-library .motivation-card')?.getAttribute('data-message-id')).not.toBe(before);
 expect(container.querySelectorAll('.bottom-nav>button')).toHaveLength(5);
});
it('changes language without mixing message translations and retains favorites in Arabic light theme',async()=>{
 const first=current();await click(container.querySelector('.today-hub [aria-label="Save message"]'));await click(container.querySelector('[aria-label="Profile and settings"]'));
 await click(container.querySelector('[role=switch][aria-label="Dark mode"]'));
 const language=container.querySelector<HTMLSelectElement>('.language-setting select')!;
 for(const locale of ['ru','tr','ar'] as const){await act(async()=>{language.value=locale;language.dispatchEvent(new Event('change',{bubbles:true}))});expect(container.querySelector('.today-hub .motivation-copy')?.textContent).toBe(motivationById(first!)!.text[locale])}
 expect(document.documentElement.dir).toBe('rtl');expect(document.documentElement.classList.contains('dark')).toBe(false);expect(data().motivation.favorites).toEqual([first]);expect(container.textContent).not.toContain('motivation.');
});
it('rotates while the page is open when the local day changes, not every render',async()=>{
 await act(async()=>root.unmount());vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-06T23:59:59'));localStorage.clear();localStorage.setItem(STORAGE_KEY,JSON.stringify({...initialState,preferences:{...initialState.preferences,language:'en'}}));await mount();
 const first=current();expect(data().motivation.daily.day).toBe('2026-11-06');
 await act(async()=>{await vi.advanceTimersByTimeAsync(16000)});
 expect(data().motivation.daily.day).toBe('2026-11-07');expect(current()).not.toBe(first);
 const next=current();await act(async()=>{await vi.advanceTimersByTimeAsync(16000)});expect(current()).toBe(next);
});
it('does not persist an SOS topic or viewed message when browsing calm support',async()=>{
 const before=localStorage.getItem(STORAGE_KEY);
 await click(container.querySelector('[aria-label="Five-minute SOS"]'));await click(byText('A setback'));await click(byText('Begin five-minute support'));
 expect(container.querySelector('[role=dialog] .motivation-setback')).toBeTruthy();
 for(let i=0;i<3;i++)await click(container.querySelector('[role=dialog] [aria-label="Another message"]'));
 expect(localStorage.getItem(STORAGE_KEY)).toBe(before);expect(container.querySelector('[role=dialog]')?.textContent).not.toMatch(/Quran|hadith|Qur’an/);
 await click(container.querySelector('[role=dialog] [aria-label="Save message"]'));
 expect(data().motivation.favorites).toHaveLength(1);expect(data().sosReflections).toEqual([]);expect(data()).not.toHaveProperty('issue');
});
it('keeps religious encouragement out of automatic settings while preserving bookmarks',async()=>{
 const first=current();await click(container.querySelector('.today-hub [aria-label="Save message"]'));
 await click(container.querySelector('[aria-label="Profile and settings"]'));
 await click(container.querySelector('[role=switch][aria-label="Islamic mode"]'));
 expect(container.querySelector('[aria-label="Motivation about sincerity and sabr"]')).toBeNull();
 expect(data().motivation.favorites).toEqual([first]);
 expect(data().preferences.sensitiveContent).toBe(false);
});
