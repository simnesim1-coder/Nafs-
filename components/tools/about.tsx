import {Leaf,Heart} from 'lucide-react';
import {DeveloperContact} from './telegram';
export const approvedRussianStory=`Всё началось с меня. С желания стать лучше.

Я искал то, что помогло бы мне побеждать свои слабости, не сдаваться и каждый день делать хотя бы маленький шаг вперёд.

Так родился NAFS.

«Нафс» (نَفْس) — арабское слово, которое означает «душа», «самость» или внутреннее «я».

В каждом из нас идёт своя борьба — с желаниями, слабостями и привычками. И порой самая трудная победа — это победа над самим собой.

Сначала я создавал NAFS для себя. Но потом понял: возможно, где-то есть человек, который ведёт такую же борьбу.

Если однажды NAFS поможет тебе не сдаться, сделать правильный выбор и стать хоть немного лучше — значит, всё это было не зря.

Создано с искренним намерением. От сердца — к сердцу.`;
export function AboutNafs({t}:{t:(key:string)=>string}){
  return <div className="about-story">
    <div className="about-emblem"><Leaf size={37}/></div>
    <div className="about-brand">nafs<span>.</span></div>
    <div className="about-intro-card">
      <span className="tool-tag">{t('About NAFS')}</span>
      <h2>{t('A little better, every day')}</h2>
      <p>{t('A private space for intention, habits, recovery and steady growth — with a warmer atmosphere and room to breathe.')}</p>
    </div>
    <h2>{t('About NAFS')}</h2>
    {t('about.story').split('\n\n').map((paragraph,i)=><p key={i}>{paragraph}</p>)}
    <div className="about-heart"><Heart size={19}/></div>
    <DeveloperContact t={t}/>
    <footer className="attribution">Developed by Werllap</footer>
  </div>
}
