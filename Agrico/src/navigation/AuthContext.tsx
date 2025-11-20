// import React, { createContext, useState, useEffect, ReactNode } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
//
// type AuthContextType = {
//     isLoggedIn: boolean;
//     farmId?: number;
//     setFarmId: (farmId: number) => void;
//     login: (token: string, farmId?: number) => void;
//     logout: () => void;
// };
//
// export const AuthContext = createContext<AuthContextType>({
//     isLoggedIn: false,
//     farmId: undefined,
//     setFarmId: () => {},
//     login: () => {},
//     logout: () => {},
// });
//
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [farmId, setFarmId] = useState<number | undefined>(undefined);
//
//     useEffect(() => {
//         const checkToken = async () => {
//             const token = await AsyncStorage.getItem("AccessToken");
//             const savedFarmId = await AsyncStorage.getItem("FarmId");
//             if (token) {
//                 setIsLoggedIn(true);
//                 setFarmId(savedFarmId ? Number(savedFarmId) : undefined);
//             }
//         };
//         checkToken();
//     }, []);
//
//     const login = async (token: string, farmId?: number) => {
//         await AsyncStorage.setItem("AccessToken", token);
//         if (farmId) {
//             await AsyncStorage.setItem("FarmId", farmId.toString());
//             setFarmId(farmId);
//         }
//         setIsLoggedIn(true);
//     };
//
//     const logout = async () => {
//         await AsyncStorage.removeItem("AccessToken");
//         await AsyncStorage.removeItem("FarmId");
//         setIsLoggedIn(false);
//         setFarmId(undefined);
//     };
//
//     return (
//         <AuthContext.Provider value={{ isLoggedIn, farmId,setFarmId, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };
//

// AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
    isLoggedIn: boolean;
    farmId?: number;
    setFarmId: (farmId: number) => void;
    login: (token: string, farmId?: number) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    farmId: undefined,
    setFarmId: () => {},
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [farmId, setFarmIdState] = useState<number | undefined>(undefined);

    useEffect(() => {
        const loadSession = async () => {
            const token = await AsyncStorage.getItem("AccessToken");
            const savedFarmId = await AsyncStorage.getItem("FarmId");

            if (token) {
                setIsLoggedIn(true);
            }

            if (savedFarmId) {
                setFarmIdState(Number(savedFarmId));
            }
        };

        loadSession();
    }, []);

    const login = async (token: string, farmId?: number) => {
        await AsyncStorage.setItem("AccessToken", token);
        setIsLoggedIn(true);

        if (farmId) {
            await AsyncStorage.setItem("FarmId", farmId.toString());
            setFarmIdState(farmId);
        }
    };

    const setFarmId = async (farmId: number) => {
        await AsyncStorage.setItem("FarmId", farmId.toString());
        setFarmIdState(farmId);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("AccessToken");
        await AsyncStorage.removeItem("FarmId");
        setIsLoggedIn(false);
        setFarmIdState(undefined);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, farmId, setFarmId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

