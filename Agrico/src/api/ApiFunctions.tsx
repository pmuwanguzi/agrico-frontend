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

// Get all livestock for farms of the logged-in user
// export const getLivestock = async () => {
//     const token = await getToken();
//     try {
//         const res = await ApiManager.get("/livestock/", {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return res.data; // array of livestock
//     } catch (error: any) {
//         console.error("Get Livestock Error:", error.response?.data || error.message);
//         throw error;
//     }
// };
/**
 * Fetch all livestock for the logged-in user's farms.
 * @returns Array of livestock objects.
 */
export const getLivestock = async () => {
    const token = await getToken();
    try {
        const response = await ApiManager.get("/livestock/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // This will be the array of livestock
    } catch (error: any) {
        console.error("Error fetching livestock:", error.response?.data || error.message);
        throw error;
    }
};



// Create livestock linked to a farm (user must own the farm)
export const createLivestock = async (data: {
    farm_id: number;
    animal_type: string;
    quantity: number;
    purchase_date?: string;
    health_status?: string;
}) => {
    const token = await getToken();
    try {
        const res = await ApiManager.post("/livestock/", data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Create Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};

// Update livestock by ID (user can only update their livestock)
export const updateLivestock = async (
    id: number,
    data: {
        animal_type?: string;
        quantity?: number;
        purchase_date?: string;
        health_status?: string;
    }
) => {
    const token = await getToken();
    try {
        const res = await ApiManager.put(`/livestock/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Update Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};

// Delete livestock by ID (user can only delete their livestock)
export const deleteLivestock = async (id: number) => {
    const token = await getToken();
    try {
        const res = await ApiManager.delete(`/livestock/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Delete Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};

// ------------------ CROPS ------------------

// Get all crops for the user's farms
export const getCrops = async () => {
    const token = await getToken();
    try {
        const res = await ApiManager.get("/crops/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.crops; // array of crops
    } catch (error: any) {
        console.error("Get Crops Error:", error.response?.data || error.message);
        throw error;
    }
};

// Create a new crop
export const createCrop = async (data: {
    farm_id: number; // should be user's farm id
    crop_name: string;
    crop_type?: string;
    planting_date?: string;
    harvest_date?: string;
    expected_yield?: number;
}) => {
    const token = await getToken();
    try {
        const res = await ApiManager.post("/crops/", data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Create Crop Error:", error.response?.data || error.message);
        throw error;
    }
};

// Update a crop
export const updateCrop = async (
    crop_id: number,
    data: {
        crop_name?: string;
        crop_type?: string;
        planting_date?: string;
        harvest_date?: string;
        expected_yield?: number;
    }
) => {
    const token = await getToken();
    try {
        const res = await ApiManager.put(`/crops/${crop_id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Update Crop Error:", error.response?.data || error.message);
        throw error;
    }
};

// Delete a crop
export const deleteCrop = async (crop_id: number) => {
    const token = await getToken();
    try {
        const res = await ApiManager.delete(`/crops/${crop_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Delete Crop Error:", error.response?.data || error.message);
        throw error;
    }
};


// ------------------ EXPENSES ------------------


interface ExpenseData {
    farm_id: number;
    amount: number;
    description?: string;
    date?: string; // YYYY-MM-DD format
}

interface ExpenseUpdateData {
    amount?: number;
    description?: string;
    date?: string; // YYYY-MM-DD format
}

// Fetch all expenses for a farm, returns { expenses: [], total_expenses: number }
export const getExpenses = async (farm_id: number, token: string) => {
    const res = await ApiManager.get(`/expenses/${farm_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Create a new expense
export const createExpense = async (expenseData: ExpenseData, token: string) => {
    const res = await ApiManager.post("/expenses/", expenseData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.expense; // returns the created expense object
};

// Update an existing expense
export const updateExpense = async (
    expense_id: number,
    updateData: ExpenseUpdateData,
    token: string
) => {
    const res = await ApiManager.put(`/expenses/${expense_id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.expense; // returns the updated expense object
};

// Delete an expense
export const deleteExpense = async (expense_id: number, token: string) => {
    const res = await ApiManager.delete(`/expenses/${expense_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { message: "Expense deleted" }
};

// ------------------ FARMS ------------------

// Get all farms for the logged-in user
export const getFarms = async () => {
    const token = await getToken();
    try {
        const res = await ApiManager.get("/farms/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.farms; // array of farms for current user
    } catch (error: any) {
        console.error("Get Farms Error:", error.response?.data || error.message);
        throw error;
    }
};

// Create a new farm (linked to logged-in user)
export const createFarm = async (data: {
    farm_name: string;
    location?: string;
    size_acres?: number;
}) => {
    const token = await getToken();
    try {
        const res = await ApiManager.post("/farms/", data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data.farm; // returns the created farm
    } catch (error: any) {
        console.error("Create Farm Error:", error.response?.data || error.message);
        throw error;
    }
};

// Update a farm by ID (only if it belongs to current user)
export const updateFarm = async (
    farm_id: number,
    data: {
        farm_name?: string;
        location?: string;
        size_acres?: number;
    }
) => {
    const token = await getToken();
    try {
        const res = await ApiManager.put(`/farms/${farm_id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Update Farm Error:", error.response?.data || error.message);
        throw error;
    }
};

// Delete a farm by ID (only if it belongs to current user)
export const deleteFarm = async (farm_id: number) => {
    const token = await getToken();
    try {
        const res = await ApiManager.delete(`/farms/${farm_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error: any) {
        console.error("Delete Farm Error:", error.response?.data || error.message);
        throw error;
    }
};

//---------------- SALES ------------------
import api from "./ApiManager"; // Axios instance with token interceptor

export interface SalePayload {
    item_name: string;
    quantity: number;
    unit_price: number;
    sale_date?: string; // optional, YYYY-MM-DD
    notes?: string;
}

// ---------------- CREATE SALE ----------------
export const createSale = async (payload: SalePayload) => {
    const response = await api.post("/sales/", payload);
    return response.data.sale;
};

// ---------------- GET ALL SALES ----------------
export const getSales = async () => {
    const response = await api.get("/sales/");
    return response.data; // array of sales
};

// ---------------- UPDATE SALE ----------------
export const updateSale = async (sale_id: number, payload: Partial<SalePayload>) => {
    const response = await api.put(`/sales/${sale_id}`, payload);
    return response.data.sale;
};

// ---------------- DELETE SALE ----------------
export const deleteSale = async (sale_id: number) => {
    const response = await api.delete(`/sales/${sale_id}`);
    return response.data.message;
};

// ---------------- TOTAL SALES FOR PERIOD ----------------
export const getTotalSales = async (start_date?: string, end_date?: string) => {
    let query = "";
    if (start_date || end_date) {
        query = `?${start_date ? "start_date=" + start_date : ""}${start_date && end_date ? "&" : ""}${end_date ? "end_date=" + end_date : ""}`;
    }
    const response = await api.get(`/sales/total${query}`);
    return response.data.total_sales;
};
