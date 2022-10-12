import { DynamicLocalStorage } from '../localStorageStore';
import {availableGateways} from '../gateways';
import {ChainStore, FetchChain} from 'meta1-vision-js';
import swal from 'sweetalert';
const blockTradesStorage = new DynamicLocalStorage('');
let oidcStorage = new DynamicLocalStorage(
	'oidc.user:https://blocktrades.us/:10ecf048-b982-467b-9965-0b0926330869'
);
let fetchInProgess = {};
let fetchCache = {};
let clearIntervals = {};
const fetchCacheTTL = 30000;
function setCacheClearTimer(key) {
	clearIntervals[key] = setTimeout(() => {
		delete fetchCache[key];
		delete clearIntervals[key];
	}, fetchCacheTTL);
}

export function fetchCoins(url) {
	const key = 'fetchCoins_' + url;
	let currentPromise = fetchInProgess[key];
	if (fetchCache[key]) {
		return Promise.resolve(fetchCache[key]);
	} else if (!currentPromise) {
		fetchInProgess[key] = currentPromise = fetch(url)
			.then((reply) =>
				reply.json().then((result) => {
					// throw new Error("Test");
					return result;
				})
			)
			.catch((err) => {
				console.log(`fetchCoins error from ${url}: ${err}`);
				throw err;
			});
	}
	return new Promise((res, rej) => {
		currentPromise
			.then((result) => {
				fetchCache[key] = result;
				res(result);
				delete fetchInProgess[key];
				if (!clearIntervals[key]) setCacheClearTimer(key);
			})
			.catch(rej);
	});
}

export function fetchCoinsSimple(url) {
	console.log("fetchCoinsSimple url",url)
	return fetch(url)
		.then((reply) =>
			reply.json().then((result) => {
				console.log("fetchCoinsSimple result",result)
				return result;
			})
		)
		.catch((err) => {
			console.log(`fetchCoinsSimple error from ${url}: ${err}`);
			throw err;
		});
}

export function fetchTradingPairs(url) {
	const key = 'fetchTradingPairs_' + url;
	let currentPromise = fetchInProgess[key];
	if (fetchCache[key]) {
		return Promise.resolve(fetchCache[key]);
	} else if (!currentPromise) {
		fetchInProgess[key] = currentPromise = fetch(url, {
			method: 'get',
			headers: new Headers({Accept: 'application/json'}),
		})
			.then((reply) =>
				reply.json().then((result) => {
					return result;
				})
			)
			.catch((err) => {
				console.log(`fetchTradingPairs error from ${url}: ${err}`);
				throw err;
			});
	}
	return new Promise((res, rej) => {
		currentPromise
			.then((result) => {
				fetchCache[key] = result;
				res(result);
				delete fetchInProgess[key];
				if (!clearIntervals[key]) setCacheClearTimer(key);
			})
			.catch(rej);
	});
}

export function getDepositLimit(inputCoin, outputCoin, url) {
	return fetch(
		url +
			'?inputCoinType=' +
			encodeURIComponent(inputCoin) +
			'&outputCoinType=' +
			encodeURIComponent(outputCoin),
		{method: 'get', headers: new Headers({Accept: 'application/json'})}
	)
		.then((reply) =>
			reply.json().then((result) => {
				return result;
			})
		)
		.catch((err) => {
			console.log(
				'error fetching deposit limit of',
				inputCoin,
				outputCoin,
				err
			);
		});
}

export function estimateOutput(inputAmount, inputCoin, outputCoin, url) {
	return fetch(
		url +
			'?inputAmount=' +
			encodeURIComponent(inputAmount) +
			'&inputCoinType=' +
			encodeURIComponent(inputCoin) +
			'&outputCoinType=' +
			encodeURIComponent(outputCoin),
		{method: 'get', headers: new Headers({Accept: 'application/json'})}
	)
		.then((reply) =>
			reply.json().then((result) => {
				return result;
			})
		)
		.catch((err) => {
			console.log(
				'error fetching deposit limit of',
				inputCoin,
				outputCoin,
				err
			);
		});
}

