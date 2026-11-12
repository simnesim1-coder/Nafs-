import content from '@/content/motivation.json';
import legacyFavorites from '@/content/motivation-legacy-favorites.json';
import type {Action, State} from './domain';

export type MotivationContext = 'today' | 'before' | 'completed' | 'sos' | 'setback' | 'marathon';
export type MotivationTopic = 'stress' | 'procrastination' | 'impulse' | 'motivation';
export type MotivationLanguage = 'ru' | 'en' | 'tr' | 'ar';
export type MotivationMessage = {
  id: string;
  category: string;
  contexts: MotivationContext[];
  faith: boolean;
  text: Record<MotivationLanguage, string>;
};
export type MotivationState = {
  favorites: string[];
  recent: string[];
  daily: {id: string; day: string; faith: boolean; sequence: number} | null;
};
export const motivationMessages = content as MotivationMessage[];
const byId = new Map(motivationMessages.map(message => [message.id, message]));
export const motivationById = (id: string) => byId.get(id);
const retiredById = new Map((legacyFavorites as MotivationMessage[]).map(message => [message.id, message]));
/** Retired original prose is available only when a user explicitly opens their bookmarks. */
export const favoriteById = (id: string) => byId.get(id) || retiredById.get(id);
export const emptyMotivation = (): MotivationState => ({favorites: [], recent: [], daily: null});
// Islamic content follows the chosen mode; the old separate opt-in flag is deprecated.
export const allowsFaithMotivation = (state: State) => state.preferences.islamic;

function hash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

/** Stable content selection, independent of language or any private goal names. */
export function chooseMotivation(context: MotivationContext, seed: string, recent: string[], faith = false, topic?: MotivationTopic): MotivationMessage {
  const categories = faith
    ? topic === 'stress' ? ['patience','remembrance'] : topic === 'impulse' ? ['patience','character'] : topic === 'procrastination' ? ['time','prayer'] : topic ? ['sincerity','gratitude'] : null
    : topic === 'stress' ? ['resilience','recovery'] : topic === 'impulse' ? ['impulses','resilience'] : topic ? ['procrastination','resilience'] : null;
  const eligible = motivationMessages.filter(message => message.faith === faith && message.contexts.includes(context));
  const narrowed = eligible.filter(message => !categories || categories.includes(message.category));
  const pool = narrowed.length ? narrowed : eligible;
  // Retain at least one eligible candidate even when a small contextual pool is exhausted.
  const applicable = [...new Set([...recent].reverse())].reverse().filter(id => pool.some(message => message.id === id));
  const excluded = new Set(applicable.slice(-Math.min(24, pool.length - 1)));
  const available = pool.filter(message => !excluded.has(message.id));
  return available[hash(seed) % available.length];
}

/** A continuous 400-local-date cycle per mode, including leap days. 137 and 400 are coprime. */
export function calendarMotivation(day: string, faith = false): MotivationMessage {
  const ordinal = Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000);
  if (!Number.isFinite(ordinal)) throw new Error('Invalid local date');
  const index = ((ordinal * 137) % 400 + 400) % 400;
  return motivationMessages[faith ? 400 + index : index];
}

export function dailyMotivation(previous: MotivationState, day: string, faith: boolean, refresh = false): MotivationState {
  const current = previous.daily;
  const sameDay = current?.day === day;
  const base = calendarMotivation(day,faith);
  const currentMessage = current ? motivationById(current.id) : undefined;
  if (!refresh && sameDay && current?.faith === faith && currentMessage?.contexts.includes('today') &&
      (current.sequence > 0 || current.id === base.id)) return previous;
  const sequence = sameDay && refresh ? (current.sequence + 1) % 1000000 : 0;
  // Manual browsing cannot move the calendar. Reserve the upcoming 24 daily choices
  // so a refresh does not immediately repeat on the next local day.
  const upcoming = Array.from({length: 24}, (_, index) => {
    const next = new Date(Date.parse(day + 'T00:00:00Z') + (index + 1) * 86400000);
    return calendarMotivation(next.toISOString().slice(0, 10),faith).id;
  });
  const excluded = new Set([...previous.recent, ...upcoming, ...(currentMessage ? [currentMessage.id] : [])]);
  const pool = motivationMessages.filter(message => message.faith === faith && !excluded.has(message.id));
  const message = refresh && sameDay ? pool[hash(`${day}:${sequence}`) % pool.length] : base;
  return {
    ...previous,
    daily: {id: message.id, day, faith, sequence},
    recent: [...previous.recent.filter(id => id !== message.id), message.id].slice(-24),
  };
}

/** Recognition is emitted only for a persisted, explicitly requested change. */
export function completionContext(before: State, after: State, action: Action, day: string): 'completed' | 'marathon' | null {
  if (action.type === 'task' && !before.tasks.find(task => task.id === action.task.id)?.completed && after.tasks.find(task => task.id === action.task.id)?.completed) return 'completed';
  if (action.type === 'habit' && (after.habits.find(h => h.id === action.habit.id)?.checks[day] || 0) > (before.habits.find(h => h.id === action.habit.id)?.checks[day] || 0)) return 'completed';
  if (action.type === 'focusComplete' && !before.focusSessions.some(f => f.id === action.id) && after.focusSessions.some(f => f.id === action.id)) return 'completed';
  if (action.type === 'progress') {
    const previous = before.enrollments.find(e => e.id === action.id), next = after.enrollments.find(e => e.id === action.id);
    if (next?.days.includes(action.day) && !previous?.days.includes(action.day)) return next.days.length === 21 ? 'marathon' : 'completed';
  }
  return null;
}
