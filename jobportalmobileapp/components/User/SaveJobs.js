import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SavedJobsContext } from '../../configs/Contexts';

const SaveJobs = () => {
    const savedJobs = useContext(SavedJobsContext);
    const navigation = useNavigation();

    const renderJobItem = ({ item }) => {
        // Lấy thông tin job từ thuộc tính lồng nhau
        const job = item;

        if (!job) {
            return null;
        }

        return (
            <TouchableOpacity onPress={() => navigation.navigate('index', { screen: 'job-details', params: { jobId: job.id } })}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleLarge">{job.title}</Text>
                        <Text variant="bodyMedium">
                            {job.salary ? `${job.salary.toLocaleString()} VND` : 'Lương thỏa thuận'}
                        </Text>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    // Nếu chưa có dữ liệu (đang tải hoặc user chưa đăng nhập)
    if (savedJobs === null) {
        return (
            <View>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Nếu không có công việc nào được lưu
    if (savedJobs.length === 0) {
        return (
            <Text>Bạn chưa lưu công việc nào.</Text>
        );
    }

    // Hiển thị danh sách công việc
    return (
        <View style={styles.container}>
            <FlatList
                data={savedJobs}
                renderItem={renderJobItem}
                // Sử dụng ID của bản ghi SaveJob làm key, nó luôn là duy nhất trong danh sách này
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

});

export default SaveJobs;