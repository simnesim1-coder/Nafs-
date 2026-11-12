'use client';
import {useMemo, useState} from 'react';
import {ArrowRight, CheckCircle2, Leaf, ShieldCheck, Sparkles} from 'lucide-react';
import {Button} from '../ui/button';
import {Toggle} from '../primitives';
import type {Preferences,Action} from '@/lib/domain';

type Locale = Preferences['language'];

const copy: Record<Locale, {
  modeQuestion: string;
  modeHint: string;
  regularTitle: string;
  regularDesc: string;
  islamicTitle: string;
  islamicDesc: string;
  visualTitle: string;
  visualDesc: string;
  privacyTitle: string;
  privacyDesc: string;
  privacyPoints: [string, string, string];
  summaryRegular: [string, string, string];
  summaryIslamic: [string, string, string];
}> = {
  ru: {
    modeQuestion: 'Какой режим тебе ближе?',
    modeHint: 'Можно переключить позже. Исламский режим нужен для особой атмосферы и более осмысленного духовного фокуса.',
    regularTitle: 'Обычный режим',
    regularDesc: 'Дисциплина, маленькие победы, привычки и ясный путь вперёд без религиозных акцентов.',
    islamicTitle: 'Исламский режим',
    islamicDesc: 'Тёплая исламская атмосфера: намерение, внимание к сердцу, муракаба и спокойное возвращение к правильному.',
    visualTitle: 'Сделай пространство своим',
    visualDesc: 'Выбери язык, оформи намерение и настрой тон приложения так, чтобы оно помогало именно тебе.',
    privacyTitle: 'Твоё пространство остаётся личным',
    privacyDesc: 'NAFS не пытается давить. Здесь всё строится вокруг мягкого, честного возвращения к цели.',
    privacyPoints: [
      'Данные гостя остаются на этом устройстве',
      'Уведомления не показывают личные цели',
      'Все настройки можно изменить позже',
    ],
    summaryRegular: ['Фокус на дне', 'Привычки и задачи', 'Спокойный визуальный ритм'],
    summaryIslamic: ['Намерение и мухасаба', 'Тёплая исламская атмосфера', 'Мягкое напоминание о главном'],
  },
  en: {
    modeQuestion: 'Which mode feels right for you?',
    modeHint: 'You can change it later. Islamic mode adds a dedicated spiritual atmosphere and more reflective guidance.',
    regularTitle: 'Regular mode',
    regularDesc: 'Discipline, small wins, habits, and a clear path forward without religious framing.',
    islamicTitle: 'Islamic mode',
    islamicDesc: 'A warm Islamic atmosphere with intention, heart-awareness, muraqabah, and a calm return to what is right.',
    visualTitle: 'Make the space feel like yours',
    visualDesc: 'Choose your language, set an intention, and shape the app so it supports you in the right tone.',
    privacyTitle: 'Your space stays personal',
    privacyDesc: 'NAFS is built for gentle honesty, not pressure. The goal is a calm return to what matters.',
    privacyPoints: [
      'Guest data stays on this device',
      'Notifications never reveal private goals',
      'Every setting can be changed later',
    ],
    summaryRegular: ['Daily focus', 'Habits and tasks', 'Calm visual rhythm'],
    summaryIslamic: ['Intention and muhasabah', 'Warm Islamic atmosphere', 'Gentle reminders of what matters'],
  },
  tr: {
    modeQuestion: 'Hangi mod sana daha yakın?',
    modeHint: 'Bunu sonra değiştirebilirsin. İslami mod daha özel bir manevi atmosfer ve daha derin bir odak sunar.',
    regularTitle: 'Normal mod',
    regularDesc: 'Dinî vurgu olmadan disiplin, küçük kazanımlar, alışkanlıklar ve net bir ilerleme yolu.',
    islamicTitle: 'İslami mod',
    islamicDesc: 'Niyet, kalp farkındalığı, murakabe ve huzurlu dönüş hissi taşıyan sıcak bir İslami atmosfer.',
    visualTitle: 'Alanı kendine göre ayarla',
    visualDesc: 'Dilini seç, niyetini yaz ve uygulamanın sana gerçekten yardımcı olacak tonunu belirle.',
    privacyTitle: 'Bu alan sana özel kalır',
    privacyDesc: 'NAFS baskı kurmak için değil, yumuşak ve dürüst bir şekilde yeniden toparlanmak için tasarlandı.',
    privacyPoints: [
      'Misafir verileri bu cihazda kalır',
      'Bildirimlerde özel hedeflerin görünmez',
      'Tüm ayarlar daha sonra değiştirilebilir',
    ],
    summaryRegular: ['Günlük odak', 'Alışkanlıklar ve görevler', 'Sakin görsel ritim'],
    summaryIslamic: ['Niyet ve muhasebe', 'Sıcak İslami atmosfer', 'Esas olana yumuşak dönüş'],
  },
  ar: {
    modeQuestion: 'أي وضع يناسبك أكثر؟',
    modeHint: 'يمكنك تغييره لاحقًا. الوضع الإسلامي يضيف أجواءً إيمانية أكثر وعمقًا في التذكير.',
    regularTitle: 'الوضع العادي',
    regularDesc: 'انضباط وعادات وخطوات صغيرة وانطلاقة واضحة دون طابع ديني مباشر.',
    islamicTitle: 'الوضع الإسلامي',
    islamicDesc: 'أجواء إسلامية دافئة مع النية ومراقبة القلب والرجوع الهادئ إلى الصواب.',
    visualTitle: 'اجعل المساحة على طريقتك',
    visualDesc: 'اختر اللغة، واكتب نيتك، واضبط نبرة التطبيق حتى يخدمك بالشكل المناسب.',
    privacyTitle: 'مساحتك تبقى شخصية',
    privacyDesc: 'NAFS صُمم للعودة الهادئة الصادقة لا للضغط أو الإدانة.',
    privacyPoints: [
      'بيانات الضيف تبقى على هذا الجهاز',
      'الإشعارات لا تكشف الأهداف الخاصة',
      'يمكن تعديل كل الإعدادات لاحقًا',
    ],
    summaryRegular: ['تركيز يومي', 'عادات ومهام', 'إيقاع بصري هادئ'],
    summaryIslamic: ['نية ومحاسبة', 'أجواء إسلامية دافئة', 'تذكير لطيف بالأهم'],
  },
};

