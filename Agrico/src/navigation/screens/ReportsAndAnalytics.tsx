import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getLivestock,getCrops,getSales,getExpenses,getFarms  } from "../../api/ApiFunctions";
const screenWidth = Dimensions.get("window").width - 20;

const ReportsAndAnalytics = () => {
    const [loading, setLoading] = useState(true);

    const [livestockData, setLivestockData] = useState([]);
    const [cropData, setCropData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [expensesData, setExpensesData] = useState([]);
    const [farmId, setFarmId] = useState<number | null>(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const farms = await getFarms();
            if (farms.length === 0) return;

            const selectedFarm = farms[0].farm_id;
            setFarmId(selectedFarm);

            const [livestock, crops, sales] = await Promise.all([
                getLivestock(),
                getCrops(),
                getSales()
            ]);

            const token = await AsyncStorage.getItem("AccessToken");
            const expenses = await getExpenses(selectedFarm, token!);

            setLivestockData(livestock);
            setCropData(crops);
            setSalesData(sales);
            setExpensesData(expenses.expenses);

        } catch (error) {
            console.log("Analytics Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text>Loading Reports...</Text>
            </View>
        );
    }

    /* ---------------- LIVESTOCK PIE DATA ---------------- */
    const livestockPie = Object.values(
        livestockData.reduce((acc: any, item: any) => {
            acc[item.animal_type] = acc[item.animal_type] || { name: item.animal_type, count: 0 };
            acc[item.animal_type].count += item.quantity;
            return acc;
        }, {})
    ).map((item: any, index: number) => ({
        name: item.name,
        population: item.count,
        color: pastelColors[index % pastelColors.length],
        legendFontColor: "#333",
        legendFontSize: 14,
    }));

    /* ---------------- CROP PIE DATA ---------------- */
    const cropPie = Object.values(
        cropData.reduce((acc: any, item: any) => {
            acc[item.crop_type] = acc[item.crop_type] || { name: item.crop_type, count: 0 };
            acc[item.crop_type].count += 1;
            return acc;
        }, {})
    ).map((item: any, index: number) => ({
        name: item.name,
        population: item.count,
        color: pastelColors[index % pastelColors.length],
        legendFontColor: "#333",
        legendFontSize: 14,
    }));

    /* ---------------- MONTHLY SALES BAR ---------------- */
    const monthlySales = salesData.reduce((acc: any, s: any) => {
        const month = new Date(s.sale_date).toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + s.quantity * s.unit_price;
        return acc;
    }, {});

    /* ---------------- MONTHLY EXPENSES LINE ---------------- */
    const monthlyExpenses = expensesData.reduce((acc: any, e: any) => {
        const month = new Date(e.date).toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + e.amount;
        return acc;
    }, {});

    const salesLabels = Object.keys(monthlySales);
    const salesValues = Object.values(monthlySales);
    const expenseLabels = Object.keys(monthlyExpenses);
    const expenseValues = Object.values(monthlyExpenses);

    const totalSales = salesValues.reduce((a: any, b: any) => a + b, 0);
    const totalExpenses = expenseValues.reduce((a: any, b: any) => a + b, 0);

    const netProfit = totalSales - totalExpenses;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Reports & Analytics</Text>

            {/* ----- LIVESTOCK DISTRIBUTION ----- */}
            <Text style={styles.header}>Livestock Distribution</Text>
            {livestockPie.length > 0 ? (
                <PieChart
                    data={livestockPie}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                />
            ) : (
                <Text>No livestock data</Text>
            )}

            {/* ----- CROP DISTRIBUTION ----- */}
            <Text style={styles.header}>Crop Distribution</Text>
            {cropPie.length > 0 ? (
                <PieChart
                    data={cropPie}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                />
            ) : (
                <Text>No crop data</Text>
            )}

            {/* ----- SALES CHART ----- */}
            <Text style={styles.header}>Monthly Sales (RWF)</Text>
            {salesValues.length > 0 ? (
                <BarChart
                    data={{
                        labels: salesLabels,
                        datasets: [{ data: salesValues }],
                    }}
                    width={screenWidth}
                    height={260}
                    chartConfig={chartConfig}
                />
            ) : (
                <Text>No sales data</Text>
            )}

            {/* ----- EXPENSES CHART ----- */}
            <Text style={styles.header}>Monthly Expenses (RWF)</Text>
            {expenseValues.length > 0 ? (
                <LineChart
                    data={{
                        labels: expenseLabels,
                        datasets: [{ data: expenseValues }],
                    }}
                    width={screenWidth}
                    height={260}
                    chartConfig={chartConfig}
                />
            ) : (
                <Text>No expenses data</Text>
            )}

            {/* ----- NET PROFIT ----- */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Sales: {totalSales} RWF</Text>
                <Text style={styles.summaryLabel}>Total Expenses: {totalExpenses} RWF</Text>
                <Text style={styles.summaryLabel}>Net Profit: {netProfit} RWF</Text>
            </View>

        </ScrollView>
    );
};

const pastelColors = [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
    "#D7B4F3", "#F3B4CE", "#B4F3E6", "#F3EFB4"
];

const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 94, 168, ${opacity})`,
    labelColor: () => "#333",
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: "#fff",
        flex: 1
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    header: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryCard: {
        marginTop: 30,
        padding: 15,
        backgroundColor: "#f2f2f2",
        borderRadius: 12,
    },
    summaryLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 5,
    },
});

export default ReportsAndAnalytics;
