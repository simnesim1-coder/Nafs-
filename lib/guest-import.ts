import {favoriteById} from './motivation';
import type {State,Action} from './domain';
/** Stable IDs make definition import repeatable without overwriting existing account records. */
export async function guestDefinitionActions(guest:State,account:State):Promise<Action[]>{
 const actions:Action[]=[];
 async function id(kind:string,source:string){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(kind+':'+source));return 'guest-'+kind+'-'+Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')}
 for(const task of guest.tasks){const key=await id('task',task.id);if(!account.tasks.some(t=>t.id===key)&&!actions.some(a=>a.type==='task'&&a.task.id===key))actions.push({type:'task',task:{...task,id:key,seriesId:undefined,completed:false,subtasks:task.subtasks?.map(s=>({...s,completed:false}))}})}
 for(const habit of guest.habits){const key=await id('habit',habit.id);if(!account.habits.some(h=>h.id===key)&&!actions.some(a=>a.type==='habit'&&a.habit.id===key))actions.push({type:'habit',habit:{...habit,id:key,checks:{}}})}
 for(const id of guest.motivation.favorites)if(favoriteById(id)&&!account.motivation.favorites.includes(id))actions.push({type:'motivationFavorite',id,saved:true});
 return actions;
}
