import {address, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners} from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import { findAssociatedTokenPda, getCreateAssociatedTokenInstructionAsync, getTransferCheckedInstruction, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";


const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions= createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

const mint= address("3LK2ckHfqs6cgCZRgsU1w9ZxqtvDdMpTf6GXB9RTQQ7S");
const to = address("6pau4tCkkS58iu9pwytRrpAEPbm4egs7jiAJJhKQN5yH");

(async() =>{
    try{
        const signer= await createKeyPairSignerFromBytes(new Uint8Array(wallet)); // to have an address to pay for transactions
        const sendAndConfirm = sendAndConfirmTransactionFactory({
                            rpc,
                            rpcSubscriptions
                        });
        const [fromAta] = await findAssociatedTokenPda({
            mint,
            owner: signer.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS
            });
        console.log(`fromAta is : ${fromAta}`);

        const [toAta] = await findAssociatedTokenPda({
        mint,
        owner: to,
        tokenProgram: TOKEN_PROGRAM_ADDRESS
    });
    console.log(`toAta is : ${toAta}`);

    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
            payer: signer,
            mint,
            owner: to,  
        });
        const transferIx = getTransferCheckedInstruction({
            source: fromAta,
            mint,
            destination: toAta,
            authority: signer,
            amount: 1_000_000n, // to transfer 1 token, we need to multiply the amount by 1 million to have 6 decimals
            decimals: 6
        });

        const msg = createTransactionMessage({version:0});
        
            const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
               const {value: latestBlockhash}= await rpc.getLatestBlockhash().send(); // to have a recent blockhash to include in the transaction
            const msgWithLiftime= setTransactionMessageLifetimeUsingBlockhash(
                    latestBlockhash,
                    msgWithPayer
                )
                const txMessage= appendTransactionMessageInstructions(
                    [createAtaIx,transferIx],
                    msgWithLiftime
                )
                const signedTx= await signTransactionMessageWithSigners(txMessage);
         assertIsTransactionWithBlockhashLifetime(signedTx);
                const signature= getSignatureFromTransaction(signedTx);
                await sendAndConfirm(signedTx, {commitment: "confirmed"});     
        
                console.log(`Transferred 1 token to ${toAta}. Transaction Signature: ${signature}`);}
    
    catch(error){
        console.log(error);
    }
        })();

        //fromAta is : GpWca4MJvnFGKJx6bkqXaVcfm43xLAi3t9FHQkVgaB7U toAta is : CijeSEJL8JKPzG7TjBDCpuMsUQt92kNcUsENf2ijoMvz Transferred 1 token to CijeSEJL8JKPzG7TjBDCpuMsUQt92kNcUsENf2ijoMvz. Transaction Signature:3B3uwFEwUAF2gEwZZ2U6Hsqz6DmzsFbzpshz29f1CpcJsJsmMUcuCZyeYm69JsKZUhaiGEKN2oLyooTB2Gtj1FFk