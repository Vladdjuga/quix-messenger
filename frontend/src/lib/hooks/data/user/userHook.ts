import {useContext, useEffect, useState} from "react";
import {UserContext} from "@/lib/contexts/UserContext";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {getCurrentUserUseCase} from "@/lib/usecases/user/getCurrentUserUseCase";

export const useCurrentUser = () => {
    const contextUser = useContext(UserContext);
    const [user, setUser] = useState<ReadUserDto | null>(contextUser);
    const [loading, setLoading] = useState(!contextUser);

    useEffect(() => {
        if (!contextUser) {
            (async () => {
                try {
                    const currentUser = await getCurrentUserUseCase();
                    setUser(currentUser);
                } catch (err) {
                    console.error("Failed to fetch user", err);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, [contextUser]);

    return { user, loading };
}