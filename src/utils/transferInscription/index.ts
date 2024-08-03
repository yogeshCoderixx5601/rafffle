import axios from "axios";
import { AddressTxsUtxo } from "bitcoin-wallet-adapter/dist/types/types";
import * as bitcoin from "bitcoinjs-lib";
import secp256k1 from "@bitcoinerlab/secp256k1";
import {  satsToDollars } from "..";
import { doesUtxoContainInscription, getTxHexById, toXOnly } from "../MarketPlace";
import { doesUtxoContainRunes } from "../GetRunes";
const DUMMY_UTXO_VALUE = 1000;
export async function generateUnsignedPsbtForInscription(
  payment_address: string,
  publickey: string | undefined,
  fee_rate: number,
  wallet: string,
  inscriptions: any[]
) {
  console.log(inscriptions,"inscriptionsinscriptions-------")
  let payerUtxos: AddressTxsUtxo[];
  let paymentUtxos: AddressTxsUtxo[] | undefined;
  try {
    payerUtxos = await getUtxosByAddress(payment_address);
    // get users "all" utxo
  } catch (e) {
    console.error(e);
    return Promise.reject("Mempool error");
  }
  try {
    paymentUtxos = await selectPaymentUTXOs(
      payerUtxos, // all utxos
      inscriptions[0].inscription_fee,
      Math.floor(Math.random() * 3) + 3, // number between 3-5
      inscriptions.length + 1,
      fee_rate,
      payment_address.startsWith("bc1p")
    );
    if (!paymentUtxos) throw Error("Balance not enough");
    let psbt = null;
    let inputs = null; // Assuming inputs is not declared elsewhere

    psbt = await generateUnsignedPsbtForInscriptionPSBTBase64(
      payment_address,
      publickey,
      paymentUtxos,
      fee_rate,
      wallet,
      inscriptions
    );
    console.log({ psbt, inputs });
    return { psbt, inputs };
  } catch (err: any) {
    throw Error(err);
  }
}
async function getUtxosByAddress(address: string) {
  const url =
    process.env.NEXT_PUBLIC_NETWORK === "testnet"
      ? `https://mempool.space/testnet/api/address/${address}/utxo`
      : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
  const { data } = await axios.get(url);
  return data;
}

export async function selectPaymentUTXOs(
  utxos: AddressTxsUtxo[],
  amount: number, // amount is expected total output (except tx fee)
  vinsLength: number,
  voutsLength: number,
  fee_rate: number,
  taprootAddress?: boolean
) {
  const selectedUtxos: any = [];
  let selectedAmount = 0;
  // Sort descending by value, and filter out dummy utxos
  utxos = utxos
    .filter((x) => x.value > DUMMY_UTXO_VALUE)
    .sort((a, b) => b.value - a.value);
  for (const utxo of utxos) {
    // Never spend a utxo that contains an inscription for cardinal purposes
    if (await doesUtxoContainInscription(utxo)) {
      continue;
    }
    if (await doesUtxoContainRunes(utxo)) {
      continue;
    }
    selectedUtxos.push(utxo);
    selectedAmount += utxo.value;
    if (
      selectedAmount >=
      amount +
        calculateTxFee(
          vinsLength + selectedUtxos.length,
          voutsLength,
          fee_rate,
          taprootAddress ? "taproot" : "pwpkh", // Adjust based on actual use
          taprootAddress ? "taproot" : "pwpkh",
          1, // Include change output
          taprootAddress ? "taproot" : "pwpkh" // Change output type
        )
    ) {
      break;
    }
  }
  if (selectedAmount < amount) {
    throw `Your wallet needs ${Number(
      await satsToDollars(amount - selectedAmount)
    ).toFixed(2)} USD more`;
  }
  return selectedUtxos;
}

