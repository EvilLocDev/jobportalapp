import { useState, useContext, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import JobForm from './JobForm';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

const CreateJob = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const route = useRoute();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [myCompanies, setMyCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    useEffect(() => {
        const loadMyCompanies = async () => {
            try {
                let res = await authApis(user.access_token).get(endpoints['my-approved-companies']);
                setMyCompanies(res.data);
                if (res.data.length > 0) {
                    setSelectedCompany(res.data[0].id);
                }
            } catch (ex) {
                console.log('Error: ', ex);
            } finally {
                setLoadingCompanies(false);
            }
        };

        loadMyCompanies();
    }, []);

    const handleCreateJob = async (jobData) => {
        if (!selectedCompany) {
            Alert.alert("Error", "Please choose company.");
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                ...jobData,
                company: selectedCompany,
                salary: parseInt(jobData.salary),
                expiration_date: jobData.expiration_date || null
            };

            await authApis(user.access_token).post(endpoints['jobs'], dataToSend);
            Alert.alert("Successfully", "Create job posting successfully.");

            nav.goBack();
        } catch (ex) {
            console.log('Error creating job: ', ex.response.data);
            Alert.alert("Error", "An error occurred while creating the job.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingCompanies) {
        return <ActivityIndicator style={MyStyles.margin} />;
    }

    if (myCompanies.length === 0) {
        return <View style={MyStyles.container}><Text style={MyStyles.m}>You have no company approved. Please wait until we approve your companies.</Text></View>;
    }

    return (
        <ScrollView>
            <Text style={MyStyles.m}>Choose company (*)</Text>
            <Picker selectedValue={selectedCompany} onValueChange={(itemValue) => setSelectedCompany(itemValue)}>
                {myCompanies.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
            </Picker>
            <JobForm
                onSubmit={handleCreateJob}
                submitButtonText="Create Job"
                loading={loading}
            />
        </ScrollView>
    );
};

export default CreateJob;