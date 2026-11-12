import islamicPrograms from '../content/islamic-programs.json' with {type:'json'};
export type Challenge={id:string;title:string;description:string;category:string;difficulty:string;icon:string;days:string[];islamic?:boolean;color?:string};
const plans=[
['reading','A little more, every day','Make space for books, one page at a time.','Reading','Gentle','BookOpen',`Choose a book and read two pages|Create a quiet reading corner|Read for five minutes after breakfast|Write down one idea from your reading|Read five pages without your phone|Try reading before bed|Reflect on your first week of reading|Read for ten focused minutes|Look up an unfamiliar word|Share one idea with a friend|Read a chapter and summarize it|Try a different reading time|Revisit your favorite passage|Review which reading routine works best|Read for fifteen minutes|Connect one idea to your own life|Read outside or in a new quiet spot|Write three questions about your book|Apply one lesson from your reading|Choose your next book|Reflect on your progress and plan your reading routine`],
['fitness','Move with intention','Gentle movement. A stronger everyday you.','Fitness','Moderate','Activity',`Take a comfortable five-minute walk|Try gentle shoulder and ankle mobility|Walk for eight minutes at your own pace|Stretch gently for five minutes|Try five supported chair squats if comfortable|Take a ten-minute walk|Rest and reflect on what feels good|Walk a familiar route with intention|Try a gentle beginner movement video|Practice balancing near a stable support|Take movement breaks during your day|Walk for twelve comfortable minutes|Repeat your favorite gentle exercise|Rest and review your energy|Plan three movement sessions this week|Try a slightly longer comfortable walk|Practice gentle mobility for ten minutes|Enjoy an accessible outdoor activity|Repeat a movement you enjoy|Take a recovery day and reflect|Design a sustainable weekly movement plan`],
['focus','Find your focus','Less distraction. More room for what matters.','Focus','Gentle','Focus',`Choose one meaningful priority|Clear your workspace for five minutes|Silence nonessential alerts for one session|Try a ten-minute focus block|Write a distraction list beside you|Take a screen-free break|Review your most focused moment|Try a fifteen-minute focus block|Close unused browser tabs|Set a clear stopping point before working|Batch small messages into one session|Take a brief walk between focus blocks|Protect one phone-free work session|Review your biggest distraction|Plan two realistic focus blocks|Work on your hardest task first|Practice returning kindly after distraction|Set tomorrow's priority before finishing|Repeat your best focus routine|Create your personal distraction plan|Reflect and choose a sustainable focus schedule`],
['learning','Stay curious','Turn curiosity into a daily learning practice.','Learning','Moderate','GraduationCap',`Pick one topic you want to understand|Find a trustworthy introductory resource|Study one concept for ten minutes|Explain the concept in your own words|Make three recall questions|Answer yesterday's questions from memory|Review your learning notes|Study a second concept|Compare the first two concepts|Create a small practical example|Teach an idea to someone|Try a short practice exercise|Identify one gap in understanding|Review with spaced recall|Choose a small learning project|Complete the first project step|Ask and research one deeper question|Apply feedback to your project|Summarize what you learned|Make a plan for continued practice|Reflect and demonstrate your new knowledge`],
['digital','Make room for real life','Build a calmer relationship with your screen.','Digital wellbeing','Moderate','Smartphone',`Observe your screen-time report without judgment|Identify your most distracting app|Choose one phone-free mealtime|Move a distracting app off your home screen|Disable one unnecessary notification category|Replace five minutes of scrolling with a walk|Review what triggered automatic checking|Set an intentional app-use window|Charge your phone outside arm's reach|Try a screen-free first fifteen minutes|Write down what you wanted before opening an app|Unfollow an account that drains you|Spend ten minutes on an offline hobby|Review your most helpful boundary|Create a phone-free space|Try a thirty-minute offline evening|Ask a friend to share an offline activity|Practice pausing before opening social media|Review your screen-time trend|Choose two digital boundaries to keep|Reflect on how you want technology to serve you`],
['control','Pause, then choose','Practice a kinder response to impulsive habits.','Self-control','Moderate','Heart',`Choose an optional private intention|Notice one situation that triggers an urge|Practice a minute of slow breathing|Write one supportive coping phrase|Change your environment when distracted|Try delaying an impulse for two minutes|Reflect without judging yourself|Identify a need beneath an urge|Create a list of three alternative activities|Practice a five-minute grounding break|Ask a trusted person for support if you wish|Make your environment support your intention|Plan for a difficult moment|Review which coping strategy helped|Practice noticing an urge without acting|Schedule a nourishing activity|Try the SOS breathing exercise|Write a compassionate setback plan|Recognize one choice you feel good about|Choose your ongoing support tools|Reflect on progress without demanding perfection`],
['sleep','A softer landing','Create a gentle wind-down routine.','Sleep','Gentle','Moon',`Observe your usual bedtime|Choose a realistic wake-up window|Dim lights before your planned bedtime|Create a ten-minute wind-down routine|Move work away from your sleep space|Try reading instead of scrolling tonight|Review how your routine feels|Prepare tomorrow's essentials earlier|Try a relaxing breathing exercise|Notice how late caffeine affects you|Keep your sleep space comfortable|Write tomorrow's worries on paper|Practice your wind-down routine|Review your sleep observations|Choose one evening boundary|Take a little daylight during your morning|Enjoy gentle movement earlier in the day|Try a quiet screen-free wind-down|Repeat the routine that helps most|Plan for a disrupted evening kindly|Choose a sustainable bedtime routine`],
['productivity','Small steps, meaningful days','Build a system that works for your real life.','Productivity','Moderate','ListTodo',`Capture everything on your mind|Choose three realistic priorities|Break one large task into a small step|Estimate the time for your main task|Leave buffer time in your schedule|Finish a small task you've postponed|Review your first week|Group similar small tasks|Decline or defer one unnecessary commitment|Use a simple start-of-day checklist|Try one focused work interval|Organize your most-used files|Prepare tomorrow's first step|Review what made planning easier|Set one meaningful weekly outcome|Schedule time for your important work|Leave room for rest in your plan|Simplify a recurring task|Review a task that keeps getting missed|Design a five-minute weekly review|Reflect and keep the parts that helped`],
['kindness','A little more kindness','Quiet acts that make everyday life warmer.','Kindness','Gentle','HandHeart',`Offer someone a sincere thank-you|Listen to someone without interrupting|Send a thoughtful message|Do a small helpful task at home|Give someone an authentic compliment|Be kind to yourself during a difficult moment|Reflect privately on this week's actions|Check in on someone you haven't spoken to|Leave a shared space a little better|Let someone go ahead of you if practical|Share something useful with someone|Write a thank-you note|Offer help without expecting a return|Reflect on the impact of quiet kindness|Spend quality time with someone|Support a cause in a way you can afford|Practice patience in a frustrating moment|Appreciate someone whose work goes unnoticed|Do one anonymous good deed if possible|Choose a regular act of kindness|Reflect and make kindness part of your routine`]
] as const;
export const challenges:Challenge[]=plans.map(([id,title,description,category,difficulty,icon,days])=>({id,title,description,category,difficulty,icon,days:days.split('|')}));

