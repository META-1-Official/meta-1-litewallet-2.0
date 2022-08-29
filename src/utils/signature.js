import { generateKeyFromPassword } from "../lib/createAccountWithPassword";
const {Login, PrivateKey, Signature} = require("meta1-vision-js");


export function buildSignature(accountName, password) {
    let publicKey, signature;

    try {
        const signerPkey = PrivateKey.fromWif(password);
        publicKey = signerPkey.toPublicKey().toString();
        signature = Signature.sign(accountName, signerPkey).toHex();
    } catch(err) {
        const { privKey: ownerPrivate } = generateKeyFromPassword(
            accountName,
            "owner",
            password
        );
        publicKey = ownerPrivate.toPublicKey().toPublicKeyString();
        const signerPkey = PrivateKey.fromWif(ownerPrivate.toWif());
        signature = Signature.sign(accountName, signerPkey).toHex();
    }

    return { accountName, publicKey, signature };
}
