// import ApiManager from './ApiManager';
//
// export const fetchDashboardData = async () => {
//     try {
//         // 1. Fetch farms
//         const farmsResp = await ApiManager.get('/farms/');
//         const farms = farmsResp.data.farms;
//
//         if (farms.length === 0) {
//             return { farms: [], crops: 0, livestock: 0, sales: 0, expenses: 0 };
//         }
//
//         // 2. Fetch crops & livestock counts for first farm (example)
//         const firstFarmId = farms[0].farm_id;
//
//         const cropsResp = await ApiManager.get('/crops/');
//         const crops = cropsResp.data.crops.filter((c: any) => c.farm_id === firstFarmId).length;
//
//         const livestockResp = await ApiManager.get(`/livestock/${firstFarmId}`);
//         const livestock = livestockResp.data.length;
//
//         // 3. Fetch expenses (optional)
//         const expensesResp = await ApiManager.get(`/expenses/${firstFarmId}`);
//         const expenses = expensesResp.data.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
//
//         // 4. Mock sales for now (replace with actual API if exists)
//         const sales = 0;
//
//         return { farms, crops, livestock, sales, expenses };
//     } catch (error) {
//         console.log("Dashboard fetch error:", error);
//         return { farms: [], crops: 0, livestock: 0, sales: 0, expenses: 0 };
//     }
// };
