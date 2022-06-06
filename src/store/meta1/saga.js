import { takeEvery, call, put } from 'redux-saga/effects';
import { getCryptosChange } from '../../API/API';
import { getCryptosChangeError, getCryptosChangeSuccess, meta1ConnectError, meta1ConnectSuccess } from './actions';
import * as types from './types';

function* getCryptosChangeHandler() {
    const response = yield call(getCryptosChange);
    console.log("response saga",response);
    if (response) {
        yield put(getCryptosChangeSuccess({cryptoData: response}));
    } else {
        yield put(getCryptosChangeError())
    }
}
export function* waitForMeta1() {
    yield takeEvery(types.GET_CRYPTOS_CHANGE_REQUEST, getCryptosChangeHandler);
}
