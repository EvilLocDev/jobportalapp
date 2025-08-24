import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, FAB } from 'react-native-paper';
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

    return (
        <View style={{ flex: 1 }}>
            {loading ? <ActivityIndicator style={MyStyles.margin} /> : (
                <ScrollView>
                    {jobs.length === 0 ? (
                        <Text style={MyStyles.m}>There have no jobs</Text>
                    ) : (
                        jobs.map(item => (
                            
                            <TouchableOpacity key={item.id} onPress={() => nav.navigate('index', { screen: 'job-details', params: { jobId: item.id } })}>
                                <Card style={MyStyles.m}>
                                    <Card.Content>
                                        <Text variant="titleMedium">{item.title}</Text>
                                        <Text>Salary: {item.salary}</Text>
                                        <Text>Type: {item.job_type}</Text>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            <FAB
                icon="plus"
                style={MyStyles.fab}
                onPress={() => nav.navigate('CreateJob', { onJobCreated: loadJobs })}
            />
        </View>
    );
};

export default CompanyJobManagement;