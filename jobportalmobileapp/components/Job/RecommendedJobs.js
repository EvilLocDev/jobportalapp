import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { authApis, endpoints } from '../../configs/Apis'; 
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';
import { List } from 'react-native-paper';
import MyStyles from '../../styles/MyStyles';

const RecommendedJobs = () => {
    const user = useContext(MyUserContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigation();

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            if (user && user.access_token) {
                try {
                    const res = await authApis(user.access_token).get(endpoints['recommendations']);
                    setJobs(res.data);
                } catch (ex) {
                    console.log("Failed to fetch recommended jobs:", ex);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchRecommendedJobs();
    }, []);

    if (loading) {
        return <ActivityIndicator style={styles.centered} size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.centeredText}>There are no recommend jobs for you.</Text>}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.title}
                        description={item.created_date}
                        left={() => (
                            <TouchableOpacity onPress={() => nav.navigate('job-details', { 'jobId': item.id })}>
                                <Image style={MyStyles.avatar} source={{ uri: item.company.logo }} />
                            </TouchableOpacity>

                        )}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    jobCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    salary: {
        fontSize: 14,
        color: 'green',
        marginBottom: 5,
    },
    location: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
});

export default RecommendedJobs;