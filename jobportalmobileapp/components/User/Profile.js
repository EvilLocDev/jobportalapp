import React, { useContext, useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import MyStyles from "../../styles/MyStyles";

import { Button, TextInput, Avatar, ActivityIndicator, RadioButton, Text } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isEmployerWithData, setIsEmployerWithData] = useState(false);
    const [isCandidateWithData, setIsCandidateWithData] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Cap nhat userInfo khi user context thay doi
            if (user) {
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
                        setIsEmployerWithData(res.data.length > 0);
                    } catch (ex) {
                        console.error("Failed to check employer data:", ex);
                    }
                } else {
                    setIsEmployerWithData(false);
                }
            };

            const checkCandidateData = async () => {
                if (user && user.profile?.user_type === 'candidate') {
                    try {
                        const res = await authApis(user.access_token).get(endpoints['resumes']);
                        setIsCandidateWithData(res.data.length > 0);
                    } catch (ex) {
                        console.error("Failed to check candidate data:", ex);
                    }
                } else {
                    setIsCandidateWithData(false);
                }
            };

            checkEmployerData();
            checkCandidateData();

        }, [user])
    );

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

            // API goi bang phuong thuc PATCH nhung co ve chua hop ly ve mat logic
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
            const errorMessage = ex.response?.data?.user_type?.[0] || "Error updating profile";
            Alert.alert("Error", errorMessage);
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

    const isRoleChangeLocked = isEmployerWithData || isCandidateWithData;

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
                <Text style={{marginBottom: 8, fontSize: 16}}>You are: </Text>

                {isRoleChangeLocked ? (
                    <Text style={{ fontStyle: 'italic', color: 'gray' }}>
                        {isEmployerWithData 
                            ? "Employer (Cannot change because there is company data)"
                            : "Candidate (Cannot change because there is resume data)"}
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

            {user && user.profile?.user_type === 'candidate' && (
                <Button 
                    icon="file-document-multiple" 
                    mode="contained-tonal" 
                    onPress={() => nav.navigate('ResumeManagement')}
                    style={MyStyles.m}
                >
                    CV Management
                </Button>
            )}

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