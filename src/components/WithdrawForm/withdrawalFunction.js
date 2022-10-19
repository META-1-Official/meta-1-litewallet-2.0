import AccountUtils from "../../utils/account_utils";
import { Axios } from "axios";
import { assetsObj } from "../../utils/common";
import { Asset } from "../../utils/MarketClasses";
import Immutable from "immutable";
import { Aes, ChainStore, FetchChain, PrivateKey, TransactionBuilder, TransactionHelper } from "meta1-vision-js";
import { ChainConfig } from 'meta1-vision-ws';
import Meta1 from "meta1-vision-dex";

const broadcast = (transaction, resolve, reject, isSuccess) => {
    let broadcast_timeout = setTimeout(() => {
        return {
            broadcast: false,
            broadcasting: false,
            error: "Your transaction has expired without being confirmed, please try again later.",
            closed: false,
        };
        if (reject) reject();
    }, ChainConfig.expire_in_secs * 2000);

    transaction
        .broadcast(() => {
            return { broadcasting: false, broadcast: true };
        })
        .then((res) => {
            clearTimeout(broadcast_timeout);
            isSuccess(true, 'ok');
            return {
                error: null,
                broadcasting: false,
                broadcast: true,
                included: true,
                trx_id: res[0].id,
                trx_block_num: res[0].block_num,
                trx_in_block: res[0].trx_num,
                broadcasted_transaction: true,
            };
            if (resolve) resolve();
        })
        .catch((error) => {
            if (error && error?.message && error.message.includes('missing required active authority: Missing Active Authority')) {
                isSuccess(false, 'fail', true);
            } else {
                isSuccess(false, 'fail');
            }
            clearTimeout(broadcast_timeout);
            // messages of length 1 are local exceptions (use the 1st line)
            // longer messages are remote API exceptions (use the 1st line)
            let splitError = error.message.split('\n');
            let message = splitError[0];
            
            return {
                broadcast: false,
                broadcasting: false,
                error: message,
                closed: false,
            };
            if (reject) reject();
        });
}
const confirmTransaction = (transaction, resolve, reject, isSuccess) => {
    broadcast(transaction, resolve, reject, isSuccess)
    return { transaction, resolve, reject };
}
const getPubkeys_having_PrivateKey = (pubkeys, addys = null) => {
    let return_pubkeys = [];
    if (pubkeys) {
        for (let pubkey of pubkeys) {
            return_pubkeys.push(pubkey);
        }
    }
    return return_pubkeys;
}
const process_transaction = (tr, accountNameState, password, isSuccess, signer_pubkeys, broadcast, extra_keys = [],) => {
    return Promise.all([
        tr.set_required_fees(),
        tr.update_head_block(),
    ]).then(() => {
        let signer_pubkeys_added = {};

        return tr
            .get_potential_signatures()
            .then(({ pubkeys, addys }) => {
                let my_pubkeys = getPubkeys_having_PrivateKey(
                    pubkeys.concat(extra_keys),
                    addys
                );
                return tr
                    .get_required_signatures(my_pubkeys)
                    .then((required_pubkeys) => {
                        let signed = false;
                        for (let pubkey_string of required_pubkeys) {
                            if (signer_pubkeys_added[pubkey_string]) continue;
                            let private_key = getPrivateKey(pubkey_string, accountNameState, password);
                            if (private_key) {
                                tr.add_signer(private_key, pubkey_string);
                                signed = true;
                            }
                        }
                    });
            })
            .then(() => {
                if (broadcast) {
                    if (true) {
                        let p = new Promise((resolve, reject) => {
                            confirmTransaction(tr, resolve, reject,isSuccess);
                        });
                        return p.then(async (result) => {
                            return result
                        });
                    } else return tr.broadcast();
                } else return tr.serialize();
            });
    })
    .catch(e => {
        isSuccess(false,'fail')
    });
}

/** @return ecc/PrivateKey or null */
const getPrivateKey = (public_key, accountNameState, password) => {
    const data = generateKeyFromPassword(accountNameState, 'memo', password, public_key)
    return data.privKey;
}
const generateKeyFromPassword = (accountName, role = "memo", password, public_key) => {
    let seed = accountName + role + password;
    let privKey = PrivateKey.fromSeed(seed);
    let pubKey = privKey.toPublicKey().toString();
    if (pubKey === public_key) {
        return { privKey, pubKey };
    } else {
        seed = accountName + "active" + password;
        privKey = PrivateKey.fromSeed(seed);
        pubKey = privKey.toPublicKey().toString();

        if (pubKey === public_key) {
            return { privKey, pubKey };
        } else {
            seed = accountName + "owner" + password;
            privKey = PrivateKey.fromSeed(seed);
            pubKey = privKey.toPublicKey().toString();
            if (pubKey === public_key) {
                return { privKey, pubKey };
            }
        }
    }
    return { privKey, pubKey };
}

const _get_memo_keys = (account, with_private_keys = true, accountNameState, password) => {
    let memo = {
        public_key: null,
        private_key: null,
    };
    memo.public_key = account.getIn(['options', 'memo_key']);
    if (/111111111111111111111/.test(memo.public_key)) {
        memo.public_key = null;
    }
    if (with_private_keys) {
        memo.private_key = getPrivateKey(memo.public_key, accountNameState, password);
    }
    return memo;
}

const promiseUnlockChange = () => {
    return true;
}

