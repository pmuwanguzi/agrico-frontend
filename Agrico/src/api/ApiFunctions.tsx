// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ApiManager from "./ApiManager";
//
// // Helper to get token from AsyncStorage
// const getToken = async () => {
//     const token = await AsyncStorage.getItem("AccessToken");
//     if (!token) throw new Error("No auth token found");
//     return token;
// };
//
// // ------------------ LIVESTOCK ------------------
// export const getLivestock = async (farm_id: number) => {
//     const token = await getToken();
//     const res = await ApiManager.get(`/livestock/${farm_id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// export const createLivestock = async (data: any) => {
//     const token = await getToken();
//     const res = await ApiManager.post(`/livestock/`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// export const updateLivestock = async (id: number, data: any) => {
//     const token = await getToken();
//     const res = await ApiManager.put(`/livestock/${id}`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// export const deleteLivestock = async (id: number) => {
//     const token = await getToken();
//     const res = await ApiManager.delete(`/livestock/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// // ------------------ CROPS ------------------
// export const getCrops = async () => {
//     const token = await getToken();
//     const res = await ApiManager.get(`/crops/`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data.crops;
// };
//
// export const createCrop = async (data: any) => {
//     const token = await getToken();
//     const res = await ApiManager.post(`/crops/`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// export const updateCrop = async (id: number, data: any) => {
//     const token = await getToken();
//     const res = await ApiManager.put(`/crops/${id}`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
//
// export const deleteCrop = async (id: number) => {
//     const token = await getToken();
//     const res = await ApiManager.delete(`/crops/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     return res.data;
// };
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiManager from "./ApiManager";

// ---------------- Helper ----------------
const getToken = async () => {
    const token = await AsyncStorage.getItem("AccessToken");
    if (!token) throw new Error("No auth token found");
    return token;
};

// ------------------ LIVESTOCK ------------------
export const getLivestock = async (farm_id: number) => {
    const token = await getToken();
    const res = await ApiManager.get(`/livestock/${farm_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const createLivestock = async (data: any) => {
    const token = await getToken();
    const res = await ApiManager.post(`/livestock/`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateLivestock = async (id: number, data: any) => {
    const token = await getToken();
    const res = await ApiManager.put(`/livestock/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const deleteLivestock = async (id: number) => {
    const token = await getToken();
    const res = await ApiManager.delete(`/livestock/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// ------------------ CROPS ------------------
export const getCrops = async () => {
    const token = await getToken();
    const res = await ApiManager.get(`/crops/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.crops;
};

export const createCrop = async (data: any) => {
    const token = await getToken();
    const res = await ApiManager.post(`/crops/`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateCrop = async (id: number, data: any) => {
    const token = await getToken();
    const res = await ApiManager.put(`/crops/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const deleteCrop = async (id: number) => {
    const token = await getToken();
    const res = await ApiManager.delete(`/crops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// ------------------ EXPENSES ------------------
export const getExpenses = async (farm_id: number) => {
    const token = await getToken();
    const res = await ApiManager.get(`/expenses/${farm_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const createExpense = async (data: any) => {
    const token = await getToken();
    const res = await ApiManager.post(`/expenses/`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateExpense = async (id: number, data: any) => {
    const token = await getToken();
    const res = await ApiManager.put(`/expenses/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const deleteExpense = async (id: number) => {
    const token = await getToken();
    const res = await ApiManager.delete(`/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
