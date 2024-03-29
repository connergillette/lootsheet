import { cssBundleHref } from "@remix-run/css-bundle"
import { LinksFunction, LoaderArgs, json } from "@remix-run/node"
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react"
import styles from "./tailwind.css"
import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-remix'

import Nav from './components/Nav'
import { useEffect, useState } from 'react'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  { rel: "stylesheet", href: 'https://fonts.googleapis.com/css2?family=Caladea:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response()

  const supabase = createServerClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '', {
    request,
    response,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  }

  return json({ env, session }, { headers: response.headers })
}

export default function App() {

  const { env, session } = useLoaderData()
  const { revalidate } = useRevalidator()
  const [supabase] = useState(() => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_KEY))

  const serverAccessToken = session?.access_token

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        // server and client are out of sync.
        revalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [serverAccessToken, supabase, revalidate])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-['Caladea'] overflow-hidden overflow-y-scroll no-scrollbar w-screen h-screen pb-[200px] flex">
        {/* TODO: Formalize single-page layout rules */}
        <div className="w-full fixed bg-white/90 border-b-[1px] border-gray-100 border-solid h-14 flex justify-center">
          <Nav session={session} signOut={() => supabase.auth.signOut()} />
        </div>
        <div className="w-8/12 min-w-[900px] max-md:w-11/12 max-md:min-w-[300px] mx-auto max-md:mt-2 max-md:pb-0 max-md:h-full h-full flex flex-col">
          <Outlet context={{ supabase, session }} />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
