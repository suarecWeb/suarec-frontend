import axios from 'axios';

export const getUsers = async (token: string) => {
    try {
        console.log("getting users...");

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suarec/users`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        
        });

        console.log("got users: " + response.data);

        return response.data;
      } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return []
      }
}