import dbConnect from "@/lib/dbconnect";
import { BuyDetail } from "@/modals";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("*******BUY TICKETS DETAILS*******");

  try {
    // Parse the request body as JSON
    const buyDetails = await req.json();
    console.log({ buyDetails });

    await dbConnect()
    const {
      raffle_id,
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
      raffle_id,
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
