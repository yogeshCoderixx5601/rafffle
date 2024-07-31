import dbConnect from "@/lib/dbconnect";
import { BuyDetail } from "@/modals";
import convertParams from "@/utils/api/convertParams";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("*******BUY TICKETS DETAILS*******");

  try {
    // Parse the request body as JSON
    const buyDetails = await req.json();
    console.log({ buyDetails });

    await dbConnect()
    const {
      raffle,
      ordinal_address,
      ordinal_pubkey,
      cardinal_address,
      cardinal_pubkey,
      wallet,
      quantity,
      rune_id,
      rune_name
    } = buyDetails;

    const result = await BuyDetail.create({
      raffle,
      ordinal_address,
      ordinal_pubkey,
      cardinal_address,
      cardinal_pubkey,
      wallet,
      quantity,
      rune_id,
      rune_name
    })
    console.log({ result });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", error);

    // Send an error response
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 }
    );
  }
}





export async function GET(req:NextRequest){
  console.log("**********GET PURCHASED TICKET RAFFLE API CALLED***********")
  try {
    // console.log(req.nextUrl);
    const query = convertParams(BuyDetail, req.nextUrl);
    console.log({ finalQueryCbrc: query });

    await dbConnect();

    const result = await BuyDetail.find(query.find)
    .populate('raffle').exec();

    console.log({ result });

    return NextResponse.json({ success: true, message: "raffle get successfully", result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "error in getting raffle" });
  }
}
