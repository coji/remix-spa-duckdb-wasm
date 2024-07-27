import { twc } from 'react-twc'

export const Layout = twc.div`grid min-h-dvh grid-rows-[auto_1fr_auto] bg-slate-100`
export const Header = twc.header`border-b bg-card p-2 md:container`
export const Heading = twc.h1`text-2xl font-bold`
export const Main = twc.main`flex flex-col gap-4 p-4 md:container`
export const Footer = twc.footer`flex justify-center gap-4 border-t bg-card p-2`
export const ExtLink = twc.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`text-blue-500 hover:underline`
