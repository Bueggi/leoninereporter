import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import {authOptions} from './auth/[...nextauth]/route'

const wrapAuth = async (...args) => {
    console.log(args)
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({success: false, message: "Du bist nicht eingeloggt"}, {status: 401});
      }
    
      return await func(req, res)
}

export default wrapAuth