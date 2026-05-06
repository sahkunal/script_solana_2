import { appendTransactionMessageInstruction, appendTransactionMessageInstructions, assertIsTransactionMessageWithBlockhashLifetime, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, generateKeyPairSigner, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";

import { getInitializeMintInstruction, getMintSize ,TOKEN_PROGRAM_ADDRESS} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";
import wallet from "../../devnet-wallet.json";
// import { assert } from "node:console";
// import { get } from "node:http";


const rpc= createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions= createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

(async() =>{
    try{
        const signer= await createKeyPairSignerFromBytes(new Uint8Array(wallet)); // to have an address to pay for transactions
        const mint = await generateKeyPairSigner(); // to have an addrress to mint tokens to
        const space = BigInt(getMintSize());
        const rent= await rpc.getMinimumBalanceForRentExemption(space).send(); // to know how much SOL we need to pay for the mint account to be rent exempt
        const {value: latestBlockhash}= await rpc.getLatestBlockhash().send(); // to have a recent blockhash to include in the transaction
        const sendAndConfirm = sendAndConfirmTransactionFactory({
            rpc,
            rpcSubscriptions
        });

        const msg = createTransactionMessage({version:0});
          const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
        const msgWithLiftime= setTransactionMessageLifetimeUsingBlockhash(
            latestBlockhash,
            msgWithPayer
        )
        const txMessage= appendTransactionMessageInstructions(
            [
            getCreateAccountInstruction({
                payer: signer,
                newAccount: mint,
                space,
                lamports: rent,
                programAddress: TOKEN_PROGRAM_ADDRESS
            }),
            getInitializeMintInstruction({
                mint: mint.address,
                decimals: 6,
                mintAuthority: signer.address
            })
            ],
            msgWithLiftime
        )
        const signedTx= await signTransactionMessageWithSigners(txMessage);
        assertIsTransactionWithBlockhashLifetime(signedTx);
        const signature= getSignatureFromTransaction(signedTx);

        await sendAndConfirm(signedTx, {commitment: "confirmed"}); // to send the transaction and wait for confirmation, use when the transaction is confirmed, if want more speed then use finalized, but it may not be included in the blockchain yet, so use with caution

    console.log(`mint address: ${mint.address}. Transaction Signature: ${signature}`);
    }
    catch(error){
        console.log(error);
    }
})();

//mint address: 3LK2ckHfqs6cgCZRgsU1w9ZxqtvDdMpTf6GXB9RTQQ7S. Transaction Signature: 52kWJVVxNGhryGdbUp66tazeaYuHh17ZBix2XCXnuAtUumfbAB75jAnTu28TQLWscpFVpmXmMCRPMTJ1TBveQUMf