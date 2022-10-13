module.exports = {
	account_listing: {
		no_listing: 0x0, ///< No opinion is specified about this account
		white_listed: 0x1, ///< This account is whitelisted, but not blacklisted
		black_listed: 0x2, ///< This account is blacklisted, but not whitelisted
		white_and_black_listed: 0x1 | 0x2, ///< This account is both whitelisted and blacklisted
	},
	issuer_name: 'meta1cold',
	issuer_id: '1.2.32', // DEV: 1.2.32 | PROD: 1.2.21
};
