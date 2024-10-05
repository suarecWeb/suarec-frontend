import Cookies from "js-cookie"

export const getToken = async () => {
    return Cookies.get("token");
}