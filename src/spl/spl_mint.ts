// mint to create a new mint and mint some tokens to an account
import { address, createSolanaRpc, createSolanaRpcSubscriptions,createKeyPairSignerFromBytes, createTransactionMessage, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, signTransactionMessageWithSigners, getSignatureFromTransaction, sendAndConfirmTransactionFactory } from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import { findAssociatedTokenPda, getCreateAssociatedTokenInstructionAsync, TOKEN_PROGRAM_ADDRESS, getMintToInstruction } from "@solana-program/token";
import { create } from "node:domain";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions= createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

const token_decimals = 1_000_000n; // to have 6 decimals, we need to multiply the amount by 1 million, mint has 6 decimals by default, so we need to multiply the amount by 1 million to have 6 decimals

const mint= address("3LK2ckHfqs6cgCZRgsU1w9ZxqtvDdMpTf6GXB9RTQQ7S");

(async() =>{
    try{const signer= await createKeyPairSignerFromBytes(new Uint8Array(wallet)); // to have an address to pay for transactions
    const [ata] = await findAssociatedTokenPda({
        mint,
        owner: signer.address,
        tokenProgram: TOKEN_PROGRAM_ADDRESS
    });
    console.log(`Associated Token Account: ${ata}`);

    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
        payer: signer,
        mint,
        owner: signer.address,  
    });
    const mintToIx= getMintToInstruction({
        mint,
        token: ata,
        mintAuthority: signer,
        amount: 1n * token_decimals // to mint 1 token, we need to multiply the amount by 1 million to have 6 decimals
    });

      const {value: latestBlockhash}= await rpc.getLatestBlockhash().send(); // to have a recent blockhash to include in the transaction
 const msg = createTransactionMessage({version:0});

    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
    const msgWithLiftime= setTransactionMessageLifetimeUsingBlockhash(
            latestBlockhash,
            msgWithPayer
        )
        const txMessage= appendTransactionMessageInstructions(
            [createAtaIx,mintToIx],
            msgWithLiftime
        )
        const signedTx= await signTransactionMessageWithSigners(txMessage);
 assertIsTransactionWithBlockhashLifetime(signedTx);
        const signature= getSignatureFromTransaction(signedTx);
        const sendAndConfirm = sendAndConfirmTransactionFactory({
                    rpc,
                    rpcSubscriptions
                });
        await sendAndConfirm(signedTx, {commitment: "confirmed"});     

        console.log(`Minted 1 token to ${ata}. Transaction Signature: ${signature}`);}
    catch(error){
        console.log(error);
    }
        })();

//Associated Token Account: GpWca4MJvnFGKJx6bkqXaVcfm43xLAi3t9FHQkVgaB7UMinted .1 token to GpWca4MJvnFGKJx6bkqXaVcfm43xLAi3t9FHQkVgaB7U. Transaction Signature: 5sNgYzmuXvzPegnhmgPhyuiSU757yN7JYVedKwzihHkwB826wV8x7t1cZgNHpZYVoZMXsQZ6qYEh5t16dv4Mznie