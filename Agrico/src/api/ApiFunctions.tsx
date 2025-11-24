
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiManager from "./ApiManager";

// ---------------- Helper ----------------
const getToken = async () => {
    const token = await AsyncStorage.getItem("AccessToken");
    if (!token) throw new Error("No auth token found");
    return token;
};

// ------------------ LIVESTOCK ------------------

/**
 * Fetch all livestock for the logged-in user's farms.
 * @returns Object with livestock array: { livestock: [...] }
 */
export const getLivestock = async () => {
    const token = await getToken();
    try {
        const response = await ApiManager.get("/livestock/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.livestock; // Returns the livestock array from { livestock: [...] }
    } catch (error: any) {
        console.error("Error fetching livestock:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Create livestock linked to a farm (user must own the farm)
 * @param data - Livestock data including farm_id, animal_type, quantity, etc.
 * @returns Created livestock object with message and id
 */
export const createLivestock = async (data: {
    farm_id: number;
    animal_type: string;
    quantity: number;
    purchase_date?: string;  // Made optional since backend allows it
    health_status?: string;   // Made optional since backend allows it
}) => {
    const token = await getToken();
    try {
        const res = await ApiManager.post("/livestock/", data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // { message: "Livestock created successfully", id: ... }
    } catch (error: any) {
        console.error("Create Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update livestock by ID (user can only update their livestock)
 * @param id - Livestock ID
 * @param data - Updated livestock fields
 * @returns Success message
 */
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
        return res.data; // { message: "Livestock updated successfully" }
    } catch (error: any) {
        console.error("Update Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Delete livestock by ID (user can only delete their livestock)
 * @param id - Livestock ID
 * @returns Success message
 */
export const deleteLivestock = async (id: number) => {
    const token = await getToken();
    try {
        const res = await ApiManager.delete(`/livestock/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // { message: "Livestock deleted successfully" }
    } catch (error: any) {
        console.error("Delete Livestock Error:", error.response?.data || error.message);
        throw error;
    }
};
// ------------------ LIVESTOCK OLD------------------
//
// /**
//  * Fetch all livestock for the logged-in user's farms.
//  * @returns Array of livestock objects.
//  */
// export const getLivestock = async () => {
//     const token = await getToken();
//     try {
//         const response = await ApiManager.get("/livestock/", {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return response.data; // This will be the array of livestock
//     } catch (error: any) {
//         console.error("Error fetching livestock:", error.response?.data || error.message);
//         throw error;
//     }
// };
//
//
//
// // Create livestock linked to a farm (user must own the farm)
// export const createLivestock = async (data: {
//     farm_id: number;
//     animal_type: string;
//     quantity: number;
//     purchase_date: string;
//     health_status: string;
// }) => {
//     const token = await getToken();
//     try {
//         const res = await ApiManager.post("/livestock/", data, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return res.data;
//     } catch (error: any) {
//         console.error("Create Livestock Error:", error.response?.data || error.message);
//         throw error;
//     }
// };
//
// // Update livestock by ID (user can only update their livestock)
// export const updateLivestock = async (
//     id: number,
//     data: {
//         animal_type?: string;
//         quantity?: number;
//         purchase_date?: string;
//         health_status?: string;
//     }
// ) => {
//     const token = await getToken();
//     try {
//         const res = await ApiManager.put(`/livestock/${id}`, data, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return res.data;
//     } catch (error: any) {
//         console.error("Update Livestock Error:", error.response?.data || error.message);
//         throw error;
//     }
// };
//
// // Delete livestock by ID (user can only delete their livestock)
// export const deleteLivestock = async (id: number) => {
//     const token = await getToken();
//     try {
//         const res = await ApiManager.delete(`/livestock/${id}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return res.data;
//     } catch (error: any) {
//         console.error("Delete Livestock Error:", error.response?.data || error.message);
//         throw error;
//     }
// };

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
//---------------- SALES ------------------

export interface SalePayload {
    farm_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    sale_date?: string; // optional, YYYY-MM-DD
    notes?: string;
}

export interface Sale {
    sale_id: number;
    farm_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    sale_date: string;
    notes?: string;
}

/**
 * Create a new sale
 * @param payload - Sale data including farm_id, item_name, quantity, unit_price
 * @returns Created sale object
 */
export const createSale = async (payload: SalePayload) => {
    const token = await getToken();
    try {
        const response = await ApiManager.post("/sales/", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.sale; // { message: "Sale created successfully", sale: {...} }
    } catch (error: any) {
        console.error("Create Sale Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get all sales for the logged-in user's farms
 * @returns Object with sales array: { sales: [...] }
 */
export const getSales = async () => {
    const token = await getToken();
    try {
        const response = await ApiManager.get("/sales/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.sales; // Returns the sales array from { sales: [...] }
    } catch (error: any) {
        console.error("Get Sales Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get all sales for a specific farm
 * @param farm_id - Farm ID
 * @returns Object with sales array: { sales: [...] }
 */
export const getSalesByFarm = async (farm_id: number) => {
    const token = await getToken();
    try {
        const response = await ApiManager.get(`/sales/farm/${farm_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.sales; // Returns the sales array from { sales: [...] }
    } catch (error: any) {
        console.error("Get Sales By Farm Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update a sale by ID (user can only update their sales)
 * @param sale_id - Sale ID
 * @param payload - Updated sale fields
 * @returns Updated sale object
 */
export const updateSale = async (sale_id: number, payload: Partial<SalePayload>) => {
    const token = await getToken();
    try {
        const response = await ApiManager.put(`/sales/${sale_id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.sale; // { message: "Sale updated successfully", sale: {...} }
    } catch (error: any) {
        console.error("Update Sale Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Delete a sale by ID (user can only delete their sales)
 * @param sale_id - Sale ID
 * @returns Success message
 */
export const deleteSale = async (sale_id: number) => {
    const token = await getToken();
    try {
        const response = await ApiManager.delete(`/sales/${sale_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // { message: "Sale deleted successfully" }
    } catch (error: any) {
        console.error("Delete Sale Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get total sales amount for a period (optional date filters)
 * @param start_date - Optional start date (YYYY-MM-DD)
 * @param end_date - Optional end date (YYYY-MM-DD)
 * @returns Total sales amount
 */
export const getTotalSales = async (start_date?: string, end_date?: string) => {
    const token = await getToken();
    try {
        let query = "";
        if (start_date || end_date) {
            const params = new URLSearchParams();
            if (start_date) params.append("start_date", start_date);
            if (end_date) params.append("end_date", end_date);
            query = `?${params.toString()}`;
        }

        const response = await ApiManager.get(`/sales/total${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.total_sales; // Returns the total sales number
    } catch (error: any) {
        console.error("Get Total Sales Error:", error.response?.data || error.message);
        throw error;
    }
};
// ------------------ DASHBOARD ------------------

export interface DashboardData {
    total_farms: number;
    total_livestock: number;
    total_crops: number;
    total_sales: number;
    total_expenses: number;
    net_profit: number;
    farms?: FarmSummary[];
    recent_sales?: any[];
    recent_expenses?: any[];
}

export interface FarmSummary {
    farm_id: number;
    farm_name: string;
    location?: string;
    size_acres?: number;
    livestock_count: number;
    crops_count: number;
    total_sales: number;
    total_expenses: number;
    profit: number;
}

/**
 * Get comprehensive dashboard statistics
 * @returns Dashboard data with all metrics
 */
export const getDashboardStats = async (): Promise<DashboardData> => {
    const token = await getToken();
    try {
        const response = await ApiManager.get("/dashboard/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Get Dashboard Stats Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get quick summary for lightweight dashboard updates
 * @returns Quick summary with key metrics only
 */
export const getDashboardSummary = async () => {
    const token = await getToken();
    try {
        const response = await ApiManager.get("/dashboard/summary", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Get Dashboard Summary Error:", error.response?.data || error.message);
        throw error;
    }
};