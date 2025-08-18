import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SavedJobsContext } from '../../configs/Contexts';

const SaveJobs = () => {
    const savedJobs = useContext(SavedJobsContext);
    const navigation = useNavigation();

    // Hàm để render mỗi item trong danh sách
    const renderJobItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('job-details', { jobId: item.id })}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleLarge"  style={styles.title}>{item.title}</Text>
                    <Text variant="bodyMedium" style={styles.company}>{item.company_id}</Text>
                    <Text variant="bodyMedium" style={styles.salary}>
                        💰 {item.salary ? `${item.salary.toLocaleString()} VNĐ` : 'Lương thỏa thuận'}
                    </Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    // Nếu chưa có dữ liệu (đang tải hoặc user chưa đăng nhập)
    if (savedJobs === null) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Nếu không có công việc nào được lưu
    if (savedJobs.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Bạn chưa lưu công việc nào.</Text>
            </View>
        );
    }

    // Hiển thị danh sách công việc
    return (
        <View style={styles.container}>
            <FlatList
                data={savedJobs}
                renderItem={renderJobItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

// Styles cho component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8',
    },
    list: {
        padding: 10,
    },
    card: {
        marginBottom: 15,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    company: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    salary: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: '500',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default SaveJobs;