function calculateTxFee(
  vinsLength: number,
  voutsLength: number,
  feeRate: number,
  inputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
  outputAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh",
  includeChangeOutput: 0 | 1 = 1,
  changeAddressType: "pwpkh" | "taproot" | "p2sh_p2wpkh" = "pwpkh"
): number {
  const inputSizes = {
    pwpkh: { base: 31, witness: 107 },
    taproot: { base: 43, witness: 65 },
    p2sh_p2wpkh: { base: 58, witness: 107 },
  };
  const outputSizes = {
    pwpkh: 31,
    taproot: 43,
    p2sh_p2wpkh: 32,
  };
  // Calculate transaction overhead, considering whether any input uses SegWit
  function getTxOverhead(
    vins: number,
    vouts: number,
    isSegWit: boolean
  ): number {
    return (
      10 + // Basic non-witness transaction overhead (version, locktime)
      getSizeOfVarInt(vins) + // Input count
      getSizeOfVarInt(vouts) + // Output count
      (isSegWit ? 2 : 0)
    ); // SegWit marker and flag only if SegWit inputs are present
  }
  let totalBaseSize = getTxOverhead(
    vinsLength,
    voutsLength,
    inputAddressType.startsWith("p2")
  );
  let totalWitnessSize = 0;
  // Calculate total base size and witness size for inputs
  for (let i = 0; i < vinsLength; i++) {
    totalBaseSize += inputSizes[inputAddressType].base;
    totalWitnessSize += inputSizes[inputAddressType].witness;
  }
  // Calculate total base size for outputs
  totalBaseSize += voutsLength * outputSizes[outputAddressType];
  // Include change output if specified
  if (includeChangeOutput) {
    totalBaseSize += outputSizes[changeAddressType];
  }
  // Calculate total vbytes considering witness discount for SegWit inputs
  const totalVBytes = totalBaseSize + Math.ceil(totalWitnessSize / 4);
  const fee = totalVBytes * feeRate;
  console.log(
    `Final Transaction Size: ${totalVBytes} vbytes, Fee Rate: ${feeRate}, Calculated Fee: ${fee}`,
    { totalVBytes, feeRate, fee }
  );
  return fee;
}

function getSizeOfVarInt(length: number): number {
  if (length < 253) {
    return 1;
  } else if (length < 65536) {
    return 3;
  } else if (length < 4294967296) {
    return 5;
  } else {
    return 9; // Handling very large counts
  }
}

