import React, { useState, useEffect, useContext } from 'react';
import { View, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import JobForm from './JobForm';

const EditJob = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const route = useRoute();
    const { jobId } = route.params;
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadJobDetails = async () => {
            try {
                const res = await authApis(user.access_token).get(endpoints['job-details'](jobId));
                setJobDetails(res.data);
            } catch (ex) {
                console.log("Error loading job:", ex);
                Alert.alert("Error", "Cannot load job details.");
                nav.goBack();
            } finally {
                setLoading(false);
            }
        };
        loadJobDetails();
    }, [jobId]);

    const handleUpdate = async (jobData) => {
        setUpdating(true);
        const data = {
            ...jobData,
            salary: parseInt(jobData.salary, 10),
            expiration_date: jobData.expiration_date || null,
        };

        try {
            await authApis(user.access_token).patch(endpoints['job-details'](jobId), data);
            Alert.alert("Successfully", "Successfully update job!");

            // Call callback function to refresh job list in previous screen
            if (route.params?.onActionSuccess) {
                route.params.onActionSuccess();
            }

            nav.goBack();
        } catch (ex) {
            console.log("Error when update job:", ex.response.data);
            Alert.alert("Error", "An error occur when updating job.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={MyStyles.margin} />;
    }

    return (
        <View style={{ flex: 1 }}>
            <JobForm
                initialValues={jobDetails}
                onSubmit={handleUpdate}
                submitButtonText="Save Changes"
                loading={updating}
            />
        </View>
    );
};

export default EditJob;