export function Onboarding({preferences,t,dispatch,close}:{preferences:Preferences;t:(key:string)=>string;dispatch:(a:Action)=>Promise<boolean>;close:()=>void}){
  const [step,setStep]=useState(0);
  const [values,setValues]=useState(preferences);
  const locale = values.language;
  const text = copy[locale] || copy.en;
  const summary = useMemo(() => values.islamic ? text.summaryIslamic : text.summaryRegular, [text, values.islamic]);

  async function finish(){
    if(await dispatch({type:'preferences',preferences:{...values,onboarded:true}})) close();
  }

  return (
    <div className="onboarding-flow">
      <div className="onboarding-steps">{[0,1,2].map(i=><span key={i} className={step===i?'active':''}/> )}</div>

      {step===0 && (
        <>
          <div className={'onboarding-hero-card '+(values.islamic?'is-islamic':'is-regular')}>
            <div className="onboarding-hero-copy">
              <span className="tool-tag">{values.islamic ? t('Islamic mode') : text.regularTitle}</span>
              <h2>{text.modeQuestion}</h2>
              <p>{text.modeHint}</p>
            </div>
          </div>
          <div className="mode-choice-grid">
            <button type="button" className={'mode-choice-card '+(!values.islamic?'active':'')} onClick={()=>setValues({...values,islamic:false})}>
              <span className="mode-choice-icon"><Sparkles size={18}/></span>
              <b>{text.regularTitle}</b>
              <p>{text.regularDesc}</p>
            </button>
            <button type="button" className={'mode-choice-card '+(values.islamic?'active':'')} onClick={()=>setValues({...values,islamic:true})}>
              <span className="mode-choice-icon"><Leaf size={18}/></span>
              <b>{text.islamicTitle}</b>
              <p>{text.islamicDesc}</p>
            </button>
          </div>
        </>
      )}

      {step===1 && (
        <>
          <span className="onboarding-emblem"><Sparkles size={35}/></span>
          <h2>{text.visualTitle}</h2>
          <p>{text.visualDesc}</p>
          <label>{t('Language')}
            <select value={values.language} onChange={e=>setValues({...values,language:e.target.value as Preferences['language']})}>
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="tr">Türkçe</option>
              <option value="ar">العربية</option>
            </select>
          </label>
          <Toggle label={t('Dark mode')} checked={values.dark} onChange={value=>setValues({...values,dark:value})}/>
          <label>{t('What do you want to improve?')}<input maxLength={200} value={values.goal} onChange={e=>setValues({...values,goal:e.target.value})}/></label>
          <label>{t('Habits to build')}<input maxLength={200} value={values.build} onChange={e=>setValues({...values,build:e.target.value})}/></label>
        </>
      )}

      {step===2 && (
        <>
          <span className="onboarding-emblem"><ShieldCheck size={35}/></span>
          <h2>{text.privacyTitle}</h2>
          <p>{text.privacyDesc}</p>
          <div className="onboarding-bullets">
            {text.privacyPoints.map(point=><div key={point} className="onboarding-bullet"><CheckCircle2 size={16}/><span>{point}</span></div>)}
          </div>
          <div className="onboarding-summary-card">
            <span className="tool-tag">{values.islamic ? t('Islamic mode') : text.regularTitle}</span>
            <h3>{values.islamic ? text.islamicTitle : text.regularTitle}</h3>
            <div className="onboarding-summary-list">
              {summary.map(item=><span key={item}>{item}</span>)}
            </div>
          </div>
        </>
      )}

      <div className="onboarding-actions">
        <button className="text-link" onClick={finish}>{t('Skip for now')}</button>
        <Button onClick={()=>step<2?setStep(step+1):finish()}>{t(step===2?'Begin my journey':'Continue')}<ArrowRight size={16}/></Button>
      </div>
    </div>
  )
}
