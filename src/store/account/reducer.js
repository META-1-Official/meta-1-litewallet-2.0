import { getAccessToken } from '../../utils/localstorage';
import * as types from './types';
import logoNavbar from "../../images/default-pic2.png";
import logoDefault from "../../images/default-pic1.png";
import { Avatar } from '@mui/material';
const initialState = {
    isLogin: false,
    loading: false,
    account: null,
    token: '',
    loginError: false,
    msg: null,
    user: null,
    isTokenValid: true,
    profileImage: logoDefault,
    navbarProfileImage: logoNavbar,
    sentMailSuccess: null,
    oldUser: false,
    checkTransferableModel: false,
    signatureError: false,
    isSignatureValid: false,
    isValidPasswordKey: false,
    passwordKeyError: false,
    loginErrorMsg: '',
    openOrderCustomColumns: {
        "Buy/sell": true,
        "From / To": true,
        "Price": true, 
        "Market Price": true,
        "Orders Date": true,
        "Expiry Date": true,
    },
    passwordRequestFlag: false,
    fromSignUp: false,
    uploadImageError: false,
};
const loginDetail = getAccessToken();
if(loginDetail){
    initialState.isLogin = true;
    initialState.account = "antman-kok357";
    initialState.token = loginDetail;
}

const accountsReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN_REQUEST:
            return {...state, loading: true, loginError: false, loginErrorMsg: '' };
        case types.LOGIN_SUCCESS:
            return {...initialState, loading: false, account: action.payload.accountName, token: action.payload.token, isLogin:true,loginError: false, msg: null, fromSignUp: action.payload.fromSignUp };
        case types.LOGIN_ERROR:
            return {...state, loading: false, account: null, token: '', isLogin:false, loginError:true, loginErrorMsg: action.payload.msg  };
        case types.LOGOUT_REQUEST:
            return {...initialState, isLogin: false, account: null, token:'', loginErrorMsg: '' };
        case types.GET_USER_REQUEST:
            return {...state, loading: true, user: null, isTokenValid: true, msg: null };
        case types.GET_USER_SUCCESS:
            const avatarImage = action.payload.avatarImage
            return {...state, loading: false, user: action.payload.user, profileImage:avatarImage ? avatarImage : logoDefault, navbarProfileImage: avatarImage ? avatarImage : logoNavbar };
        case types.GET_USER_ERROR:
            return {...state, loading: false, user: null, isTokenValid: false, msg: action.payload.msg, profileImage: logoDefault, navbarProfileImage: logoNavbar };
        case types.UPLOAD_AVATAR_REQUEST:
            return {...state, loading: true };
        case types.UPLOAD_AVATAR_SUCCESS:
            return {...state, loading: false, profileImage: action.payload.avatarImage, navbarProfileImage: action.payload.avatarImage, uploadImageError: false };
        case types.UPLOAD_AVATAR_FAILED:
            return {...state, loading: false, uploadImageError: true };
        case types.UPLOAD_AVATAR_RESET:
            return {...state, uploadImageError: false };
        case types.DELETE_AVATAR_REQUEST:
            return {...state, loading: true };
        case types.DELETE_AVATAR_SUCCESS:
            return {...state, loading: false, profileImage: logoDefault, navbarProfileImage: logoNavbar };
        case types.DELETE_AVATAR_FAILED:
            return {...state, loading: false, uploadImageError: true};
        case types.SEND_MAIL_REQUEST:
            return {...state, sentMailSuccess: null };
        case types.SEND_MAIL_SUCCESS:
                return {...state, sentMailSuccess: true };
        case types.SEND_MAIL_ERROR:
            return {...state, sentMailSuccess: false };
        case types.SEND_MAIL_RESET:
            return {...state, loading: false, sentMailSuccess: null };
        case types.CHECK_TRANSFERABLE_WALLET_MODAL:
            return { ...state, loading: false, checkTransferableModel: action.payload };
        case types.CHECK_TRANSFERABLE_REQUEST:
            return {...state, loading: true };
        case types.CHECK_TRANSFERABLE_SUCCESS:
            return {...state, loading: false, oldUser: action.payload.oldUser };
        case types.CHECK_TRANSFERABLE_ERROR:
            return {...state, loading: false, oldUser: false };
        case types.CHECK_ACCOUNT_SIGNATURE_REQUEST:
            return {...state, loading: false, signatureError: false };
        case types.CHECK_ACCOUNT_SIGNATURE_SUCCESS:
            return {...state, loading: false, signatureError: false, isSignatureValid: true };
        case types.CHECK_ACCOUNT_SIGNATURE_ERROR:
            return {...state, loading: false, signatureError: true, isSignatureValid: false };
        case types.CHECK_ACCOUNT_SIGNATURE_RESET:
            return {...state, loading: false, signatureError: false, isSignatureValid: false };
        case types.CHECK_TOKEN_REQUEST:
            return state;
        case types.PASS_KEY_REQUEST:
            return {...state, isValidPasswordKey: false, passwordKeyError: false };
        case types.PASS_KEY_SUCCESS:
            return {...state, isValidPasswordKey: true, passwordKeyError: false, passwordRequestFlag: !state.passwordRequestFlag };
        case types.PASS_KEY_ERROR:
            return {...state, isValidPasswordKey: false , passwordKeyError: true, passwordRequestFlag: !state.passwordRequestFlag };
        case types.PASS_KEY_RESET:
            return {...state, isValidPasswordKey: false, passwordKeyError: false };
        case types.CUSTOMIZED_COLUMNS_OPEN_ORDER:
            return {...state, openOrderCustomColumns: {...state.openOrderCustomColumns, [action.payload.key]: action.payload.value}};
        default:
            return state;
    }
}
export default accountsReducer;
