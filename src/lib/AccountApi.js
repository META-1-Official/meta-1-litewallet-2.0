import { Apis } from 'meta1-vision-ws'

class Api {
    lookupAccounts(startChar, limit) {
        // direct query, circumventing subscription system of ChainStore
        return Apis.instance()
            .db_api()
            .exec('lookup_accounts', [startChar, limit])
    }
    lookupAccountByPublicKey(pubKey) {
        // direct query, circumventing subscription system of ChainStore
        return Apis.instance()
            .db_api()
            .exec('get_key_references', [[pubKey]])
    }
}

export default new Api()