export function estimateInput(outputAmount, inputCoin, outputCoin, url) {
	return fetch(
		url +
			'?outputAmount=' +
			encodeURIComponent(outputAmount) +
			'&inputCoinType=' +
			encodeURIComponent(inputCoin) +
			'&outputCoinType=' +
			encodeURIComponent(outputCoin),
		{
			method: 'get',
			headers: new Headers({Accept: 'application/json'}),
		}
	)
		.then((reply) =>
			reply.json().then((result) => {
				return result;
			})
		)
		.catch((err) => {
			console.log(
				'error fetching deposit limit of',
				inputCoin,
				outputCoin,
				err
			);
		});
}

export function getActiveWallets(url) {
	const key = 'getActiveWallets_' + url;
	let currentPromise = fetchInProgess[key];

	if (fetchCache[key]) {
		return Promise.resolve(fetchCache[key]);
	} else if (!currentPromise) {
		fetchInProgess[key] = currentPromise = fetch(url)
			.then((reply) =>
				reply.json().then((result) => {
					return result;
				})
			)
			.catch((err) => {
				console.log('error fetching blocktrades active wallets', err, url);
			});
	}

	return new Promise((res) => {
		currentPromise.then((result) => {
			fetchCache[key] = result;
			res(result);
			delete fetchInProgess[key];
			if (!clearIntervals[key]) setCacheClearTimer(key);
		});
	});
}

function getMeta1DepositAddressJSGateway(symbol, currentAccount) {
	if (symbol === 'usdt') {
		symbol = 'eth';
	}
	return new Promise((resolve, reject) => {
		fetch(
			`${process.env.GATEWAY_META1_JS_URL}/api-gateways/` + symbol.toLowerCase()
		)
			.then((response) => {
				fetch(
					`${process.env.GATEWAY_META1_JS_URL}/api/wallet/init/` +
						symbol.toLowerCase(),
					{
						method: 'POST',
						headers: {
							Accept: 'application/json, text/plain, */*',
							'Content-Type': 'application/json',
							'X-Requested-With': 'XMLHttpRequest',
						},
						body: JSON.stringify({
							metaId: currentAccount,
						}),
					}
				)
					.then((res) => res.json())
					.then((response) => {
						let address = response.address;
						resolve(address);
					})
					.catch((err) => reject(err));
			})
			.catch((err) => reject(err));
	});
}

function getMeta1DepositAddressPyGateway(symbol, currentAccount) {
	return new Promise((resolve, reject) => {
		fetch(
			`${process.env.GATEWAY_META1_PY_URL}/gateway?uia=` +
				symbol.toUpperCase() +
				'&client_id=' +
				currentAccount,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
				},
				body: JSON.stringify({
					metaId: currentAccount,
				}),
			}
		)
			.then((res) => res.json())
			.then((response) => {
				let address = response.address;
				resolve(address);
			})
			.catch((err) => console.log(err));
	}).catch((err) => console.log(err));
}

let depositRequests = {};
export function requestDepositAddress({
	inputCoinType,
	outputCoinType,
	outputAddress,
	url,
	stateCallback,
	selectedGateway,
}) {
	let gatewayStatus = availableGateways[selectedGateway];
	inputCoinType =
		!!gatewayStatus && !!gatewayStatus.assetWithdrawlAlias
			? gatewayStatus.assetWithdrawlAlias[inputCoinType.toLowerCase()] ||
			  inputCoinType.toLowerCase()
			: inputCoinType;

	let body = {
		inputCoinType,
		outputCoinType,
		outputAddress,
	};

	let body_string = JSON.stringify(body);
	if (depositRequests[body_string]) return;
	depositRequests[body_string] = true;

	if (selectedGateway === 'META1') {
		if (true || inputCoinType == 'eth' || inputCoinType == 'usdt') {
			getMeta1DepositAddressJSGateway(inputCoinType)
				.then((response) => {
					delete depositRequests[body_string];
					let address = {
						address: response,
						memo: null,
						error: null,
					};
					if (stateCallback) stateCallback(address);
				})
				.catch((err) => {
					console.log('error: ', err);
					delete depositRequests[body_string];
					if (stateCallback) stateCallback(null);
				});
			return;
		}
	}
	fetch(url + '/simple-api/initiate-trade', {
		method: 'post',
		headers: new Headers({
			Accept: 'application/json',
			'Content-Type': 'application/json',
		}),
		body: body_string,
	})
		.then(
			(reply) => {
				reply.json().then(
					(json) => {
						delete depositRequests[body_string];
						// console.log( "reply: ", json );
						let address = {
							address: json.inputAddress || 'unknown',
							memo: json.inputMemo,
							error: json.error || null,
						};
						if (stateCallback) stateCallback(address);
					},
					(error) => {
						console.log('error: ', error);
						delete depositRequests[body_string];
						if (stateCallback) stateCallback(null);
					}
				);
			},
			(error) => {
				console.log('error: ', error);
				delete depositRequests[body_string];
				if (stateCallback) stateCallback(null);
			}
		)
		.catch((err) => {
			console.log('fetch error:', err);
			delete depositRequests[body_string];
		});
}

