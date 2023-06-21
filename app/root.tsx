import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import styles from "./tailwind.css"

import Nav from './components/Nav'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  { rel: "stylesheet", href: 'https://fonts.googleapis.com/css2?family=Caladea:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-['Caladea'] overflow-hidden max-md:overflow-scroll">
        {/* TODO: Formalize single-page layout rules */}
        <div className="w-8/12 max-md:w-11/12 mx-auto mt-4 max-md:mt-2 h-[calc(100dvh)] pb-[80px] max-md:pb-0 max-md:h-full overflow-hidden">
          <Nav />
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
