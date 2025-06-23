import axios from 'axios';

export const createUser = async (name: string, password: string, email: string, cv_url: string,
    cellphone: string, genre: string, born_at: Date, role: string) => {
    console.log("Sending Register with: ", email, password);

    console.log("creating user...");

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/suarec/users`, {
            name: name,
            password: password,
            email: email,
            cv_url: cv_url,
            genre: genre,
            cellphone: cellphone,
            born_at: born_at,
            role: role
        }
        );

        return response;
    } catch (error) {
        throw error;
    }
};
