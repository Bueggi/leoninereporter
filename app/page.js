"use client";

import { signIn, useSession } from "next-auth/react"; // getSession entfernt
import Image from "next/image";
import Link from "next/link"; // WICHTIG: Link importieren

export default function Homepage() {
  const { data: session, status } = useSession(); // Destructuring ist oft sauberer

  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 pt-14">
        {/* ... Hintergrund Divs (unverändert) ... */}
        
        <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8 ">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto">
              Home of Talents
            </h1>

            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <p className="text-lg leading-8 text-gray-600">
                Willkommen in unserem Backend...
              </p>
              
              <div className="mt-10 flex items-center gap-x-6">
                {/* OPTIONAL: Loading State behandeln
                  Verhindert, dass der falsche Button kurz aufblitzt 
                */}
                {status === "loading" ? (
                  <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
                ) : status === "authenticated" ? (
                  // VERBESSERUNG 1: Link statt <a>
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Zum Dashboard
                  </Link>
                ) : (
                  // VERBESSERUNG 2: Button statt <a>
                  <button
                    onClick={() => signIn()}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    LogIn
                  </button>
                )}
              </div>
            </div>
            
            <Image
              alt="Home of Talents Logo" // VERBESSERUNG: Alt Text ausgefüllt (gut für SEO/Accessibility)
              src="/HoTLogo.png"
              width={500} // Tipp: Versuch hier realistische Pixelwerte zu nehmen, nicht 100 wenn es groß angezeigt wird
              height={500}
              // priority // Tipp: Wenn das Bild "above the fold" ist (sofort sichtbar), füge 'priority' hinzu
              className="aspect-[6/5] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-36"
            />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>
    </div>
  );
}