import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
// import { VictoryPie, VictoryChart, VictoryTheme, VictoryLine, VictoryLabel } from 'victory-native';

export default function AnalyticsDashboard() {
    const departmentData = [
        { x: "CS", y: 35 },
        { x: "ECE", y: 30 },
        { x: "MECH", y: 20 },
        { x: "CIVIL", y: 15 }
    ];

    const placementTrend = [
        { x: 2020, y: 70 },
        { x: 2021, y: 75 },
        { x: 2022, y: 82 },
        { x: 2023, y: 88 },
        { x: 2024, y: 92 }
    ];

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.header}>College Analytics</Title>

            <Card style={styles.card}>
                <Card.Title title="Student Distribution (Dept)" />
                <Card.Content style={{ alignItems: 'center' }}>
                    <Text>Charts disabled</Text>
                    {/* <VictoryPie
                        data={departmentData}
                        colorScale={["#0055FF", "#4da6ff", "#002a80", "#80b3ff"]}
                        width={300}
                        height={300}
                        innerRadius={50}
                        style={{ labels: { fill: "black", fontSize: 12, fontWeight: "bold" } }}
                    /> */}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Placement Trends (%)" />
                <Card.Content>
                    <Text>Charts disabled</Text>
                    {/* <VictoryChart theme={VictoryTheme.material}>
                        <VictoryLine
                            style={{
                                data: { stroke: "#0055FF" },
                                parent: { border: "1px solid #ccc"}
                            }}
                            data={placementTrend}
                            animate={{
                                duration: 2000,
                                onLoad: { duration: 1000 }
                            }}
                        />
                    </VictoryChart> */}
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 10, textAlign: 'center' },
    card: { marginBottom: 20, elevation: 4 }
});
