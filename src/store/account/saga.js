import { takeEvery, call, put } from 'redux-saga/effects';
import { loginRequest } from '../../API/API';
import { setAccessToken, setLoginDetail } from '../../utils/localstorage';
import { loginError, loginSuccess } from './actions';
import * as types from './types';
function* loginHandler(data) {
    try {
        const response = yield call(loginRequest,data.payload.login,data.payload.password)
        if(!response.error){
            setAccessToken(response.token);
            setLoginDetail(response.accountName)
            yield put(loginSuccess({accountName: response.accountName, token: response.token}));
        } else {
            yield put(loginError({accountName: null, token: ''}));
        }
    } catch(e){
        data.payload.setLoginDataError(true);
        yield put(loginError({accountName: null, token: ''}));
    }
}
export function* waitForAccount() {
    yield takeEvery(types.LOGIN_REQUEST, loginHandler);
}