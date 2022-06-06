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
