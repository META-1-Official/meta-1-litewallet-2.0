import {Apis} from 'meta1-vision-ws';
import chainIds from './chainIds';

const CHAINID_SHORT = chainIds[process.env.REACT_APP_CURRENT_NET].substr(0, 8);

/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Determine if we are running on testnet or mainnet
 * @private
 */
function _isTestnet() {
	const chainId = (Apis.instance().chain_id || '04e96f5d').substr(0, 8);

	if (chainId === CHAINID_SHORT) {
		return false;
	} else {
		// treat every other chain as testnet, exact would be chainId === "39f5e2ed"
		return true;
	}
}

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
	return 'META Exchange';
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
	return process.env.REACT_APP_DEFAULT_WALLET_URL;
	// return "https://meta-exchange.io";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
	return {
		url: process.env.REACT_APP_FAUCET,
		// url: "https://faucet.meta1.io/faucet",
		show: true,
		editable: true,
		referrer: undefined,
	};
}

export function getTestFaucet() {
	// fixme should be solved by introducing _isTestnet into getFaucet and fixing the mess in the Settings when fetching faucet address
	return {
		url: '',
		show: true,
		editable: false,
	};
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
// export function getLogo() {
// 	return require('assets/logo-ico-blue.png');
// }

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
// export function getBankingAssetsLogo() {
// 	return require('assets/backing-assets/backingAssetsLogo.png');
// }

/**
 * get any Image that is used throughout the UI
 * @returns {*}
 */
// export function getGoldImage() {
// 	return require('assets/backing-assets/gold.png');
// }
/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
	// possible ["darkTheme", "lightTheme", "midnightTheme"]
	return 'darkTheme';
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
	// possible: one of "password", "wallet"
	return 'password';
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits() {
	if (_isTestnet()) {
		return ['META1'];
	} else {
		return ['META1', 'USDT', 'ETH', 'BTC', 'LTC', 'EOS', 'XLM', 'BNB'];
	}
}

export function getDefaultMarket() {
	if (_isTestnet()) {
		return 'USDT_META1';
	}
	return 'USDT_META1';
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */
export function getMyMarketsBases() {
	if (_isTestnet()) {
		return ['TEST'];
	}

	return ['META1', 'BTC', 'ETH', 'USDT', 'LTC', 'EOS', 'XLM', 'BNB'];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes() {
	if (_isTestnet()) {
		return ['TEST'];
	}
	let tokens = {
		nativeTokens: ['BTC', 'META1', 'USDT', 'EOS', 'XLM', 'BNB'],
	};

	let allTokens = [];
	for (let type in tokens) {
		allTokens = allTokens.concat(tokens[type]);
	}
	return allTokens;
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
	if (_isTestnet()) {
		return [['USD', 'TEST']];
	}
	return [
		['USDT', 'META1'],
		['USDT', 'BTC'],
		['USDT', 'ETH'],
		['USDT', 'LTC'],
	].filter((a) => {
		if (!quotes.length) return true;
		return quotes.indexOf(a[0]) !== -1;
	});
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
	if (_isTestnet()) {
		return [];
	}
	return [];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for BitAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
	// e..g "OPEN.", "bit"
	return [];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
	const allowedGateways = ['META1'];
	if (!gateway) {
		// answers the question: are any allowed?           
		return allowedGateways.length > 0;
	}
	return allowedGateways.indexOf(gateway) >= 0;
}

export function getSupportedLanguages() {
	// not yet supported
}

export function getAllowedLogins() {
	// possible: list containing any combination of ["password", "wallet"]
	return ['password', 'wallet'];
}

export function getConfigurationAsset() {
	let assetSymbol = null;
	if (_isTestnet()) {
		assetSymbol = 'NOTIFICATIONS';
	} else {
		assetSymbol = 'META1';
	}
	// explanation will be parsed out of the asset description (via split)
	return {
		symbol: assetSymbol,
		explanation:
			'This asset is used for decentralized configuration of the Meta1 UI placed under bitshares.org.',
	};
}

export function getSteemNewsTag() {
	return null;
}
