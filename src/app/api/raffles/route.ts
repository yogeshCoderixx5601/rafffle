import dbConnect from "@/lib/dbconnect";
import { Raffle } from "@/modals";
import convertParams from "@/utils/api/convertParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("**********GET RAFFLES API CALLED**********");
  try {
    const query = convertParams(Raffle, req.nextUrl);
    console.log({ finalQueryCbrc: query });

    await dbConnect();

    const result = await Raffle.find(query.find)
      .where(query.where)
      .limit(query.limit)
      .skip(query.start)
      .lean()
      .exec();
    console.log(result, "DATA GET BASED ON live:TRUE");

    console.log({ result });

    return NextResponse.json({ success: true, message: "raffle get successfully", result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "error in getting raffle" });
  }
}
