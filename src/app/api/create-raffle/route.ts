import dbConnect from "@/lib/dbconnect";
import { Raffle } from "@/modals";
import {
  fetchLatestUtxoData,
  getSellerOrdOutputValue,
  getTxHexById,
  toXOnly,
} from "@/utils/MarketPlace";
import { NextRequest, NextResponse } from "next/server";
import * as bitcoin from "bitcoinjs-lib";
import secp256k1 from "@bitcoinerlab/secp256k1";
import { testnet } from "bitcoinjs-lib/src/networks";
import {
  doesUtxoContainRunes,
  getInscription,
  getUtxosByAddress,
} from "@/utils/GetRunes";
import { calculateTxFee, selectPaymentUtxos } from "@/utils/MarketPlace/buying";

bitcoin.initEccLib(secp256k1);

async function processrunesUtxo(
  inscription: any,
  ordinal_address: string,
  ordinal_pubkey: string,
  cardinal_address: string,
  cardinal_pubkey: string,
  wallet: string,
  vault: string,
  maker_fee_bp?: number
) {
  wallet = wallet.toLowerCase();
 console.log({ inscription,ordinal_address,ordinal_pubkey,})
 console.log({cardinal_address, cardinal_pubkey, vault})
  // Create a new empty PSBT (Partially Signed Bitcoin Transaction) instance
  let psbt = new bitcoin.Psbt({
    network: process.env.NEXT_PUBLIC_NETWORK ? testnet : undefined,
  });

  // Initialize the taproot internal key
  let tap_internal_key = "";

  // Check if the address is a taproot address for main net or text both change latter
  const ordinalTaprootAddress =
    ordinal_address &&
    (ordinal_address.startsWith("bc1p") || ordinal_address.startsWith("tb1p"));

  let totalInput = 1;
  if ((ordinal_address && inscription.utxo_id, totalInput)) {
    const [ordinalUtxoTxId, ordinalUtxoVout] = inscription.utxo_id.split(":");
    console.log(
      "ordinalUtxoTxId:",
      ordinalUtxoTxId,
      "ordinalUtxoVout:",
      ordinalUtxoVout
    );

    const tx = bitcoin.Transaction.fromHex(await getTxHexById(ordinalUtxoTxId));
    console.log(tx, "tx done");
    // Clear witness data if public key is not provided
    if (!ordinal_pubkey) {
      for (const output in tx.outs) {
        try {
          tx.setWitness(parseInt(output), []);
        } catch {}
      }
    }

    // Define the input for the PSBT
    const input: any = {
      hash: ordinalUtxoTxId,
      index: parseInt(ordinalUtxoVout),
      ...(!ordinalTaprootAddress && { nonWitnessUtxo: tx.toBuffer() }),
      witnessUtxo: tx.outs[Number(ordinalUtxoVout)],
    };

    console.log({ ordinalTaprootAddress });

    // Add the taproot internal key if it's a taproot address
    if (ordinalTaprootAddress) {
      input.tapInternalKey = toXOnly(
        tx.toBuffer().constructor(ordinal_pubkey, "hex")
      );
    }

    console.log({ tapInternalKey: input.tapInternalKey, ordinal_pubkey });

    // Add the input to the PSBT
    psbt.addInput(input);

    // Add the output to the PSBT
    psbt.addOutput({
      address: vault,
      value: 3000,
    });
    const cardinalTaprootAddress =
      cardinal_address.startsWith("bc1p") ||
      cardinal_address.startsWith("tb1p");

    const cardinalSegwitAddress =
      cardinal_address.startsWith("bc1q") ||
      cardinal_address.startsWith("tb1q");

    const payerUtxos = await getUtxosByAddress(cardinal_address);
    console.log(payerUtxos.length, "---------payerUtxos");
    const minimumValueRequired = 3000;
    const paymentUtxos = await selectPaymentUtxos(
      payerUtxos,
      minimumValueRequired,
      2,
      2,
      24,
      cardinalTaprootAddress
    );

    // let totalInput = 1;

    let totalValue = inscription.value;
    for (const utxo of paymentUtxos) {
      const tx = bitcoin.Transaction.fromHex(await getTxHexById(utxo.txid));

      // Loop through outputs of the transaction ccr
      for (const output in tx.outs) {
        try {
          // Attempt to set an empty witness for each output
          tx.setWitness(parseInt(output), []);
        } catch {}
      }

      const input: any = {
        hash: utxo.txid,
        index: utxo.vout,
        // Include non-witness UTXO if taprootAddress is defined
        ...(cardinalTaprootAddress && {
          nonWitnessUtxo: tx.toBuffer(),
        }),
      };

      if (!cardinalTaprootAddress) {
        // Construct redeem script for P2WPKH (pay-to-witness-public-key-hash)
        const redeemScript = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(cardinal_pubkey!, "hex"),
        }).output;

        // Create P2SH (pay-to-script-hash) from redeem script
        const p2sh = bitcoin.payments.p2sh({
          redeem: { output: redeemScript },
        });

        // Handle different wallets
        if (wallet !== "unisat") {
          input.witnessUtxo = tx.outs[utxo.vout];
          // Set redeem script for specific wallets
          if (
            !cardinalSegwitAddress &&
            (wallet === "xverse" || wallet === "magiceden")
          ) {
            input.redeemScript = p2sh.redeem?.output;
          }
        } else {
          // Handle unisat wallet inputs
          input.witnessUtxo = tx.outs[utxo.vout];
        }
      } else {
        // Handle taproot address case
        input.witnessUtxo = tx.outs[utxo.vout];
        input.tapInternalKey = toXOnly(
          tx.toBuffer().constructor(cardinal_pubkey, "hex")
        );
      }
      console.log(input, "-input add");
      psbt.addInput(input);
      // Accumulate total input value
      totalInput += 1;
      totalValue += utxo.value;
    }

    console.log(totalInput, "---- TOTAL INPUT");

    const finalFees = calculateTxFee(
      totalInput,
      3, // inscription + service fee output
      24,
      "pwpkh",
      "taproot"
    );

    const changeValue = totalValue - finalFees;
    console.log({ changeValue });
    // We must have enough value to create a dummy utxo and pay for tx fees

    if (changeValue < 0) {
      throw new Error(
        `You might have pending transactions or not enough fund to complete tx at the provided FeeRate`
      );
    }
    const minimun_utxo_value = 1000;
    if (changeValue > minimun_utxo_value) {
      psbt.addOutput({
        address: cardinal_address,
        value: changeValue,
      });
    }

    console.log(psbt, "psbt");
    // Set the taproot internal key
    tap_internal_key = ordinalTaprootAddress
      ? input.tapInternalKey.toString()
      : "";
  } else {
    console.debug({
      address: ordinal_address,
    });
    throw new Error("Ord Provider Unavailable");
  }

  // Get the unsigned PSBT in Base64 format
  const unsignedPsbtBase64 = psbt.toBase64();
  // console.log(unsignedPsbtBase64, "----------unsignedPsbtBase64");

  return {
    totalInput,
    unsignedPsbtBase64,
    tap_internal_key,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      inscription_id,
      inscription_number,
      vault,
      txid,
      vout,
      value,
      ordinal_address,
      ordinal_pubkey,
      cardinal_address,
      cardinal_pubkey,
      wallet,
      rune_id,
      rune_name,
      total_balance,
      rune_divisibility,
      endDate,
      totalTickets,
      pricePerTicket,
    } = body;
    console.log({ body });

    const inscription = {
      txid,
      vout,
      value,
      utxo_id: txid + ":" + vout,
    };

    const {
      totalInput,
      unsignedPsbtBase64,
      tap_internal_key,
    } = await processrunesUtxo(
      inscription,
      ordinal_address,
      ordinal_pubkey,
      cardinal_address,
      cardinal_pubkey,
      wallet,
      vault
    );

    console.log(
      unsignedPsbtBase64,
      "unsignedPsbtBase64",
      tap_internal_key,
      "tap_internal_key",
      totalInput,
      "totalInput"
    );

    await dbConnect();

    const response = await Raffle.create({
      inscription_id,
      inscription_number,
      vault,
      unsigned_psbt_base64: unsignedPsbtBase64,
      rune_id,
      rune_name,
      total_balance,
      rune_divisibility,
      end_date: endDate,
      total_tickets: totalTickets,
      price_per_ticket: pricePerTicket,
      utxo_id: inscription.txid + ":" + inscription.vout,
      status: true,
    });
    console.log(response, "stored raffle");

    return NextResponse.json({
      utxo_id: inscription.txid + ":" + inscription.vout,
      value: value,
      unsignedPsbtBase64,
      totalInput,
      tap_internal_key,
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
