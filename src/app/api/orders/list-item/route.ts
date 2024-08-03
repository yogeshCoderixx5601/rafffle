// app/api/v2/order/list-item.ts
import { NextRequest, NextResponse } from "next/server";
import { Raffle } from "@/modals";

import * as bitcoin from "bitcoinjs-lib";
import secp256k1 from "@bitcoinerlab/secp256k1";
import { testnet } from "bitcoinjs-lib/src/networks";
import dbConnect from "@/lib/dbconnect";
import { addFinalScriptWitness, verifySignature } from "@/utils/MarketPlace/Listiing";


export async function POST(req: NextRequest) {
  console.log("***** LIST ITEM API CALLED *****");

  const itemData = await req.json();
  const orderInput = itemData.params.listData;
  console.log(orderInput, "-----------orderInput bulk sign");
  // Ensure orderInput contains all necessary fields
  const requiredFields = [
    "signed_listing_psbt_base64",
  ];
  const missingFields = requiredFields.filter(
    (field) => !Object.hasOwnProperty.call(orderInput, field)
  );

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    bitcoin.initEccLib(secp256k1);
      // console.log("adding final script witness");

      const psbt = addFinalScriptWitness(orderInput.signed_listing_psbt_base64);
      console.log(psbt,"---------psbt")

      return NextResponse.json({
        ok: true,
        // result: { utxo_id: orderInput.utxo_id, price: orderInput.price },
        message: "list and sign utxo done",
      });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        utxo_id: orderInput.utxo_id,
        price: orderInput.price,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
