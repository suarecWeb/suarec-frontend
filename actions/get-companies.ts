/*import axios from 'axios';
import { env } from 'process';

export const getMyProperties= async (token: string, userId: string) => {
    try {
        const response = await axios.get(`${env.NEXT_PUBLIC_API_BASE_URL}/suarec/companies`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        
        });
        
        const properties: Property[] = response.data
        const userProperties = properties.filter(booking => booking.user_id === userId);

        return userProperties
      } catch (error) {
        console.error("Error fetching properties:", error);
        return []
      }
}*/