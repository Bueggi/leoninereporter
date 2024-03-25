'use client'

import { useSession, signIn, signOut } from "next-auth/react"

const LoginTest = () => {
    const session = useSession({required: true})
    console.log(session)
    return (<button
        type="button"
        onClick={signIn}
        className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >Hallo</button>
    )
}

export default LoginTest