export function getMappingData(inputCoinType, outputCoinType, outputAddress) {
	let body = JSON.stringify({
		inputCoinType,
		outputCoinType,
		outputAddress: {
			address: outputAddress,
		},
	});
	let mapping = inputCoinType + outputCoinType + outputAddress;
	if (blockTradesStorage.has(`history_mapping_${mapping}`)) {
		return Promise.resolve(
			blockTradesStorage.get(`history_mapping_${mapping}`)
		);
	} else {
		return new Promise((resolve, reject) => {
			let headers = {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${oidcStorage.get('')['access_token']}`,
			};
            const blockTradesAPIs= null;
			fetch(`${blockTradesAPIs.BASE}/mappings`, {
				method: 'post',
				headers: headers,
				body: body,
			})
				.then((reply) => {
					reply.json().then((result) => {
						if (result['inputAddress']) {
							blockTradesStorage.set(
								`history_mapping_${mapping}`,
								result['inputAddress']
							);
							resolve(result && result['inputAddress']);
						} else {
							reject();
						}
					});
				})
				.catch((error) => {
					console.log('Error: ', error);
					reject();
				});
		});
	}
}

export function getBackedCoins({allCoins, tradingPairs, backer}) {
	let gatewayStatus = availableGateways[backer];
	let coins_by_type = {};

	// Backer has no coinType == backingCoinType but uses single wallet style
	if (!!gatewayStatus.singleWallet) {
		allCoins.forEach(
			(coin_type) => (coins_by_type[coin_type.backingCoinType] = coin_type)
		);
	}

	allCoins.forEach(
		(coin_type) => (coins_by_type[coin_type.coinType] = coin_type)
	);

	let allowed_outputs_by_input = {};
	tradingPairs.forEach((pair) => {
		if (!allowed_outputs_by_input[pair.inputCoinType])
			allowed_outputs_by_input[pair.inputCoinType] = {};
		allowed_outputs_by_input[pair.inputCoinType][pair.outputCoinType] = true;
	});

	let backedCoins = [];
	allCoins.forEach((inputCoin) => {
		let outputCoin = coins_by_type[inputCoin.backingCoinType];
		if (
			inputCoin.walletSymbol.startsWith(backer + '.') &&
			inputCoin.backingCoinType &&
			outputCoin
		) {
			let isDepositAllowed =
				allowed_outputs_by_input[inputCoin.backingCoinType] &&
				allowed_outputs_by_input[inputCoin.backingCoinType][inputCoin.coinType];
			let isWithdrawalAllowed =
				allowed_outputs_by_input[inputCoin.coinType] &&
				allowed_outputs_by_input[inputCoin.coinType][inputCoin.backingCoinType];

			backedCoins.push({
				name: outputCoin.name,
				intermediateAccount: !!gatewayStatus.intermediateAccount
					? gatewayStatus.intermediateAccount
					: outputCoin.intermediateAccount,
				gateFee: outputCoin.gateFee || outputCoin.transactionFee,
				walletType: outputCoin.walletType,
				backingCoinType: !!gatewayStatus.singleWallet
					? inputCoin.backingCoinType.toUpperCase()
					: outputCoin.walletSymbol,
				minAmount: outputCoin.minAmount || 0,
				maxAmount: outputCoin.maxAmount || 999999999,
				symbol: inputCoin.walletSymbol,
				supportsMemos: outputCoin.supportsOutputMemos,
				depositAllowed: isDepositAllowed,
				withdrawalAllowed: isWithdrawalAllowed,
			});
		}
	});
	return backedCoins;
}

export function validateAddress({
	url,
	walletType,
	newAddress,
	output_coin_type = null,
	method = null,
}) {
	if (!newAddress) return new Promise((res) => res());

	if (!method || method == 'GET') {
		url +=
			'/wallets/' +
			walletType +
			'/address-validator?address=' +
			encodeURIComponent(newAddress);
		if (output_coin_type) {
			url += '&outputCoinType=' + output_coin_type;
		}
		return fetch(url, {
			method: 'get',
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json',
			}),
		})
			.then((reply) => reply.json().then((json) => json))
			.catch((err) => {
				console.log('validate error:', err);
			});
	} else if (method == 'POST') {
		url = 'https://apis.xbts.io/api/v1';
		return fetch(url + '/wallets/' + walletType + '/check-address', {
			method: 'post',
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({address: newAddress}),
		})
			.then((reply) => reply.json().then((json) => json))
			.catch((err) => {
				console.log('validate error:', err);
			});
	}
}

let _conversionCache = {};
export function getConversionJson(inputs, userAccessToken = null) {
	const {input_coin_type, output_coin_type, url, account_name} = inputs;
	if (!input_coin_type || !output_coin_type) return Promise.reject();
	const body = JSON.stringify({
		inputCoinType: input_coin_type,
		outputCoinType: output_coin_type,
		outputAddress: account_name,
		inputMemo:
			'blocktrades conversion: ' + input_coin_type + 'to' + output_coin_type,
	});

	const _cacheString = url + input_coin_type + output_coin_type + account_name;
	return new Promise((resolve, reject) => {
		if (_conversionCache[_cacheString])
			return resolve(_conversionCache[_cacheString]);
		let headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		if (userAccessToken) {
			headers = {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${userAccessToken}`,
			};
		}
		fetch(url + '/simple-api/initiate-trade', {
			method: 'post',
			headers,
			body: body,
		})
			.then((reply) => {
				reply
					.json()
					.then((json) => {
						_conversionCache[_cacheString] = json;
						resolve(json);
					}, reject)
					.catch(reject);
			})
			.catch(reject);
	});
}

