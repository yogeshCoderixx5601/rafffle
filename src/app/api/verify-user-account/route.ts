import dbConnect from "@/lib/dbconnect";
import { UserAccount } from "@/modals";
import convertParams from "@/utils/api/convertParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("**********CHECKING OR VERIFYING USER ACCOUNT EXISTENCE************");
  try {
    const query = convertParams(UserAccount, req.nextUrl);
    console.log({ finalQueryCbrc: query });

    await dbConnect();

    const result = await UserAccount.find(query.find);
    console.log(result, "-------------result RuneUtxo");

    if (result.length > 0) {
      console.log(result, "User account already exists");
      return NextResponse.json({
        result,
        success: true,
        message: "User already exists",
        count: result.length,
      });
    } else {
      return NextResponse.json({
        result,
        success: false,
        message: "User does not exist",
        count: result.length,
      });
    }
  } catch (error) {
    console.error("Error verifying user account:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while checking user existence",
    });
  }
}
