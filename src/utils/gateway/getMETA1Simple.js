import account_constants from '../chain/account_constants'
export const getMETA1Simple = () => {
    return [
        {
            name: 'BTC',
            description: 'Bitcoin',
            backingCoin: 'BTC',
            symbol: 'BTC',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 8,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.2',
            walletType: 'btc',
            minAmount: 100000,
            withdrawFee: 50000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '0.0005',
            type: 'coin',
        },
        {
            name: 'LTC',
            description: 'Litecoin',
            backingCoin: 'LTC',
            symbol: 'LTC',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 8,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.4',
            walletType: 'ltc',
            minAmount: 200000,
            withdrawFee: 100000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '0.0001',
            type: 'coin',
        },
        {
            name: 'ETH',
            description: 'ETH',
            backingCoin: 'ETH',
            symbol: 'ETH',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 7,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.3',
            walletType: 'eth',
            minAmount: 200000,
            withdrawFee: 100000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '0.01',
            type: 'coin',
        },
        {
            name: 'USDT',
            description: 'Tether USD',
            backingCoin: 'USDT',
            symbol: 'USDT',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 6,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.1',
            walletType: 'eth',
            minAmount: 50000000,
            withdrawFee: 35000000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '35',
            type: 'token',
        },
        {
            name: 'XLM',
            description: 'XLM',
            backingCoin: 'XLM',
            symbol: 'XLM',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 6,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.6',
            walletType: 'xlm',
            minAmount: 200000,
            withdrawFee: 100000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '0.01',
            type: 'token',
        },
        {
            name: 'BNB',
            description: 'BNB',
            backingCoin: 'BNB',
            symbol: 'BNB',
            depositAllowed: true,
            withdrawalAllowed: true,
            memoSupport: false,
            precision: 8,
            issuer: account_constants.issuer_name,
            issuerId: account_constants.issuer_name,
            issuerToId: account_constants.issuer_id,
            assetId: '1.3.7',
            walletType: 'bnb',
            minAmount: 200000,
            withdrawFee: 100000,
            depositFee: 0,
            coinPriora: 0,
            gateFee: '0.01',
            type: 'token',
        },
    ];
}
