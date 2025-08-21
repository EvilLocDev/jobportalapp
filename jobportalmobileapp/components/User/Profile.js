import React, { useContext, useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import MyStyles from "../../styles/MyStyles";
import { Button, TextInput, Avatar, ActivityIndicator, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Tạo một bản sao để chỉnh sửa, tránh thay đổi trực tiếp context
            setUserInfo({
                ...user,
                phone_number: user.profile?.phone_number || '',
                address: user.profile?.address || '',
                user_type: user.profile?.user_type || 'candidate', // Mặc định là candidate
                // Trường avatar cần xử lý riêng
                avatar: { uri: user.avatar }
            });
        }
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
            // Cacc trường thông tin người dùng
            form.append('first_name', userInfo.first_name);
            form.append('last_name', userInfo.last_name);

            // API của mong muốn là gửi từng trường của profile
            form.append('profile.phone_number', userInfo.phone_number);
            form.append('profile.address', userInfo.address);
            form.append('profile.user_type', userInfo.user_type);

            // Xử lý avatar nếu nó đã được thay đổi
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
            console.error(ex);
            Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
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
            <TextInput label="Số điện thoại" value={userInfo.phone_number} onChangeText={(t) => updateState('phone_number', t)} style={MyStyles.m} keyboardType="phone-pad" />
            <TextInput label="Địa chỉ" value={userInfo.address} onChangeText={(t) => updateState('address', t)} style={MyStyles.m} />
            
            <Text style={MyStyles.m}>Bạn là:</Text>
            {/* Thêm lựa chọn user_type (ví dụ dùng RadioButton) ở đây nếu cần */}

            <Button loading={loading} disabled={loading} onPress={updateUserProfile} mode="contained" style={MyStyles.m}>Cập nhật</Button>

            <Button 
                onPress={() => nav.navigate('ChangePassword')} // Thêm dòng này
                mode="contained" 
                style={MyStyles.m}
                icon="key-variant"
            >
                Đổi Mật Khẩu
            </Button>
            <Button onPress={logout} mode="outlined" style={MyStyles.m}>Đăng xuất</Button>
        </ScrollView>
    );
}

export default Profile;