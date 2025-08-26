import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, FAB } from 'react-native-paper';
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

    const loadJobs = async () => {
        setLoading(true);
        try {
            const res = await authApis(user.access_token).get(endpoints['company-jobs'](companyId));
            setJobs(res.data);
        } catch (ex) {
            console.log('Error: ', ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused && companyId) {
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

    return (
        <View style={{ flex: 1 }}>
            {loading ? <ActivityIndicator style={MyStyles.margin} /> : (
                <ScrollView>
                    {jobs.map(item => (
                        <Card key={item.id} style={MyStyles.m}>
                            <TouchableOpacity onPress={() => nav.navigate('EmployerJobDetail', { jobId: item.id })}>
                                <Card.Content>
                                    <Text variant="titleMedium">{item.title}</Text>
                                    <Text>Salary: {item.salary}</Text>
                                    <Text>Type: {item.job_type}</Text>
                                </Card.Content>
                            </TouchableOpacity>
                            <Card.Actions>
                                <Button onPress={() => nav.navigate('EditJob', { jobId: item.id })}>Edit</Button>
                                <Button onPress={() => handleDeleteJob(item.id)} textColor='red'>Delete</Button>
                            </Card.Actions>
                        </Card>
                    ))}
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

export default CompanyJobManagement;