import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator, FAB, Chip } from 'react-native-paper';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';

const CompanyJobManagement = () => {
    const { params } = useRoute();
    const companyId = params?.companyId;

    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const isFocused = useIsFocused();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    const loadJobs = async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const res = await authApis(user.access_token).get(endpoints['my-jobs'](companyId));
            setJobs(res.data.results || []);
        } catch (ex) {
            console.log('Error: ', ex);
            Alert.alert("Error", "Cannot load jobs for this company.");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadJobs();
        }
    }, [isFocused, companyId]);

    const handleDeleteJob = (jobId) => {
        Alert.alert("Confirm", "Do you really wan to delete this job?", [
            { text: "Cancel" },
            {
                text: "OK",
                onPress: async () => {
                    try {
                        await authApis(user.access_token).delete(endpoints['job-details'](jobId));
                        setJobs(jobs.filter(j => j.id !== jobId));
                    } catch (ex) {
                        console.log("Error when delete job: ", ex);
                        Alert.alert("Error", "Cannot delete this job.");
                    }
                }
            }
        ]);
    };

    const filteredJobs = useMemo(() => {
        if (filterStatus === 'active') {
            return jobs.filter(j => j.status === 'active');
        }
        if (filterStatus === 'expired') {
            return jobs.filter(j => j.status === 'expired');
        }
        return jobs;
    }, [jobs, filterStatus]);


    const getStatusStyle = (status) => {
        if (status === 'active') {
            return { backgroundColor: '#28a745', color: '#fff' };
        }
        return { backgroundColor: '#6c757d', color: '#fff' }; 
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.filterContainer}>
                <Button mode={filterStatus === 'all' ? 'contained' : 'outlined'} onPress={() => setFilterStatus('all')}>All ({jobs.length})</Button>
                <Button mode={filterStatus === 'active' ? 'contained' : 'outlined'} onPress={() => setFilterStatus('active')}>Active</Button>
                <Button mode={filterStatus === 'expired' ? 'contained' : 'outlined'} onPress={() => setFilterStatus('expired')}>Expired</Button>
            </View>

            {loading ? <ActivityIndicator style={MyStyles.margin} /> : (
                <ScrollView>
                    {filteredJobs.length > 0 ? filteredJobs.map(item => (
                        <Card key={item.id} style={MyStyles.m}>
                            <TouchableOpacity onPress={() => nav.navigate('EmployerJobDetail', { jobId: item.id })}>
                                <Card.Title
                                    title={item.title}
                                    subtitle={`Salary: ${item.salary}`}

                                    right={(props) => (
                                        <Chip 
                                            {...props} 
                                            style={[styles.chip, getStatusStyle(item.status)]} 
                                            textStyle={{ color: getStatusStyle(item.status).color, fontWeight: 'bold' }}
                                        >
                                            {item.status === 'active' ? 'Active' : 'Expired'}
                                        </Chip>
                                    )}
                                />
                            </TouchableOpacity>
                            <Card.Actions>
                                <Button onPress={() => nav.navigate('EditJob', { jobId: item.id })}>Edit</Button>
                                <Button onPress={() => handleDeleteJob(item.id)} textColor='red'>Delete</Button>
                            </Card.Actions>
                        </Card>
                    )) : (
                        <Text style={styles.emptyText}>No job posting.</Text>
                    )}
                </ScrollView>
            )}

            <FAB
                icon="plus"
                style={MyStyles.fab}
                onPress={() => nav.navigate('CreateJob', { companyId: companyId })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
    },
    chip: {
        marginRight: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    }
});

export default CompanyJobManagement;