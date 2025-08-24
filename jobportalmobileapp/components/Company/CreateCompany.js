import React, { useState, useContext } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, TextInput, Avatar, ActivityIndicator, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import { useNavigation } from '@react-navigation/native';

const CreateCompany = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const [company, setCompany] = useState({
        name: '',
        description: '',
        website: '',
        address: '',
    });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);

    const updateState = (field, value) => {
        setCompany(current => ({ ...current, [field]: value }));
    };

    const pickLogo = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Quyền truy cập", "Bạn cần cấp quyền để chọn ảnh.");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setLogo(result.assets[0]);
            }
        }
    };

    const submit = async () => {
        if (!company.name || !company.address) {
            Alert.alert("Lỗi", "Tên công ty và địa chỉ là bắt buộc.");
            return;
        }

        setLoading(true);
        const form = new FormData();
        for (let key in company) {
            form.append(key, company[key]);
        }

        if (logo) {
            form.append('logo', {
                uri: logo.uri,
                name: logo.fileName || 'logo.jpg',
                type: 'image/jpeg',
            });
        }
        
        try {
            await authApis(user.access_token).post(endpoints['companies'], form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert("Thành công", "Tạo công ty thành công! Vui lòng chờ admin duyệt.");
            nav.goBack(); 
        } catch (ex) {
            console.log('Error: ', ex);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo công ty.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.container}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <TouchableOpacity onPress={pickLogo}>
                    <Avatar.Image size={120} source={logo ? { uri: logo.uri } : require('../../assets/default-avatar.png')} />
                    <Text style={{marginTop: 5}}>Chọn logo</Text>
                </TouchableOpacity>
            </View>

            <TextInput label="Tên công ty (*)" value={company.name} onChangeText={t => updateState('name', t)} style={MyStyles.m} />
            <TextInput label="Mô tả" value={company.description} onChangeText={t => updateState('description', t)} style={MyStyles.m} multiline />
            <TextInput label="Website" value={company.website} onChangeText={t => updateState('website', t)} style={MyStyles.m} />
            <TextInput label="Địa chỉ (*)" value={company.address} onChangeText={t => updateState('address', t)} style={MyStyles.m} />

            <Button loading={loading} disabled={loading} onPress={submit} mode="contained" style={MyStyles.m}>Tạo Công Ty</Button>
        </ScrollView>
    );
};

export default CreateCompany;