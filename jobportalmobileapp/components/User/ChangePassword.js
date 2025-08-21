import React, { useState, useContext } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import { useNavigation } from '@react-navigation/native';

const ChangePassword = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // State để lưu lỗi từ server

    // Hàm cập nhật state chung
    const updateState = (field, value) => {
        setPasswords(current => ({
            ...current,
            [field]: value
        }));
    };

    const handleChangePassword = async () => {
        setErrors({});

        if (passwords.new_password !== passwords.confirm_new_password) {
            setErrors({ confirm_new_password: ["Mật khẩu mới không khớp."] });
            return;
        }

        if (!passwords.old_password || !passwords.new_password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setLoading(true);
        try {
            const res = await authApis(user.access_token).post(
                endpoints['change-password'],
                {
                    old_password: passwords.old_password,
                    new_password: passwords.new_password,
                    confirm_new_password: passwords.confirm_new_password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.status === 200) {
                Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
                    { text: "OK", onPress: () => nav.goBack() }
                ]);
            }
        } catch (ex) {
            if (ex.response && ex.response.data) {
                setErrors(ex.response.data);
            } else {
                Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình xử lý.");
            }
            console.log("Error changing password:", ex);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.container}>
            <TextInput
                label="Mật khẩu cũ"
                value={passwords.old_password}
                onChangeText={(t) => updateState('old_password', t)}
                secureTextEntry
                style={MyStyles.m}
            />
            {errors.old_password && <HelperText type="error">{errors.old_password[0]}</HelperText>}

            <TextInput
                label="Mật khẩu mới"
                value={passwords.new_password}
                onChangeText={(t) => updateState('new_password', t)}
                secureTextEntry
                style={MyStyles.m}
            />
            {errors.new_password && <HelperText type="error">{errors.new_password[0]}</HelperText>}

            <TextInput
                label="Xác nhận mật khẩu mới"
                value={passwords.confirm_new_password}
                onChangeText={(t) => updateState('confirm_new_password', t)}
                secureTextEntry
                style={MyStyles.m}
            />
            {errors.confirm_new_password && <HelperText type="error">{errors.confirm_new_password[0]}</HelperText>}

            <Button
                loading={loading}
                disabled={loading}
                onPress={handleChangePassword}
                mode="contained"
                style={MyStyles.m}
            >
                Xác Nhận Đổi Mật Khẩu
            </Button>
        </ScrollView>
    );
};

export default ChangePassword;