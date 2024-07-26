import dbConnect from "@/lib/dbconnect";
import { Raffle } from "@/modals";
import convertParams from "@/utils/api/convertParams";
import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
      console.log(req.nextUrl)
   const query = convertParams(Raffle, req.nextUrl);
    console.log({ finalQueryCbrc: query });

      await dbConnect()

      const result = await Raffle.find(query.find)

      console.log({result})

      return NextResponse.json({success:true, message:"raffle get successfully", result })
    } catch (error:any) {
       return NextResponse.json({success:false, message:error.message || "error in gettin raffle"}) 
    }
}