import {it,expect} from 'vitest';
import {challenges} from '../lib/challenges';
import en from '../messages/en.json';
import ru from '../messages/ru.json';
import tr from '../messages/tr.json';
import ar from '../messages/ar.json';
import {translate} from '../lib/i18n';
it('has translation entries for every challenge activity in all four languages',()=>{for(const locale of [en,ru,tr,ar] as Record<string,string>[]){for(const c of challenges)for(const key of [c.title,c.description,c.category,c.difficulty,...c.days])expect(locale[key],key).toBeTruthy()}});
it('uses the chosen language with safe fallback for new copy',()=>{expect(translate('ru','Tasks')).toBe('Задачи');expect(translate('tr','Tasks')).toBe('Görevler');expect(translate('ar','Tasks')).toBe('المهام');expect(translate('ar','New admin-authored content')).toBe('New admin-authored content')});
