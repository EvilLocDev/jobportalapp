import React, { useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Button, Text, TextInput, Modal, Portal } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';

const UpdateResumeModal = ({ visible, onClose, resumeId, onUpdateSuccess }) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [title, setTitle] = useState('');
    const [fileToUpdate, setFileToUpdate] = useState(null);

    // Fetch resume details when modal is opened
    useEffect(() => {
        const fetchResume = async () => {
            if (!resumeId || !visible) return;
            setLoading(true);
            try {
                const api = authApis(user.access_token);
                const res = await api.get(endpoints['resume-details'](resumeId));
                setResumeData(res.data);
                setTitle(res.data.title);
            } catch (ex) {
                console.error("Failed to fetch resume details:", ex);
                Alert.alert("Lỗi", "Không thể lấy chi tiết CV.");
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, [resumeId, visible, user]);

    const handlePickFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        });

        if (!result.canceled) {
            setFileToUpdate(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        if (!title.trim()) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề CV.");
            return;
        }

        setUpdating(true);
        try {
            const api = authApis(user.access_token);
            let updatePayload;
            let headers = {};

            // Update file with form data if a new file is selected
            if (fileToUpdate) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('file', {
                    uri: fileToUpdate.uri,
                    name: fileToUpdate.name,
                    type: fileToUpdate.mimeType,
                });
                updatePayload = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                // Update title with JSON if no new file
                updatePayload = { title: title };
            }

            const res = await api.patch(endpoints['resume-details'](resumeId), updatePayload, { headers });
            
            Alert.alert("Thành công", "Đã cập nhật CV!");
            onUpdateSuccess();
            onClose();
        } catch (ex) {
            console.error("Update failed:", ex.response?.data || ex.message);
            Alert.alert("Lỗi", "Không thể cập nhật CV.");
        } finally {
            setUpdating(false);
        }
    };

    if (!visible) return null;

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalView}>
                <Text variant="titleLarge" style={styles.modalTitle}>Cập nhật CV</Text>
                {loading ? (
                    <ActivityIndicator style={{ marginVertical: 20 }} />
                ) : (
                    <>
                        <TextInput
                            label="Tiêu đề CV"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.textInput}
                        />
                        <Button icon="attachment" mode="outlined" onPress={handlePickFile} style={styles.fileButton}>
                            {fileToUpdate ? fileToUpdate.name : "Chọn file mới (nếu muốn thay thế)"}
                        </Button>

                        <View style={styles.buttonContainer}>
                            <Button onPress={onClose} disabled={updating}>Hủy</Button>
                            <Button
                                mode="contained"
                                onPress={handleUpdate}
                                loading={updating}
                                disabled={updating}
                            >
                                Lưu thay đổi
                            </Button>
                        </View>
                    </>
                )}
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 20,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    textInput: {
        marginBottom: 10,
    },
    fileButton: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});

export default UpdateResumeModal;