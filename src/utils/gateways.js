/**
 * Settings storage for all Gateway Services
 * General API Settings are stored in api/apiConfig and should be imported here
 */

 import {xbtsxAPIs} from '../API/apiConfig';
 import {allowedGateway} from './branding';
 import {isGatewayTemporarilyDisabled} from './onChainConfig';
//  import SettingsStore from 'stores/SettingsStore';
 
 const _isEnabled = (gatewayKey) => {
     return async function (options = {}) {
        let __DEV__ = "dev11"
         if (__DEV__) {
             console.log('Checking ' + gatewayKey + ' gateway ...');
         }
         if (!options.onlyOnChainConfig) {
             // is the gateway configured in branding?
             const setInBranding = allowedGateway(gatewayKey);
             if (!setInBranding) {
                 if (__DEV__) {
                     console.log('  ... disabled in branding.js');
                 }
                 return false;
             } else {
                 if (!!options.onlyBranding) {
                     if (__DEV__) {
                         console.log('  ... may be used!');
                     }
                     return true;
                 }
             }
         }
         // is it deactivated on-chain?
         const temporarilyDisabled = await isGatewayTemporarilyDisabled(gatewayKey);
         if (temporarilyDisabled) {
             if (__DEV__) {
                 console.log('  ... disabled on-chain');
             }
             return false;
         } else {
             if (!!options.onlyOnChainConfig) {
                 if (__DEV__) {
                     console.log('  ... may be used!');
                 }
                 return true;
             }
         }
         // has the user filtered it out?
        //  let filteredServiceProviders = SettingsStore.getState().settings.get(
        //      'filteredServiceProviders',
        //      []
        //  );
        const filteredServiceProviders = null;
         if (!filteredServiceProviders) {
             filteredServiceProviders = [];
         }
         let userAllowed = false;
         if (
             filteredServiceProviders.length == 1 &&
             filteredServiceProviders[0] == 'all'
         ) {
             userAllowed = true;
         } else {
             userAllowed = filteredServiceProviders.indexOf(gatewayKey) >= 0;
         }
         if (!userAllowed) {
             if (__DEV__) {
                 console.log('  ... disabled by user');
             }
             return false;
         }
         if (__DEV__) {
             console.log('  ... may be used!');
         }
         return true;
     };
 };
 
 export const availableGateways = {
     META1: {
         id: 'META1',
         name: 'META1',
         baseAPI: xbtsxAPIs,
         isEnabled: _isEnabled('META1'),
         isSimple: true,
         selected: false,
         addressValidatorMethod: 'POST',
         options: {
             enabled: false,
             selected: false,
         },
         landing: process.env.GATEWAY_LANDING_URL,
         wallet: process.env.GATEWAY_WALLET_URL,
     },
 };
 
 export const availableBridges = {};
 
 export const gatewayPrefixes = Object.keys(availableGateways);
 
 export function getPossibleGatewayPrefixes(bases) {
     return gatewayPrefixes.reduce((assets, prefix) => {
         bases.forEach((a) => {
             assets.push(`${prefix}.${a}`);
         });
         return assets;
     }, []);
 }
 
 export default availableGateways;
 