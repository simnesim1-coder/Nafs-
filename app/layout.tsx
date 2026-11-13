import type { Metadata,Viewport } from 'next';
import './globals.css';
import './cinematic.css';
export const metadata:Metadata={title:'NAFS — A little better, every day',description:'Your private space for meaningful days, better habits and steady growth.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'NAFS',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#101c19'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru" suppressHydrationWarning><body>{children}</body></html>}
