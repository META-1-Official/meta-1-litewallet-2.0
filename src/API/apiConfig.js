import {getFaucet} from '../utils/branding';

export const xbtsxAPIs = {
	BASE: `${process.env.REACT_APP_GATEWAY_META1_JS_URL}/api-gateways`,
	COINS_LIST: '/coin',
};

export const nodeRegions = [
	// region of the node follows roughly https://en.wikipedia.org/wiki/Subregion#/media/File:United_Nations_geographical_subregions.png
	'Northern Europe',
	'Western Europe',
	'Southern Europe',
	'Eastern Europe',
	'Northern Asia',
	'Western Asia',
	'Southern Asia',
	'Eastern Asia',
	'Central Asia',
	'Southeastern Asia',
	'Australia',
	'New Zealand',
	'Melanesia',
	'Polynesia',
	'Micronesia',
	'Northern Africa',
	'Western Africa',
	'Middle Africa',
	'Eastern Africa',
	'Southern Africa',
	'Northern America',
	'Central America',
	'Caribbean',
	'South America',
];

export const settingsAPIs = {
	// If you want a location to be translated, add the translation to settings in locale-xx.js
	// and use an object {translate: key} in WS_NODE_LIST
	DEFAULT_WS_NODE: process.env.REACT_APP_MAIA,
	WS_NODE_LIST: [
		{
			url: process.env.REACT_APP_MAIA,
			region: 'MAIA',
			country: 'Maia',
			location: 'Western Europe',
			operator: 'Witness: meta1',
		},
		{
			url: process.env.REACT_APP_DEFAULT_WS_API,
			region: 'API',
			country: 'Api',
			location: 'Northern America',
			operator: 'Witness: meta1',
		},
	],
	ES_WRAPPER_LIST: [
		{
			url: 'https://pleione.meta-exchange.info',
			region: 'Western Europe',
			country: 'Germany',
			operator: 'Infrastructure Worker',
			contact: process.env.DEFAULT_CONTACT_EMAIL,
		},
	],
	DEFAULT_FAUCET: getFaucet().url,
	TESTNET_FAUCET: getFaucet().url,
};
