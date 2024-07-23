import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { Tap, Script, Address, Signer, Tx } from "@cmdcode/tapscript";
// @ts-ignore
import * as cryptoUtils from "@cmdcode/crypto-utils";
import { UserAccount } from "@/modals";
import dbConnect from "@/lib/dbconnect";

// Handle POST request
export async function POST(req: NextRequest) {
  console.log("**********CREATE USER ACCOUNT CALLED*********")
  try {
      const walletDetails = await req.json();
      console.log({walletDetails})
    const { ordinal_address, ordinal_pubkey, cardinal_address, cardinal_pubkey, wallet } = walletDetails;
    console.log('RECEIVED ORDINAL_ADDRESS', ordinal_address);

    const { userAddress, seckey, leaf, tapkey, privkey } = await generateUserWallet(ordinal_address, "testnet");

   await dbConnect()
    const newUserAccount = new UserAccount({
      ordinal_address,
      ordinal_pubkey,
      userAddress,
      privkey,
      leaf,
      tapkey,
    });

    const savedUserAccount = await newUserAccount.save();
    console.log('User account saved successfully:', savedUserAccount);

    return NextResponse.json({
      success: true,
      address: userAddress,
      leaf,
      tapkey,
    });
  } catch (error) {
    console.error("Error generating wallet:", error);
    return NextResponse.json({ success: false, message: "Failed to generate wallet" });
  }
}

// Convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

// Generate a valid private key
async function generatePrivateKey(): Promise<string> {
  let isValid = false;
  let privkey: string | undefined;

  while (!isValid) {
    privkey = bytesToHex(cryptoUtils.Noble.utils.randomPrivateKey());
    const seckey = new cryptoUtils.KeyPair(privkey);
    const pubkey = seckey.pub.rawX;
    const initScript = [pubkey, "OP_CHECKSIG"];
    const initLeaf = await Tap.tree.getLeaf(Script.encode(initScript));
    const [initTapkey, initCblock] = await Tap.getPubKey(pubkey, { target: initLeaf });

    const testRedeemTx = Tx.create({
      vin: [
        {
          txid: "a99d1112bcb35845fd44e703ef2c611f0360dd2bb28927625dbc13eab58cd968",
          vout: 0,
          prevout: {
            value: 10000,
            scriptPubKey: ["OP_1", initTapkey],
          },
        },
      ],
      vout: [
        {
          value: 8000,
          scriptPubKey: ["OP_1", initTapkey],
        },
      ],
    });

    const testSig = await Signer.taproot.sign(seckey.raw, testRedeemTx, 0, { extension: initLeaf });
    testRedeemTx.vin[0].witness = [testSig.hex, initScript, initCblock];
    isValid = await Signer.taproot.verify(testRedeemTx, 0, { pubkey });

    if (!isValid) {
      console.log("Invalid key generated, retrying...");
    } else {
      console.log("Valid private key generated:", privkey);
    }
  }

  if (!privkey) {
    throw new Error("Failed to generate a valid private key");
  }

  return privkey;
}

// Generate a user wallet address
async function generateUserWallet(
  ordinalAddress: string,
  network: "testnet" | "mainnet"
): Promise<{ userAddress: string; seckey: cryptoUtils.KeyPair; leaf: any; tapkey: any; privkey: string }> {
  const ec = new TextEncoder();
  const privkey = await generatePrivateKey();
  const seckey = new cryptoUtils.KeyPair(privkey);
  const pubkey = seckey.pub.rawX;

  const script = [
    pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    ec.encode("ordinalnovus"),
    "01",
    ec.encode(ordinalAddress),
    "OP_ENDIF",
  ];

  const leaf = await Tap.tree.getLeaf(Script.encode(script));
  const [tapkey] = await Tap.getPubKey(pubkey, { target: leaf });

  const userAddress = Address.p2tr.encode(tapkey, network);

  // Debug information
  console.debug("seckey:", seckey);
  console.debug("leaf:", leaf);
  console.debug("Tapkey:", tapkey);
  console.debug("User Address:", userAddress);

  return { userAddress, seckey, leaf, tapkey, privkey };
}
