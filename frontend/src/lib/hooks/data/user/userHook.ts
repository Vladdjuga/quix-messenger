import {useContext} from "react";
import {UserContext} from "@/lib/contexts/UserContext";

export const useCurrentUser = () => {
    const user = useContext(UserContext);
    if (!user) throw new Error("useCurrentUser must be used within a UserProvider");
    return user;
}