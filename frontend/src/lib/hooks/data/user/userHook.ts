import {useContext} from "react";
import {UserContext} from "@/lib/contexts/UserContext";

export const useCurrentUser = () => {
    const context = useContext(UserContext);
    
    if (!context) {
        throw new Error('useCurrentUser must be used within a UserProvider');
    }
    
    return {
        user: context.user,
        loading: context.isLoading,
        isAuthenticated: context.isAuthenticated,
        setUser: context.setUser
    };
};