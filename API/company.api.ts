import axios, { AxiosInstance } from "axios";


export class CompanyApi {
    protected readonly instance: AxiosInstance;
    public constructor(url: string) {
        this.instance = axios.create({
          baseURL: url,
          timeout: 30000,
          timeoutErrorMessage: "Time out!",
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          
        });
    }

    createCompany = async (street:string, avenue:string, house_number:string,user_id:string, city_id:string ) =>{
        try{
            const res = await this.instance
                .post(`/company`,{
                    street,
                    avenue,
                    house_number,
                    user_id,
                    city_id
                })
            
            return res.data;
        }catch(error){
            throw error
        }
    }

    findOneCompany = async (id:string) =>{
        try{
            const res = await this.instance
                .get(`/company/${id}`)

            return res.data
        }catch(error){
            throw error
        }
    }

    updateCompany = async (id:string, street:string, avenue:string, house_number:string,user_id:string, city_id:string) => {
        try{
            const res = await this.instance
                .patch(`/company/${id}`,{
                    street,
                    avenue,
                    house_number,
                    user_id,
                    city_id
                })
            
            return res.data
        }catch(error){
            throw error;
        }
    }

    deleteCompany = async(id:string) =>{
        try{
            const res = await this.instance
                .delete(`/company/${id}`)

            return res.data
        }catch(error){
            throw error;
        }
    }

    findAllCompany = async() => {
        try {
            const res = await this.instance
                .get(`/company`)

            return res.data
        } catch (error) {
            throw error;
        }
    }
}