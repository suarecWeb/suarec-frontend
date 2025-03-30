import Cookies from 'js-cookie';

export const logOut = async () => {
    Cookies.remove("email");
    Cookies.remove("role");
    Cookies.remove("token");
};