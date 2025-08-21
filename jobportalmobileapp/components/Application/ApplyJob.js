import React, { useState, useEffect, useContext } from 'react';
import { View, Modal, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Button, Text, RadioButton, Divider } from 'react-native-paper';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import Styles from "./Styles";

const ApplyJob = ({ visible, onClose, jobId, jobTitle }) => {
    const user = useContext(MyUserContext);
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && user) {
            loadResumes();
        }
    }, [visible, user]);

    const loadResumes = async () => {
        setLoading(true);
        try {
            const api = authApis(user.access_token);
            console.log("Fetching resumes for user:", user);
            const res = await api.get(endpoints['resumes'](user.id));
            setResumes(res.data);

            // Tự động chọn CV mặc định nếu có
            const defaultResume = res.data.find(r => r.is_default);
            if (defaultResume) {
                setSelectedResume(defaultResume.id);
            }

        } catch (ex) {
            console.error("Failed to load resumes:", ex);
            Alert.alert("Lỗi", "Không thể tải danh sách CV của bạn.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!selectedResume) {
            Alert.alert("Thông báo", "Vui lòng chọn một CV để ứng tuyển.");
            return;
        }

        setSubmitting(true);
        try {
            const api = authApis(user.access_token);
            await api.post(endpoints['apply-job'](jobId), {
                resume: selectedResume
            });

            Alert.alert("Thành công", "Bạn đã ứng tuyển thành công!");
            onClose(); // Đóng modal sau khi nộp thành công
        } catch (ex) {
            console.log("Error applying for job:", ex);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi ứng tuyển. Có thể bạn đã ứng tuyển công việc này rồi.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderResumeItem = ({ item }) => (
        <TouchableOpacity onPress={() => setSelectedResume(item.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            <RadioButton
                value={item.id}
                status={selectedResume === item.id ? 'checked' : 'unchecked'}
                onPress={() => setSelectedResume(item.id)}
            />
            <Text>{item.title} {item.is_default && "(Mặc định)"}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
                    <Text variant="titleLarge">Apply for position:</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>{jobTitle}</Text>

                    <Text style={{ marginBottom: 10, fontSize: 16 }}>Select CV to apply:</Text>
                    {loading ? <ActivityIndicator /> : (
                        <FlatList
                            data={resumes}
                            renderItem={renderResumeItem}
                            keyExtractor={item => item.id.toString()}
                            ListEmptyComponent={<Text>You do not have a CV yet. Please create one in your profile.</Text>}
                        />
                    )}
                    <Divider style={{ marginVertical: 20 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Button onPress={onClose} disabled={submitting}>Cancel</Button>
                        <Button
                            mode="contained"
                            onPress={handleApply}
                            loading={submitting}
                            disabled={submitting || loading || resumes.length === 0}
                        >
                            Submit
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ApplyJob;