import {
  ChainValidation,
  FetchChain,
  PrivateKey,
  TransactionBuilder,
} from "meta1-vision-js";

export function generateKeyFromPassword(accountName, role, password) {
  let seed = accountName + role + password;
  let privKey = PrivateKey.fromSeed(seed);
  let pubKey = privKey.toPublicKey().toString();

  return { privKey, pubKey };
}

function createAccFunc(
  owner_pubkey,
  active_pubkey,
  memo_pubkey,
  new_account_name,
  referrer_percent
) {
  ChainValidation.required("meta1register", "registrar_id");
  ChainValidation.required("meta1register", "referrer_id");

  return new Promise((resolve, reject) => {
    return Promise.all([
      FetchChain("getAccount", "meta1register"),
      FetchChain("getAccount", "meta1register"),
    ]).then((res) => {
      let [chain_registrar, chain_referrer] = res;
      let tr = new TransactionBuilder();
      tr.add_type_operation("account_create", {
        fee: {
          amount: 0,
          asset_id: 0,
        },
        registrar: chain_registrar.get("id"),
        referrer: chain_referrer.get("id"),
        referrer_percent: referrer_percent,
        name: new_account_name,
        owner: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [[owner_pubkey, 1]],
          address_auths: [],
        },
        active: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [[active_pubkey, 1]],
          address_auths: [],
        },
        options: {
          memo_key: memo_pubkey,
          voting_account: "1.2.5",
          num_witness: 0,
          num_committee: 0,
          votes: [],
        },
      });
    });
  });
}

export default function createAccountWithPassword(
  account_name,
  password,
  registrar,
  referrer,
  referrer_percent,
  refcode,
  phoneNumber,
  email,
  lastName,
  firstName
) {
  let { privKey: owner_private } = generateKeyFromPassword(
    account_name,
    "owner",
    password
  );
  let { privKey: active_private } = generateKeyFromPassword(
    account_name,
    "active",
    password
  );
  let { privKey: memo_private } = generateKeyFromPassword(
    account_name,
    "memo",
    password
  );

  return new Promise((resolve, reject) => {
    let create_account = () => {
      return createAccFunc(
        owner_private.toPublicKey().toPublicKeyString(),
        active_private.toPublicKey().toPublicKeyString(),
        memo_private.toPublicKey().toPublicKeyString(),
        account_name,
        registrar, //registrar_id,
        referrer, //referrer_id,
        referrer_percent, //referrer_percent,
        true //broadcast
      )
        .then(resolve)
        .catch(reject);
    };

    if (registrar) {
      // using another user's account as registrar
      return create_account();
    } else {
      // using faucet

      let create_account_promise = fetch(process.env.REACT_APP_FAUCET + "/api/v1/accounts", {
        method: "post",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          account: {
            name: account_name,
            email: email,
            last_name: lastName,
            refcode: "",
            first_name: firstName,
            phone_number: phoneNumber,
            owner_key:
              `${process.env.REACT_APP_KEY_PREFIX}` +
              owner_private.toPublicKey().toPublicKeyString().substring(5),
            active_key:
              `${process.env.REACT_APP_KEY_PREFIX}` +
              active_private.toPublicKey().toPublicKeyString().substring(5),
            memo_key:
              `${process.env.REACT_APP_KEY_PREFIX}` +
              memo_private.toPublicKey().toPublicKeyString().substring(5),
          },
        }),
      })
        .then((r) =>
          r.json().then((res) => {
            if (!res || (res && res.error)) {
              resolve(res);
            } else {
              resolve(res);
            }
          })
        )
        .catch(reject);

      return create_account_promise
        .then((result) => {
          if (result && result.error) {
            reject(result.error);
          } else {
            resolve(result);
          }
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}
