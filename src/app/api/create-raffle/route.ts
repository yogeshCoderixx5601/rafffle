import dbConnect from "@/lib/dbconnect";
import { Raffle } from "@/modals";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      inscription_id,
      inscription_number,
      address,
      rune_id,
      rune_name,
      total_balance,
      rune_divisibility,
      endDate,
      totalTickets,
      pricePerTicket,
    } = body;
    console.log({ body });
    await dbConnect();

    const response = await Raffle.create({
      inscription_id,
      inscription_number,
      address,
      rune_id,
      rune_name,
      total_balance,
      rune_divisibility,
      end_date: endDate,
      total_tickets: totalTickets,
      price_per_ticket: pricePerTicket,
    });
    console.log(response, "stored raffle");

    return NextResponse.json({
      success: true,
      message: "Raffle created successfully",
    });
  } catch (error:any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Error creating raffle",
    });
  }
}

// update the raffle sold_ticket value
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, sold_tickets } = body;

    console.log({ body });
    await dbConnect();

    const result = await Raffle.findOneAndUpdate(
      { _id },
      {
        $inc: { sold_tickets: sold_tickets },
      }
    );

    console.log(result, "stored raffle");

    return NextResponse.json({
      success: true,
      message: "Raffle updated successfully",
      result,
    });
  } catch (error:any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Error updating raffle",
    });
  }
}
