import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";

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
      <body className="font-['Caladea']">
        <div className="w-8/12 max-md:w-11/12 mx-auto mt-4 max-md:mt-2 h-[calc(95dvh)] max-md:h-full overflow-hidden">
          <div className="flex mx-auto justify-center align-middle">
            <div className="font-bold text-2xl align-middle py-2">lootsheet</div>
            <div className="flex justify-end gap-2 grow">
              <button type="button" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition`}>Feed</button>
              <button type="button" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition`}>Categories</button>
            </div>
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
