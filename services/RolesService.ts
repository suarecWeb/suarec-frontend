import api from "./axios_config";

const baseURL = "/roles";

const getRoles = () => {
  return api.get(baseURL);
};


const RolesService = {
    getRoles
};

export default RolesService;
