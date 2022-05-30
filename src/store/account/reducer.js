import { getAccessToken, getLoginDetail } from '../../utils/localstorage';
import * as types from './types';

const initialState = {
    isLogin: false,
    loading: false,
    account: null,
    token: '',
    loginError: false,
    msg: null
};
const loginDetail = getLoginDetail();
if(loginDetail){
    initialState.isLogin = true;
    initialState.account = loginDetail;
    initialState.token = getAccessToken();
}

const accountsReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN_REQUEST:
            return {...state, loading: true, loginError:false };
        case types.LOGIN_SUCCESS:
            return {...state, loading: false, account: action.payload.accountName, token: action.payload.token, isLogin:true,loginError:false,msg:null };
        case types.LOGIN_ERROR:
            return {...state, loading: false, account: null, token: '', isLogin:false, loginError:true };
        default:
            return state;
    }
}
export default accountsReducer;