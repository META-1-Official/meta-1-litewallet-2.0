import { takeEvery, call, put } from 'redux-saga/effects';
import { getCryptosChange, saveBalance, saveUserCurrency } from '../../API/API';
import { getUserError } from '../account/actions';
import { getCryptosChangeError, getCryptosChangeSuccess, saveBalanceError, saveBalanceSuccess, saveUserCurrencyError, saveUserCurrencySuccess } from './actions';
import * as types from './types';


function* getCryptosChangeHandler() {
    const response = yield call(getCryptosChange);
    if (response) {
        yield put(getCryptosChangeSuccess({cryptoData: response}));
    } else {
        yield put(getCryptosChangeError())
    }
}

function* saveBalanceHandler(data) {
    const response = yield call(saveBalance, data.payload);
    if (response.message === 'success') {
        yield put(saveBalanceSuccess());
    } else {
        yield put(saveBalanceError());
    }
}

function* saveUserCurrencyHandler(data) {
    const response = yield call(saveUserCurrency, data.payload.login, data.payload.currency.split(" ")[1]);
     if (response.tokenExpired) {
        yield put(getUserError(response.responseMsg));
    } else {
        if(response.error){
            yield put(saveUserCurrencyError(response.responseMsg));
        }
        yield put(saveUserCurrencySuccess(data.payload.currency));
    }
}

export function* waitForMeta1() {
    yield takeEvery(types.GET_CRYPTOS_CHANGE_REQUEST, getCryptosChangeHandler);
    yield takeEvery(types.SAVE_USER_CURRENCY_REQUEST, saveUserCurrencyHandler);
    yield takeEvery(types.SAVE_BALANCE_REQUEST, saveBalanceHandler);
}
