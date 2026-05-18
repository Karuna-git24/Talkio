import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";
import { axiosInstance } from "../lib/axios";


export const getAuthUserFn = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
    } catch (error) {
        if (error.response?.status === 401) {
            // Unauthorized, return null to indicate no authenticated user
            return null;
        }
        throw error; 
    }
}

const useAuthUser = () => {
    const authUser = useQuery({
        queryKey:["authUser"],
        queryFn:getAuthUserFn,
        retry:false
    });
    return {
        isLoading:authUser.isLoading,
        authUser:authUser.data?.user
    }
}

export default useAuthUser;