function hasWithdrawalAddress(wallet) {
	return blockTradesStorage.has(`history_address_${wallet}`);
}

function setWithdrawalAddresses({wallet, addresses}) {
	blockTradesStorage.set(`history_address_${wallet}`, addresses);
}

function getWithdrawalAddresses(wallet) {
	return blockTradesStorage.get(`history_address_${wallet}`, []);
}

function setLastWithdrawalAddress({wallet, address}) {
	blockTradesStorage.set(`history_address_last_${wallet}`, address);
}

function getLastWithdrawalAddress(wallet) {
	return blockTradesStorage.get(`history_address_last_${wallet}`, '');
}

export const WithdrawAddresses = {
	has: hasWithdrawalAddress,
	set: setWithdrawalAddresses,
	get: getWithdrawalAddresses,
	setLast: setLastWithdrawalAddress,
	getLast: getLastWithdrawalAddress,
};

export function nudgeWithdrawal(asset_id, block, trx, op, currentAccount) {
	let block_number = block;
	let trx_in_block = trx;
	let op_in_trx = op;

	FetchChain('getAsset', asset_id).then((asset) => {
		let url = '';
		if (asset.get('symbol') === 'USDT')
			url = `${process.env.GATEWAY_META1_JS_URL}/usdt`;
		else
			url =
				`${process.env.GATEWAY_META1_JS_URL}/api/withdraw/` +
				asset.get('symbol');
		let payload = {
			account: {
				metaId: ChainStore.getAccount(
					currentAccount
				).get('id'),
			},
			block_number: block_number,
			trx_in_block: trx_in_block,
			op_in_trx: op_in_trx,
		};
		fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
			},
			body: JSON.stringify(payload),
		})
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				if (data.txid === undefined)
					swal(
						data.error || 'Error validating withdrawal!',
						'If you have not received this withdrawal yet please contact support!',
						'error',
						{
							customClass: 'swal-modal',
						}
					);
				else
					swal('Success!', 'TxID: ' + data.txid, 'success', {
						customClass: 'swal-modal',
					});
			})
			.catch((error) => {
				swal('Oops!', error.toString(), 'error', {
					customClass: 'swal-modal',
				});
			});
	});
}
