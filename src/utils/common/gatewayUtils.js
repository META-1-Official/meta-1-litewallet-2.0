import {
	availableGateways,
	gatewayPrefixes,
} from '../gateways';

export function getGatewayName(asset) {
	if (asset.get('issuer') === '1.2.0') {
		return "Native";
	}

	let prefix =
		asset.get('symbol') === 'PPY' ? 'RUDEX' : asset.get('symbol').split('.')[0];

	let assetName =
		asset.get('symbol') === 'PPY' ? 'RUDEX.PPY' : asset.get('symbol');

	if (hasGatewayPrefix(assetName)) {
		return availableGateways[prefix].name;
	}
	return null;
}

export function hasGatewayPrefix(name) {
	let prefix = '';
	if (
		name === 'BTC' ||
		name === 'LTC' ||
		name === 'ETH' ||
		name === 'EOS' ||
		name === 'XLM' ||
		name === 'BNB' ||
		name === 'USDT'
	) {
		prefix = 'META1';
	} else {
		prefix = name.split('.')[0];
	}

	if (gatewayPrefixes.indexOf(prefix) !== -1) {
		return true;
	}
	return false;
}

export function getGatewayStatusByAsset(
	selectedAsset,
	boolCheck = 'depositAllowed'
) {
	let {gatewayStatus} = this.state;
	for (let g in gatewayStatus) {
		gatewayStatus[g].options.enabled = false;

		if (!gatewayStatus[g].enabled) continue;
		this.props.backedCoins.get(g.toUpperCase(), []).find((coin) => {
			let backingCoin = coin.backingCoinType || coin.backingCoin;
			let isAvailable =
				typeof coin.isAvailable == 'undefined' ||
				(typeof coin.isAvailable == 'boolean' && coin.isAvailable);

			// Gateway has EOS.* asset names
			if (backingCoin.toUpperCase().indexOf('EOS.') !== -1) {
				let [_coin] = backingCoin.split('.');
				backingCoin = _coin;
			}

			if (coin[boolCheck] && isAvailable && selectedAsset === backingCoin) {
				gatewayStatus[g].options.enabled = true;
			}
		});
	}
	return gatewayStatus;
}

export function getIntermediateAccount(symbol, backedCoins) {
	let {selectedGateway} = getAssetAndGateway(symbol);
	let coin = getBackedCoin(symbol, backedCoins);
	if (!coin) return undefined;
	else if (selectedGateway === 'META1') return coin.issuerId || coin.issuer;
	else return coin.intermediateAccount || coin.issuer;
}

export function getBackedCoin(symbol, backedCoins) {
	let {selectedGateway} = getAssetAndGateway(symbol);
	return (
		backedCoins.get(selectedGateway, []).find((c) => {
			return c.symbol.toUpperCase() === symbol.toUpperCase();
		}) || {}
	);
}

export function getAssetAndGateway(symbol) {
	if (symbol) {
		let [selectedGateway, selectedAsset] = symbol.split('.');
		if (
			symbol === 'BTC' ||
			symbol === 'LTC' ||
			symbol === 'ETH' ||
			symbol === 'EOS' ||
			symbol === 'XLM' ||
			symbol === 'BNB' ||
			symbol === 'USDT'
		) {
			selectedGateway = 'META1';
			selectedAsset = symbol;
		}
		if (!selectedAsset) {
			selectedAsset = selectedGateway;
			selectedGateway = undefined;
		}
		return {selectedGateway, selectedAsset};
	}
}