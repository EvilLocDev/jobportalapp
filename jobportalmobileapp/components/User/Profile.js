import React, { useContext, useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import MyStyles from "../../styles/MyStyles";

import { Button, TextInput, Avatar, ActivityIndicator, RadioButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isEmployerWithData, setIsEmployerWithData] = useState(false);

    useEffect(() => {
        if (user) {
            // Tao bang sao tranh sua truc tiep context
            setUserInfo({
                ...user,
                phone_number: user.profile?.phone_number || '',
                address: user.profile?.address || '',
                user_type: user.profile?.user_type || 'candidate',
                avatar: { uri: user.avatar }
            });
        }

        const checkEmployerData = async () => {
            if (user && user.profile?.user_type === 'employer') {
                try {
                    const res = await authApis(user.access_token).get(endpoints['my-companies']);
                    if (res.data.length > 0) {
                        setIsEmployerWithData(true);
                    }
                } catch (ex) {
                    console.error("Failed to check employer data:", ex);
                }
            }
        };

        checkEmployerData();
        
    }, [user]);

    const updateState = (field, value) => {
        setUserInfo(current => ({
            ...current,
            [field]: value
        }));
    };

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("JobApp", "Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                updateState('avatar', result.assets[0]);
            }
        }
    };
    
    const updateUserProfile = async () => {
        setLoading(true);
        try {
            const form = new FormData();

            form.append('first_name', userInfo.first_name);
            form.append('last_name', userInfo.last_name);

            form.append('profile.phone_number', userInfo.phone_number);
            form.append('profile.address', userInfo.address);
            form.append('profile.user_type', userInfo.user_type);

            if (userInfo.avatar && userInfo.avatar.uri !== user.avatar) {
                 form.append('avatar', {
                    uri: userInfo.avatar.uri,
                    name: userInfo.avatar.fileName || 'avatar.jpg',
                    type: 'image/jpeg'
                });
            }

            // Gọi API bằng phương thức PATCH
            const res = await authApis(user.access_token).patch(endpoints['current-user'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Cập nhật context với dữ liệu mới
            dispatch({
                type: 'login',
                payload: { ...res.data, "access_token": user.access_token },
            });

            Alert.alert("Thành công", "Cập nhật thông tin thành công!");

        } catch (ex) {
            console.log('Error:', ex);
            Alert.alert("Error", "Co the ban nhap sai hoac thieu truong.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        dispatch({ "type": "logout" });
        nav.navigate("index");
    };

    if (!userInfo) {
        return <ActivityIndicator style={MyStyles.margin} />;
    }

    return (
        <ScrollView style={MyStyles.container}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <TouchableOpacity onPress={picker}>
                    <Avatar.Image size={100} source={{ uri: userInfo.avatar?.uri }} />
                </TouchableOpacity>
            </View>
            
            <TextInput label="Tên" value={userInfo.first_name} onChangeText={(t) => updateState('first_name', t)} style={MyStyles.m} />
            <TextInput label="Họ" value={userInfo.last_name} onChangeText={(t) => updateState('last_name', t)} style={MyStyles.m} />
            <TextInput label="Email" value={userInfo.email} editable={false} style={MyStyles.m} />
            <TextInput label="SDT" value={userInfo.phone_number} onChangeText={(t) => updateState('phone_number', t)} style={MyStyles.m} keyboardType="phone-pad" />
            <TextInput label="Address" value={userInfo.address} onChangeText={(t) => updateState('address', t)} style={MyStyles.m} />
            
            <View style={MyStyles.m}>
                <Text style={{marginBottom: 8, fontSize: 16}}>Vai trò của bạn:</Text>
                {/* Hien thi Text neu la Employer co company */}
                {isEmployerWithData ? (
                    <Text style={{ fontStyle: 'italic', color: 'gray' }}>
                        Nhà tuyển dụng (Không thể thay đổi vì đã có dữ liệu công ty)
                    </Text>
                ) : (
                    <RadioButton.Group onValueChange={newValue => updateState('user_type', newValue)} value={userInfo.user_type}>
                        <View style={MyStyles.row}>
                            <RadioButton value="candidate" />
                            <Text>Ứng viên</Text>
                        </View>
                        <View style={MyStyles.row}>
                            <RadioButton value="employer" />
                            <Text>Nhà tuyển dụng</Text>
                        </View>
                    </RadioButton.Group>
                )}
            </View>

            <Button loading={loading} disabled={loading} onPress={updateUserProfile} mode="contained" style={MyStyles.m}>Update</Button>

            <Button 
                onPress={() => nav.navigate('ChangePassword')}
                mode="contained" 
                style={MyStyles.m}
                icon="key-variant"
            >
                Change Password
            </Button>
            <Button onPress={logout} mode="outlined" style={MyStyles.m}>Logout</Button>
        </ScrollView>
    );
}

export default Profile;