import {
  ChainValidation,
  FetchChain,
  PrivateKey,
  TransactionBuilder,
} from "meta1-vision-js";
import { sleepHandler } from "../utils/common";

export function generateKeyFromPassword(accountName, role, password) {
  let seed = accountName + role + password;
  let privKey = PrivateKey.fromSeed(seed);
  let pubKey = privKey.toPublicKey().toString();

  return { privKey, pubKey };
}

async function createAccFunc(
  owner_pubkey,
  active_pubkey,
  memo_pubkey,
  new_account_name,
  referrer_percent
) {
  ChainValidation.required("meta1register", "registrar_id");
  ChainValidation.required("meta1register", "referrer_id");

  const meta1register = await FetchChain("getAccount", "meta1register");
  const chain_registrar = meta1register;
  const chain_referrer = meta1register;

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
}

export default async function createAccountWithPassword(
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
  return await createAccount(
    account_name,
    password,
    registrar,
    referrer,
    referrer_percent,
    refcode,
    phoneNumber,
    email,
    lastName,
    firstName,
    1
  );
}

const createAccount = async (
  account_name,
  password,
  registrar,
  referrer,
  referrer_percent,
  refcode,
  phoneNumber,
  email,
  lastName,
  firstName,
  count
) => {
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

    let create_account = async () => {
      try {
        await createAccFunc(
          owner_private.toPublicKey().toPublicKeyString(),
          active_private.toPublicKey().toPublicKeyString(),
          memo_private.toPublicKey().toPublicKeyString(),
          account_name,
          registrar, //registrar_id,
          referrer, //referrer_id,
          referrer_percent, //referrer_percent,
          true //broadcast
        )
        return;
      } catch(err) {
        console.error('[create_account]', err);
        return;
      }
    };

    if (registrar) {
      // using another user's account as registrar
      return create_account();
    } else {
      // using faucet
      count++;
      try {
        console.log("[createAccount] Calling faucet...");
        const faucet_res = await fetch(process.env.REACT_APP_FAUCET + "/api/v1/accounts", {
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
        });
        const res = await faucet_res.json();
        console.log('[createAccount] faucet response:', faucet_res.status, res);
        if (faucet_res.status === 500 || !res || (res && res.error)) {
          await sleepHandler(3000);
            if (count > 5) {
              return res.error;
            } else {
              return await createAccount(
                account_name,
                password,
                registrar,
                referrer,
                referrer_percent,
                refcode,
                phoneNumber,
                email,
                lastName,
                firstName,
                count
              )
            }
        } else {
          return res;
        }
      } catch (err) {
        await sleepHandler(3000);
          if (count > 5) {
            return err;
          } else {
            return await createAccount(
              account_name,
              password,
              registrar,
              referrer,
              referrer_percent,
              refcode,
              phoneNumber,
              email,
              lastName,
              firstName,
              count
            )
          }
      }
    }
}