const promiseUnlock = () => {
    return new Promise((resolve, reject) => {
        return { resolve, reject };
    })
        .then((was_unlocked) => {
            if (was_unlocked) promiseUnlockChange();
        })
        .catch((params) => {
            throw params;
        });
}
const create_transfer_op = async ({
    // OBJECT: { ... }
    from_account,
    to_account,
    amount,
    asset,
    memo,
    propose_account = null, // should be called memo_sender, but is not for compatibility reasons with transfer. Is set to "from_account" for non proposals
    encrypt_memo = true,
    optional_nonce = null,
    fee_asset_id = '1.3.0',
    transactionBuilder = null,
    accountNameState,
    password,
    isSuccess
}) => {
    let memo_sender_account = propose_account || from_account;
    return Promise.all([
        FetchChain('getAccount', from_account),
        FetchChain('getAccount', to_account),
        FetchChain('getAccount', memo_sender_account),
    ])
        .then(res => {
            const assetDataObj = assetsObj.find(data => data.id === asset);
            const assetFeeDataObj = assetsObj.find(data => data.id === fee_asset_id);
            const assetArr = [];
            for (let data in assetDataObj) {
                assetArr.push([`${data}`, assetDataObj[data]])
            }

            const assetFeeArr = [];
            for (let data in assetFeeDataObj) {
                assetFeeArr.push([`${data}`, assetFeeDataObj[data]])
            }
            // working
            let chain_asset = Immutable.Map([...assetArr])
            let chain_fee_asset = Immutable.Map([...assetFeeArr])
            let [chain_from, chain_to, chain_memo_sender] = res;

            let chain_propose_account = null;
            if (propose_account) {
                chain_propose_account = chain_memo_sender;
            }

            let memo_object;
            if (memo) {
                let memo_sender = _get_memo_keys(
                    chain_memo_sender,
                    encrypt_memo,
                    accountNameState,
                    password
                );
                let memo_to = _get_memo_keys(chain_to, false, accountNameState, password);
                if (!!memo_sender.public_key && !!memo_to.public_key) {
                    let nonce =
                        optional_nonce == null
                            ? TransactionHelper.unique_nonce_uint64()
                            : optional_nonce;
                    memo_object = {
                        from: memo_sender.public_key,
                        to: memo_to.public_key,
                        nonce,
                        message: encrypt_memo
                            ? Aes.encrypt_with_checksum(
                                memo_sender.private_key,
                                memo_to.public_key,
                                nonce,
                                memo
                            )
                            : Buffer.isBuffer(memo)
                                ? memo.toString('utf-8')
                                : memo,
                    };
                }
            }

            // Allow user to choose asset with which to pay fees #356
            let fee_asset = chain_fee_asset.toJS();

            let tr = null;
            if (transactionBuilder == null) {
                tr = new TransactionBuilder();
            } else {
                tr = transactionBuilder;
            }
            let transfer_op = tr.get_type_operation('transfer', {
                fee: {
                    amount: 0,
                    asset_id: fee_asset_id,
                },
                from: chain_from.get('id'),
                to: chain_to.get('id'),
                amount: { amount, asset_id: chain_asset.get('id') },
                memo: memo_object,
            });
            return {
                transfer_op,
                chain_from,
                chain_to,
                chain_propose_account,
                chain_memo_sender,
                chain_asset,
                chain_fee_asset,
            };
        })
        .catch(err => {
            isSuccess(false, 'fail')
        })
}

const ApplicationApiTransfer = ({
    from_account,
    to_account,
    amount,
    asset,
    memo,
    broadcast = true,
    encrypt_memo = true,
    optional_nonce = null,
    propose_account = null,
    fee_asset_id = '1.3.0',
    transactionBuilder = null,
    accountNameState,
    password,
    isSuccess
}) => {
    if (transactionBuilder == null) {
        transactionBuilder = new TransactionBuilder();
        create_transfer_op({
            from_account,
            to_account,
            amount,
            asset,
            memo,
            propose_account,
            encrypt_memo,
            optional_nonce,
            fee_asset_id,
            transactionBuilder,
            accountNameState,
            password,
            isSuccess
        }).then(transfer_obj => {
            return transactionBuilder
                .update_head_block()
                .then(() => {
                    if (propose_account) {
                        transactionBuilder.add_type_operation('proposal_create', {
                            proposed_ops: [{ op: transfer_obj.transfer_op }],
                            fee_paying_account: transfer_obj.chain_propose_account.get('id'),
                        });
                    } else {
                        transactionBuilder.add_operation(transfer_obj.transfer_op);
                    }
                    return process_transaction(
                        transactionBuilder,
                        accountNameState,
                        password,
                        isSuccess,
                        null, //signer_private_keys,
                        broadcast,
                    );
                })
                .catch((err) => {
                    isSuccess(false,'fail');
                });

        })
    }

}

export const transferHandler = (from_account, to_account, amount, asset, memo, propose_account = null, fee_asset_id = '1.3.0', accountNameState, password, isSuccess) => {
    fee_asset_id = AccountUtils.getFinalFeeAsset(
        propose_account || from_account,
        'transfer',
        fee_asset_id
    );
    ApplicationApiTransfer({
        from_account,
        to_account,
        amount,
        asset,
        memo,
        propose_account,
        fee_asset_id,
        accountNameState,
        password,
        isSuccess
    })
}
