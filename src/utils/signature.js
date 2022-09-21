import Meta1 from "meta1-vision-dex";
import { generateKeyFromPassword } from "../lib/createAccountWithPassword";
const { Login, PrivateKey, Signature } = require("meta1-vision-js");


export async function buildSignature(accountName, password, isForMigration = false) {
    let publicKey, signature;

    if (isForMigration) {
        const signerPkey = PrivateKey.fromWif(password);
        publicKey = signerPkey.toPublicKey().toString();
        signature = Signature.sign(accountName, signerPkey).toHex();
        return { accountName, publicKey, signature };
    }

    // Connect & Login
    await Meta1.connect(process.env.REACT_APP_MAIA);
    const loginResult = await Meta1.login(accountName, password);

    if (loginResult) {
        try {
            const signerPkey = PrivateKey.fromWif(password);
            publicKey = signerPkey.toPublicKey().toString();
            signature = Signature.sign(accountName, signerPkey).toHex();
        } catch (err) {
            const account = await Login.generateKeys(accountName, password, ['owner'], 'DEV11');
            const ownerPrivateKey = account.privKeys.owner.toWif();
            publicKey = account.pubKeys.owner;
            const signerPkey = PrivateKey.fromWif(ownerPrivateKey);
            signature = Signature.sign(accountName, signerPkey).toHex();
        }
    }

    return { accountName, publicKey, signature };
}
