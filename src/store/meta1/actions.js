import * as types from './types';
export const getCryptosChangeRequest = () => {
    return {
        type: types.GET_CRYPTOS_CHANGE_REQUEST
    }
}

export const getCryptosChangeSuccess = (payload) => {
    return {
        type: types.GET_CRYPTOS_CHANGE_SUCCESS,
        payload
    }
}

export const getCryptosChangeError = () => {
    return {
        type: types.GET_CRYPTOS_CHANGE_ERROR
    }
}

export const meta1ConnectSuccess = (payload) => {
    return {
        type: types.META1_CONNECT_SUCCESS,
        payload
    }
}

export const setUserCurrencyAction = (payload) => {
    return {
        type: types.SET_USER_CURRENCY,
        payload
    }
}

export const saveUserCurrencyRequest = (payload) => {
    return {
        type: types.SAVE_USER_CURRENCY_REQUEST,
        payload
    }
}

export const saveUserCurrencySuccess = (payload) => {
    return {
        type: types.SAVE_USER_CURRENCY_SUCCESS,
        payload
    }
}

export const saveUserCurrencyError = (payload) => {
    return {
        type: types.SAVE_USER_CURRENCY_ERROR,
        payload
    }
}

export const saveUserCurrencyReset = () => {
    return {
        type: types.SAVE_USER_CURRENCY_RESET
    }
}

export const resetMetaStore  = () => {
    return {
        type: types.RESET_META_STORE
    }   
}

export const saveBalanceRequest = (payload) => {
    return {
        type: types.SAVE_BALANCE_REQUEST,
        payload
    }  
}

export const saveBalanceSuccess = () => {
    return {
        type: types.SAVE_BALANCE_SUCCESS
    }  
}
export const saveBalanceError = () => {
    return {
        type: types.SAVE_BALANCE_ERROR
    }  
}
