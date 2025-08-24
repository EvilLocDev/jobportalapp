// components/Job/CreateJob.js

import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, TextInput, ActivityIndicator, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

const CreateJob = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const route = useRoute();
    const [job, setJob] = useState({
        title: '',
        description: '',
        location: '',
        salary: '',
        job_type: 'full_time',
        company: ''
    });
    const [myCompanies, setMyCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    useEffect(() => {
        const loadMyCompanies = async () => {
            try {
                let res = await authApis(user.access_token).get(endpoints['my-approved-companies']);
                setMyCompanies(res.data);
            } catch (ex) {
                console.log('Error: ', ex);
            } finally {
                setLoadingCompanies(false);
            }
        };

        loadMyCompanies();
    }, []);

    const updateState = (field, value) => {
        setJob(current => ({ ...current, [field]: value }));
    };

    const submit = async () => {
        if (!job.title || !job.company || !job.location || !job.salary) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        setLoading(true);
        try {
            await authApis(user.access_token).post(endpoints['jobs'], job);
            Alert.alert("Thành công", "Đăng tin tuyển dụng thành công!");

            if (route.params?.onJobCreated) {
                route.params.onJobCreated();
            }

            nav.goBack();
        } catch (ex) {
            console.log('Error: ', ex);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng tin.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingCompanies) {
        return <ActivityIndicator style={MyStyles.margin} />;
    }

    if (myCompanies.length === 0) {
        return <View style={MyStyles.container}><Text style={MyStyles.m}>Bạn chưa có công ty nào được duyệt. Vui lòng tạo công ty và chờ duyệt.</Text></View>;
    }

    return (
        <ScrollView style={MyStyles.container}>
            <Text style={MyStyles.m}>Chọn công ty (*)</Text>
            <Picker selectedValue={job.company} onValueChange={(itemValue) => updateState('company', itemValue)}>
                <Picker.Item label="-- Chọn công ty --" value="" />
                {myCompanies.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
            </Picker>

            <TextInput label="Tiêu đề tin (*)" value={job.title} onChangeText={t => updateState('title', t)} style={MyStyles.m} />
            <TextInput label="Mô tả" value={job.description} onChangeText={t => updateState('description', t)} style={MyStyles.m} multiline />
            <TextInput label="Địa điểm (*)" value={job.location} onChangeText={t => updateState('location', t)} style={MyStyles.m} />
            <TextInput label="Mức lương (*)" value={job.salary} onChangeText={t => updateState('salary', t)} style={MyStyles.m} keyboardType="numeric" />

            <Text style={MyStyles.m}>Loại công việc</Text>
            <Picker selectedValue={job.job_type} onValueChange={(itemValue) => updateState('job_type', itemValue)}>
                <Picker.Item label="Toàn thời gian" value="full_time" />
                <Picker.Item label="Bán thời gian" value="part_time" />
                <Picker.Item label="Từ xa" value="remote" />
            </Picker>

            <Button loading={loading} disabled={loading} onPress={submit} mode="contained" style={MyStyles.m}>Đăng Tin</Button>
        </ScrollView>
    );
};

export default CreateJob;