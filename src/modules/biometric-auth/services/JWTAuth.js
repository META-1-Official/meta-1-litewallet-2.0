export default class JWTAuth {
    payload = {
        name : null,
        iat : null,
        sub : null,
        exp : null,
    };

    expiresIn = 600 // 10 mins

    constructor() {
        this.secret = "VERY_SECRET_TEST_KEY"
    }

    async sign(data, secret) {
        const encoder = new TextEncoder();

        const key = await window.crypto.subtle.importKey('raw', encoder.encode(secret),
            {
                name: 'HMAC',
                hash: {name: 'SHA-256'}
            }, false, ['sign']
        );

        const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, encoder.encode(data));

        return Array.from(new Uint8Array(signatureBuffer))
            .map(b => String.fromCharCode(b))
            .join('');
    }

    base64UrlEncode(str) {
        let base64 = btoa(str);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    async createToken(username) {
        const currentUnixTimestamp = Math.round(new Date().getTime() / 1000)

        // Set payload
        this.payload.name = username
        this.payload.sub = username
        this.payload.iat = currentUnixTimestamp - 100000
        this.payload.exp = currentUnixTimestamp + this.expiresIn

        const header = { alg: "HS256", typ: "JWT" };


        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(this.payload));

        const signature = await this.sign(encodedHeader + "." + encodedPayload, this.secret);
        return encodedHeader + "." + encodedPayload + "." + this.base64UrlEncode(signature);
    }
}
