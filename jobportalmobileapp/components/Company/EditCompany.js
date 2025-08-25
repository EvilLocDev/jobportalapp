import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';

const EditCompany = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const route = useRoute();
    const { companyId } = route.params; // Lay ID tu params

    const [company, setCompany] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadCompanyDetails = async () => {
            try {
                const res = await authApis(user.access_token).get(endpoints['company-details'](companyId));
                const data = res.data;
                setCompany(data);
                setName(data.name);
                setDescription(data.description);
                setWebsite(data.website);
                setAddress(data.address);
            } catch (ex) {
                console.log("Error when loading company detail:", ex);
                Alert.alert("Error", "Cannot load company details.");
                nav.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadCompanyDetails();
    }, [companyId]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            console.log('Image selected: ', result.assets[0]);
            setLogo(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('website', website);
        formData.append('address', address);

        if (logo) {
            formData.append('logo', {
                uri: logo.uri,
                name: logo.fileName || 'logo.jpg',
                type: logo.minType || 'image/jpeg',
            });
        }

        try {
            await authApis(user.access_token).patch(endpoints['company-details'](companyId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert("Successfully", "Updating company info successfully!");
            nav.goBack();
        } catch (ex) {
            console.log("Error when update company:", ex.response.data);
            Alert.alert("Error", "An error occurred while updating the company. It might be due to maximum logo size (2MB)");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={MyStyles.margin} />;
    }

    return (
        <ScrollView style={MyStyles.container}>
            <TextInput label="Company name" value={name} onChangeText={setName} style={MyStyles.m} />
            <TextInput label="Description" value={description} onChangeText={setDescription} style={MyStyles.m} multiline />
            <TextInput label="Website" value={website} onChangeText={setWebsite} style={MyStyles.m} />
            <TextInput label="Address" value={address} onChangeText={setAddress} style={MyStyles.m} />
            
            <View style={[MyStyles.m, { alignItems: 'center' }]}>
                <Text variant="titleMedium">Company logo</Text>
                <Image 
                    source={{ uri: logo ? logo.uri : company?.logo }} 
                    style={{ width: 100, height: 100, borderRadius: 10, marginVertical: 10 }} 
                />
                <Button icon="image" mode="outlined" onPress={pickImage}>
                    Change Logo
                </Button>
            </View>

            <Button 
                mode="contained" 
                onPress={handleUpdate} 
                style={MyStyles.m} 
                loading={updating} 
                disabled={updating}
            >
                Change Company Info
            </Button>
        </ScrollView>
    );
};

export default EditCompany;