// import ApiManager from './ApiManager';
// import AsyncStorage from "@react-native-async-storage/async-storage";
//
// export const fetchDashboardData = async () => {
//     try {
//         const token = await AsyncStorage.getItem('AccessToken');
//         const result = await ApiManager.get('dashboard/summary', {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//         return result.data; // { livestock: 15, crops: 8, sales: 3500, expenses: 2200 }
//     } catch (error) {
//         console.error(error);
//         return { livestock: 0, crops: 0, sales: 0, expenses: 0 };
//     }
// };