// Legacy enrollment IDs are retained. New spiritual plans use practical, non-quotation activities.
const selfControlPlans=[
 {id:'pornography',title:'Your screen, your boundaries',description:'A private, practical program for reducing unwanted pornography consumption by your own choice.',category:'Self-control',icon:'ShieldCheck',days:[
 'Choose one boundary you genuinely want, without judging your past.',
 'Notice one situation in which unwanted viewing usually begins.',
 'Make a list of three activities that meet boredom with something different.',
 'Move a device away from a place associated with unwanted viewing.',
 'Review optional content filters and choose settings that support your boundary.',
 'Practice a two-minute pause before opening a familiar trigger site.',
 'Review the first week with curiosity; keep one helpful change.',
 'Plan a screen-free activity for a time that often feels difficult.',
 'Notice whether tiredness changes your choices and plan a gentler evening.',
 'Try the SOS grounding exercise during a manageable urge.',
 'Remove an unnecessary content source or recommendation that you find triggering.',
 'Prepare a short list of trusted people or professional support options.',
 'Create a device stopping point for one evening.',
 'Reflect on which boundary felt useful and which needs adjustment.',
 'Make a plan for the next stressful or lonely moment.',
 'Practice noticing an urge without treating it as a command.',
 'Spend time on an offline interest you want to strengthen.',
 'Write a nonjudgmental response to a possible setback.',
 'Review your environment for one more small, helpful change.',
 'Choose a realistic ongoing check-in frequency.',
 'Create a maintenance plan; seek professional support if distress or disruption is significant.'
 ]},
 {id:'personal-boundaries',title:'A boundary you choose',description:'Support for people who personally want to reduce or stop unwanted masturbation, without health myths or shame.',category:'Self-control',icon:'Heart',days:[
 'Write an optional personal intention and why it matters to you.',
 'Notice an urge and name its context without labeling yourself.',
 'List three ways you can respond to boredom besides your usual habit.',
 'Try a brief pause before making a choice.',
 'Plan a calm bedtime routine that supports your chosen boundary.',
 'Practice changing rooms when a familiar pattern starts.',
 'Review the week without demanding perfection.',
 'Notice whether stress, fatigue or loneliness is part of your pattern.',
 'Schedule one activity that feels nourishing and realistic.',
 'Practice the SOS breathing step at a comfortable pace.',
 'Choose a device boundary if online content is part of your pattern.',
 'Write one compassionate phrase for a difficult moment.',
 'Make a plan for an unstructured evening.',
 'Review which coping action you would like to repeat.',
 'Practice allowing an urge to exist while doing another chosen activity.',
 'Make time for social connection if it feels helpful.',
 'Review your expectations and make your goal more realistic if needed.',
 'Write a recovery plan that does not erase earlier achievements.',
 'Identify one choice you feel good about, however small.',
 'Choose an ongoing reflection routine without obsessive checking.',
 'Design a maintenance plan and consider professional support for persistent distress or disruption.'
 ]},
 {id:'impulses',title:'A moment before the impulse',description:'Learn to notice patterns and practice deliberate choices in everyday life.',category:'Self-control',icon:'Focus',days:[
 'Choose one impulsive pattern you want to understand.',
 'Notice the situation just before the pattern begins.',
 'Identify one feeling that often accompanies the impulse.',
 'Practice taking one ordinary breath before a small decision.',
 'Put a visual reminder near one common trigger.',
 'Try a two-minute delay on a low-stakes impulse.',
 'Review the first week and name one thing you learned.',
 'Plan a helpful response to boredom.',
 'Create a small barrier between a trigger and your usual action.',
 'Try a brief grounding exercise when distracted.',
 'Ask what need the impulse might be connected to, without assuming a cause.',
 'Choose an accessible alternative action for a busy day.',
 'Practice a deliberate decision when you are mildly frustrated.',
 'Review which environmental change was useful.',
 'Plan for a tired or stressful evening.',
 'Pause before an optional purchase, message or app opening.',
 'Try telling a trusted person about a boundary if you wish.',
 'Practice returning to your plan after a setback.',
 'Notice one moment in which you chose intentionally.',
 'Choose two tools you want to keep using.',
 'Write a sustainable support plan and seek professional help if the pattern significantly disrupts life.'
 ]}
];
for(const plan of selfControlPlans)challenges.push({...plan,difficulty:'Gentle'});

// Original planning activities only: no scripture, rulings or fabricated prayer times.
challenges.push(...islamicPrograms);
