'use client';
import {useEffect, useRef, useState} from 'react';
import {Bookmark, Check, RefreshCw, Sparkles, Volume2, Square, X} from 'lucide-react';
import {today, type Action, type State} from '@/lib/domain';
import {allowsFaithMotivation, chooseMotivation, dailyMotivation, motivationById, favoriteById, type MotivationContext, type MotivationTopic, type MotivationMessage} from '@/lib/motivation';

// Contextual reading stays in this page session. No SOS choice or issue is written to storage.
const sessionRecent: string[] = [];
const titles: Record<MotivationContext, string> = {
  today: 'motivation.daily', before: 'motivation.before', completed: 'motivation.completed',
  sos: 'motivation.sos', setback: 'motivation.setback', marathon: 'motivation.marathon',
};
type Props = {state: State; dispatch: (action: Action) => Promise<boolean>; t: (key: string) => string; busy?: boolean};

function MessageCard({message, state, dispatch, t, busy, refresh, context, voice = false, dismiss}: Props & {
  message: MotivationMessage; refresh?: () => void; context: MotivationContext;
  voice?: boolean; dismiss?: () => void;
}) {
  const [speaking, setSpeaking] = useState(false), [playbackError, setPlaybackError] = useState(false);
  const favorite = state.motivation.favorites.includes(message.id);
  const text = message.text[state.preferences.language];
  useEffect(() => {
    if (!voice) return;
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, [message.id, state.preferences.language, voice]);
  function read() {
    if (!('speechSynthesis' in window)) { setPlaybackError(true); return; }
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const local = speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith(state.preferences.language));
    if (!local) { setPlaybackError(true); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = local; utterance.lang = local.lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setPlaybackError(true); };
    setPlaybackError(false); setSpeaking(true); speechSynthesis.speak(utterance);
  }
  return <section className={'motivation-card motivation-' + context} aria-label={t(titles[context])} data-message-id={message.id}>
    <div className="motivation-toolbar">
      <span><Sparkles size={15}/>{t(titles[context])}</span>
      <div>
        {refresh && <button aria-label={t('motivation.another')} title={t('motivation.another')} disabled={busy} onClick={() => { setSpeaking(false); setPlaybackError(false); refresh(); }}><RefreshCw size={17}/></button>}
        <button aria-label={t(favorite ? 'motivation.remove' : 'motivation.save')} title={t(favorite ? 'motivation.remove' : 'motivation.save')} aria-pressed={favorite} disabled={busy} onClick={() => dispatch({type: 'motivationFavorite', id: message.id, saved: !favorite})}><Bookmark size={17} fill={favorite ? 'currentColor' : 'none'}/></button>
        {dismiss && <button aria-label={t('Close')} onClick={dismiss}><X size={17}/></button>}
      </div>
    </div>
    <div aria-live="polite" aria-atomic="true"><p className="motivation-copy" key={message.id + state.preferences.language}>{text}</p></div>
    <div className="motivation-footer"><span>{t('motivation.category.' + message.category)}</span>{favorite && <small><Check size={12}/>{t('motivation.saved')}</small>}</div>
    {voice && <><button className="motivation-read" onClick={read}>{speaking ? <Square size={15}/> : <Volume2 size={15}/>} {t(speaking ? 'Stop playback' : 'Read aloud with a local device voice')}</button>{playbackError && <p role="status" className="form-note">{t('Playback requires a matching local voice. No cloud text generation is used.')}</p>}</>}
  </section>;
}

export function DailyMotivation(props: Props) {
  const [day, setDay] = useState(today), attempted = useRef('');
  const {state, busy, dispatch} = props, faith = allowsFaithMotivation(state);
  const selection = dailyMotivation(state.motivation, day, faith).daily!;
  useEffect(() => {
    const check = () => setDay(today());
    const interval = setInterval(check, 15000);
    window.addEventListener('focus', check); document.addEventListener('visibilitychange', check);
    return () => { clearInterval(interval); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check); };
  }, []);
  useEffect(() => {
    const key = `${day}:${faith}`;
    if (busy || attempted.current === key || (state.motivation.daily?.day === day && state.motivation.daily.faith === faith && state.motivation.daily.id === selection.id)) return;
    attempted.current = key;
    void dispatch({type: 'motivationDaily', refresh: false});
  }, [day, faith, busy, state.motivation.daily, selection.id, dispatch]);
  return <MessageCard {...props} message={motivationById(selection.id)!} context="today" refresh={() => void dispatch({type: 'motivationDaily', refresh: true})}/>;
}

export function ContextMotivation(props: Props & {context: MotivationContext; topic?: MotivationTopic; voice?: boolean; dismiss?: () => void}) {
  const faith = allowsFaithMotivation(props.state);
  // Remount only the inner session when its eligibility changes, preserving user favorites.
  return <ContextMessage key={props.context + String(faith) + props.topic} {...props} faith={faith}/>;
}
function ContextMessage(props: Props & {context: MotivationContext; topic?: MotivationTopic; faith: boolean; voice?: boolean; dismiss?: () => void}) {
  const [selection, setSelection] = useState(() => ({message: chooseMotivation(props.context, today(), [...props.state.motivation.recent, ...sessionRecent], props.faith, props.topic), sequence: 0}));
  useEffect(() => {
    const index = sessionRecent.indexOf(selection.message.id);
    if (index !== -1) sessionRecent.splice(index, 1);
    sessionRecent.push(selection.message.id);
    if (sessionRecent.length > 24) sessionRecent.shift();
  }, [selection.message.id]);
  function refresh() {
    setSelection(previous => ({sequence: previous.sequence + 1, message: chooseMotivation(props.context, `${today()}:${previous.sequence + 1}`, [...props.state.motivation.recent, ...sessionRecent.filter(id => id !== previous.message.id), previous.message.id], props.faith, props.topic)}));
  }
  return <MessageCard {...props} message={selection.message} refresh={refresh}/>;
}

export function MotivationFavorites(props: Props) {
  const messages = props.state.motivation.favorites.map(favoriteById).filter((message): message is MotivationMessage => !!message);
  return <div className="motivation-library">
    <p className="form-note">{props.t('motivation.favoritesNote')}</p>
    <ContextMotivation {...props} context="today"/>
    <div className="section-header"><h2>{props.t('motivation.favorites')}</h2><span>{messages.length}</span></div>
    {messages.length ? [...messages].reverse().map(message => <MessageCard key={message.id} {...props} message={message} context="today"/>) : <div className="motivation-empty"><Bookmark size={28}/><h3>{props.t('motivation.empty')}</h3><p>{props.t('motivation.emptyHint')}</p></div>}
  </div>;
}
