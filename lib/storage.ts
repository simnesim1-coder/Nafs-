import {STORAGE_KEY,type State} from './domain';
export function exportWorkspace(state:State){return JSON.stringify(state,null,2)}
export function clearLocalWorkspace(storage:Pick<Storage,'removeItem'>,session?:Pick<Storage,'length'|'key'|'removeItem'>){storage.removeItem(STORAGE_KEY);storage.removeItem(STORAGE_KEY+'-before-free-v2');if(session){const keys=Array.from({length:session.length},(_,i)=>session.key(i)).filter((key):key is string=>Boolean(key?.startsWith('nafs-reminders:')));for(const key of keys)session.removeItem(key)}}
