
import { getVaultBalance } from "@/utils/MarketPlace";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("********GETTING VAULT BALANCE***********");
  try {
      const ordinal_address = req.nextUrl.searchParams.get('ordinal_address');
      console.log(ordinal_address,"----------ordinal_address")

   if (!ordinal_address ) {
    return NextResponse.json({
      success: true,
      data: ordinal_address,
    });
  }

    const response = await getVaultBalance(ordinal_address);
    if (!response) {
      return NextResponse.json({
        success: false,
        message: "error in getting balance",
      });
    }
    console.log(response, "api getVaultBalance");
    return NextResponse.json({
      rune:response.result,
      success: true,
      message: "balance get successfully",
    });
  } catch (error:any) {
    return NextResponse.json({
      success: false,
      message: error.message || "error in getting balance",
    });
  }
}