async function generateUnsignedPsbtForInscriptionPSBTBase64(
  payment_address: string,
  publickey: string | undefined,
  unqualifiedUtxos: AddressTxsUtxo[],
  fee_rate: number,
  wallet: string,
  inscriptions: any[]
  // order: IInscribeOrder
): Promise<string> {
  wallet = wallet?.toLowerCase();
  bitcoin.initEccLib(secp256k1);
  // generating empty psbt
  // pushing set amount of function
  let psbt = new bitcoin.Psbt({
    network:
      process.env.NEXT_PUBLIC_NETWORK === "testnet"
        ? bitcoin.networks.testnet
        : undefined,
  });

  const [mappedUnqualifiedUtxos, recommendedFee] = await Promise.all([
    mapUtxos(unqualifiedUtxos),
    fee_rate,
  ]);
  // Loop the unqualified utxos until we have enough to create a dummy utxo
  let totalValue = 0;
  let paymentUtxoCount = 0;
  const taprootAddress =
    payment_address.startsWith("bc1p") || payment_address.startsWith("tb1p");
  const segwitAddress =
    payment_address.startsWith("bc1q") || payment_address.startsWith("tb1q");
  for (const utxo of mappedUnqualifiedUtxos) {
    if (await doesUtxoContainInscription(utxo)) {
      continue;
    }
    if (await doesUtxoContainRunes(utxo)) {
      continue;
    }

    // const tx = utxo.tx;

    const input: any = {
      hash: utxo.txid,
      index: utxo.vout,
      ...(taprootAddress && {
        nonWitnessUtxo: utxo.tx.toBuffer(),
      }),
    };

    if (!taprootAddress) {
      // p2wpkh ----> segwit, p2tr ---> taproot, p2sh ----> nested segwit
      const redeemScript = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(publickey!, "hex"),
      }).output;
      const p2sh = bitcoin.payments.p2sh({
        redeem: { output: redeemScript },
      });
      if (wallet !== "unisat") {
        // i.e., xverse, leather, magiceden, fantom, etc.
        input.witnessUtxo = utxo.tx.outs[utxo.vout];
        if (!segwitAddress && (wallet === "xverse" || wallet === "magiceden"))
          input.redeemScript = p2sh.redeem?.output;
      } else {
        // unisat wallet should not have redeemscript for buy tx (for native segwit)
        input.witnessUtxo = utxo.tx.outs[utxo.vout];
      }
    } else {
      // unisat
      input.witnessUtxo = utxo.tx.outs[utxo.vout];
      input.tapInternalKey = toXOnly(
        utxo.tx.toBuffer().constructor(publickey, "hex")
      );
    }


    psbt.addInput(input);
    totalValue += utxo.value;
    paymentUtxoCount += 1;
    const fees = calculateTxBytesFeeWithRate(
      paymentUtxoCount,
      inscriptions.length + 1, // inscription + service fee output
      fee_rate
    );
    if (totalValue >= inscriptions[0].inscription_fee + fees) {
      break;
    }
  }
  const finalFees = calculateTxBytesFeeWithRate(
    paymentUtxoCount,
    inscriptions.length + 1, // inscription + service fee output
    fee_rate
  );
  
  console.log({ totalValue, finalFees });
  // changeValue = totalvalue - inscription_fee + final_fees
  const changeValue =
    totalValue -
    inscriptions[0].value -
    Math.floor(fee_rate < 150 ? finalFees / 1.5 : finalFees / 1.3);
  console.log({ changeValue });
  // We must have enough value to create a dummy utxo and pay for tx fees
  
  if (changeValue < 0) {
    throw new Error(
      `You might have pending transactions or not enough fund to complete tx at the provided FeeRate`
    );
  }

 
    // psbt.addOutput({
    //   address: cardinal_address,
    //   value: inscriptions.value,
    // });


  if (changeValue > DUMMY_UTXO_VALUE) {
    psbt.addOutput({
      address: payment_address,
      value: changeValue,
    });
  }
  console.log("psbt made");
  return psbt.toBase64();
}

export function calculateTxBytesFeeWithRate(
  vinsLength: number,
  voutsLength: number,
  feeRate: number,
  includeChangeOutput: 0 | 1 = 1
): number {
  const baseTxSize = 10;
  const inSize = 180;
  const outSize = 34;
  const txSize =
    baseTxSize +
    vinsLength * inSize +
    voutsLength * outSize +
    includeChangeOutput * outSize;
  const fee = txSize * feeRate;
  console.log(
    `Transaction Size: ${txSize}, Fee Rate: ${feeRate}, Calculated Fee: ${fee}`
  );
  return fee;
}


async function mapUtxos(utxosFromMempool: AddressTxsUtxo[]): Promise<any[]> {
  const ret: any[] = [];
  for (const utxoFromMempool of utxosFromMempool) {
    const txHex = await getTxHexById(utxoFromMempool.txid);
    ret.push({
      txid: utxoFromMempool.txid,
      vout: utxoFromMempool.vout,
      value: utxoFromMempool.value,
      status: utxoFromMempool.status,
      tx: bitcoin.Transaction.fromHex(txHex),
    });
  }
  return ret;
}


// export async function getUtxosByAddress(address: string): Promise<AddressTxsUtxo[]> {
//   const url =
//     process.env.NEXT_PUBLIC_NETWORK === "testnet"
//       ? `https://mempool.space/testnet/api/address/${address}/utxo`
//       : `https://mempool-api.ordinalnovus.com/address/${address}/utxo`;
  
//   const { data } = await axios.get(url);
//   return data;
// }