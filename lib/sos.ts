export const sosIssues=['Strong sexual urge','Urge to watch pornography','Urge to procrastinate','Urge to scroll social media','Stress','General impulsive behavior','Low motivation','A setback'] as const;
export const sosStages=['Pause','Breathing','Grounding','Alternative action','Reflection'] as const;
export const supportScripts=[
 'You do not have to obey every impulse. You can choose what happens next.',
 'A difficult moment does not erase all the progress you have made.',
 'Your goal is not to be perfect. Your goal is to make a conscious decision.',
 'An urge can be present while you take a small step toward what matters to you.',
 'You can be kind to yourself and still keep a boundary you chose.',
 'Rest, support and another beginning are always available to you.'
];
export function sosRemaining(start:number,now=Date.now()){return Math.max(0,300-Math.floor((now-start)/1000))}
export function sosStage(start:number,now=Date.now()){return Math.min(4,Math.max(0,Math.floor((now-start)/60000)))}

const specificScripts:Record<string,string[]>={
 'Strong sexual urge':['An urge is a feeling, not an instruction. Make room for it while you choose a boundary that matters to you.','You can step away, breathe and choose again. You do not need to argue with yourself or judge your body.'],
 'Urge to watch pornography':['Put a little distance between you and the screen. A different room and one deliberate action can support your chosen boundary.','This is a moment to care for yourself. Try an offline activity and notice what you need, without blaming yourself.'],
 'Urge to procrastinate':['You do not need to finish everything now. Open the task, choose the smallest useful step, and give it two minutes.','Starting can be imperfect. Make the next action small enough that you can try it without a promise to do more.'],
 'Urge to scroll social media':['Before the next scroll, ask what you came here for. You can put the phone down and give your attention somewhere you chose.','You are allowed to leave some updates unread. Choose a short break that gives something back to you.'],
 'Stress':['You do not have to solve the whole situation in this minute. Feel your feet, soften your shoulders, and choose one manageable action.','Support is allowed. Name what feels difficult, take a comfortable breath, and reach out if you want company.'],
 'Low motivation':['A small action can count even when you do not feel inspired. Choose something realistic, or give yourself a deliberate rest.','Your energy changes. Let today’s plan fit today’s capacity; a gentle beginning is still a beginning.'],
 'A setback':['One choice is not your whole story. Notice what happened, adjust one practical thing, and keep the progress you already earned.','You can take responsibility without insulting yourself. Decide what would support your next choice and begin there.']
};
export function scriptsForIssue(issue:string){return specificScripts[issue]||supportScripts}

let scriptSequence=0;
export function nextSupportScript(){return scriptSequence++%supportScripts.length}
