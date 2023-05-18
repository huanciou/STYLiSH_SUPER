import { SIGN_IN } from "./api.const.js";

const JWT_TOKEN_KEY = "jwtToken";
const USER_NAME_KEY = "userName";
const LOGIN_STATUS = {
  UNKNOWN: "unknown",
  CONNECTED: "connected",
};

function facebookLogin() {
  return new Promise((resolve, reject) => {
    FB.init({
      appId: "211194718133330",
      autoLogAppEvents: true,
      xfbml: true,
      version: "v16.0",
    });
    FB.login(function (response) {
      if (response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject(new Error("User cancelled login or did not fully authorize."));
      }
    });
  });
}

function facebookLogout() {
  return new Promise((resolve, reject) => {
    FB.init({
      appId: "211194718133330",
      autoLogAppEvents: true,
      xfbml: true,
      version: "v16.0",
    });
    FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
        FB.logout(resolve);
      }
    });
  });
}

function getFacebookProfile() {
  return new Promise((resolve) => {
    FB.api("/me", function (response) {
      resolve(response);
    });
  });
}

function stylishSignIn(accessToken) {
  return fetch(SIGN_IN, {
    body: JSON.stringify({
      provider: "facebook",
      access_token: accessToken,
    }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    method: "POST",
  })
    .then((response) => response.json())
    .then((result) => result.data.access_token);
}

function useLogin() {
  const tokenFromStorage = localStorage.getItem(JWT_TOKEN_KEY);
  const [token, _setToken] = React.useState(tokenFromStorage);
  const setToken = (value) => {
    if (value === undefined) {
      localStorage.removeItem(JWT_TOKEN_KEY);
    } else {
      localStorage.setItem(JWT_TOKEN_KEY, value);
    }
    _setToken(value);
  };
  const [userName, _setUserName] = React.useState(
    localStorage.getItem(USER_NAME_KEY)
  );
  const setName = (value) => {
    if (value === undefined) {
      localStorage.removeItem(USER_NAME_KEY);
    } else {
      localStorage.setItem(USER_NAME_KEY, value);
    }
    _setUserName(value);
  };
  const [status, setStatus] = React.useState(
    tokenFromStorage ? LOGIN_STATUS.CONNECTED : LOGIN_STATUS.UNKNOWN
  );
  const login = async () => {
    if (status === LOGIN_STATUS.CONNECTED) return;
    const authResponse = await facebookLogin();
    const token = await stylishSignIn(authResponse.accessToken);
    setToken(token);
    const profile = await getFacebookProfile();
    setName(profile.name);
    setStatus(LOGIN_STATUS.CONNECTED);
    return token;
  };
  const logout = () => {
    if (status === LOGIN_STATUS.UNKNOWN) return;
    facebookLogout();
    setToken();
    setName();
    setStatus(LOGIN_STATUS.UNKNOWN);
  };
  return { status, login, logout, userName, token };
}

export default useLogin;
