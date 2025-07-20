import api from "./axios_config";

const baseURL = "/suarec/roles";

const getRoles = () => {
  return api.get(baseURL);
};

const RolesService = {
  getRoles,
};

export default RolesService;
