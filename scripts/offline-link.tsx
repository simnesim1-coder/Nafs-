import type {AnchorHTMLAttributes} from 'react';
export default function OfflineLink({href,children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>){return <a {...props} href={href==='/'?'#':href} onClick={event=>{if(href==='/'){event.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}}>{children}</a>}
