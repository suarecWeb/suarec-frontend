import Cookies from 'js-cookie';

export const logOut = async () => {
    Cookies.remove("currentUser");
    Cookies.remove("token");
};