import Meta1 from "meta1-vision-dex";
const { Login, PrivateKey, Signature } = require("meta1-vision-js");

export async function buildSignature(accountName, password, is4Migration=false) {
    let publicKey, signature;

    // Migration
    if (is4Migration) {
        try {
            const signerPkey = PrivateKey.fromWif(password);
            publicKey = signerPkey.toPublicKey().toString();
            signature = Signature.sign(accountName, signerPkey).toHex();
        } catch (err) {
            const account = await Login.generateKeys(
                accountName,
                password,
                ['owner'],
                process.env.REACT_APP_KEY_PREFIX
            );
            const ownerPrivateKey = account.privKeys.owner.toWif();
            publicKey = account.pubKeys.owner;
            const signerPkey = PrivateKey.fromWif(ownerPrivateKey);
            signature = Signature.sign(accountName, signerPkey).toHex();
        }

        return { accountName, publicKey, signature, is4Migration };
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
            const account = await Login.generateKeys(
                accountName,
                password,
                ['owner'],
                process.env.REACT_APP_KEY_PREFIX
            );
            const ownerPrivateKey = account.privKeys.owner.toWif();
            publicKey = account.pubKeys.owner;
            const signerPkey = PrivateKey.fromWif(ownerPrivateKey);
            signature = Signature.sign(accountName, signerPkey).toHex();
        }
    }

    return { accountName, publicKey, signature, is4Migration };
}
