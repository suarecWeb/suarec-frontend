import axios from 'axios';
export const signIn = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suarec/auth/login`, {
        email: email, 
        password: password
    }
    );

    return response;
  } catch (error) {
    throw error;
  }
};
