export const getAccessToken = () => {
    return localStorage.getItem('accessToken') || '';
}
export const setAccessToken = (val) => {
    localStorage.setItem('accessToken', val);
}
export const removeAccessToken = () => {
    localStorage.removeItem('accessToken');
}
export const getLocation = () => {
    return sessionStorage.getItem('location') || '';
}
export const setLocation = (val) => {
    sessionStorage.setItem('location', val);
}
export const removeLocation = () => {
    sessionStorage.removeItem('location');
}
export const tokenFail = () => {
    removeAccessToken();
    removeLocation();
  }