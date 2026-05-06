// spl_init just have address, no name and symbol, so we use metadata to get such info
import{createSignerFromKeypair, publicKey, signerIdentity} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3, CreateMetadataAccountV3InstructionAccounts , CreateMetadataAccountV3InstructionArgs,DataV2Args} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58"

 const mint = publicKey("3LK2ckHfqs6cgCZRgsU1w9ZxqtvDdMpTf6GXB9RTQQ7S");

 const umi = createUmi("https://api.devnet.solana.com");
 const keypair= umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

 const signer= createSignerFromKeypair(umi, keypair);
 umi.use(signerIdentity(signer));

    (async()=>{
        try{
            const accounts: CreateMetadataAccountV3InstructionAccounts= {
                mint,
                mintAuthority: signer
            }
            const data: DataV2Args = {
            name: "MEOW token",
            symbol: "CAT",
            uri: "https://arweave.net/123456",
            sellerFeeBasisPoints: 1,
            creators: null,
            collection: null,
            uses: null
        }
            const args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: null
        }
            const tx= createMetadataAccountV3(umi, {...accounts, 
                ...args
            })
             const result = await tx.sendAndConfirm(umi);
        console.log("signature: ",bs58.encode(Buffer.from(result.signature)));
        }
        catch(error){
            console.log(error);
        }
     })();

     //signature:  3YbjNwg98Q6WhxbQxoKxY7LYHrB4f68YzAnvZNrw4sPMQHzhXgL3xQY6VwNGbR3RTsoUvpXJpMdP8qkxfKGKow23