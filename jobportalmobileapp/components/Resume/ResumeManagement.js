import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button, Card, IconButton, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import UpdateResumeModal from './UpdateResumeModal';

const ResumeManagement = () => {
    const user = useContext(MyUserContext);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newResumeTitle, setNewResumeTitle] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState(null);

    const loadResumes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const api = authApis(user.access_token);
            const res = await api.get(endpoints['resumes']);
            setResumes(res.data);
            console.log("Fetched resumes:", res.data);
        } catch (ex) {
            console.log("Failed to load resumes:", ex);
            Alert.alert("Lỗi", "Không thể tải danh sách CV.");
        } finally {
            setLoading(false);
        }
    };

    // Reload resumes when the screen is focused
    useFocusEffect(
        useCallback(() => {
            loadResumes();
        }, [user])
    );

    const handlePickFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        });

        if (!result.canceled) {
            setFileToUpload(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!newResumeTitle || !fileToUpload) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và chọn file CV.");
            return;
        }

        const formData = new FormData();
        formData.append('title', newResumeTitle);
        formData.append('file', {
            uri: fileToUpload.uri,
            name: fileToUpload.name,
            type: fileToUpload.mimeType,
        });

        setUploading(true);
        try {
            const api = authApis(user.access_token);
            const res = await api.post(endpoints['resumes'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert("Thành công", "Đã tải lên CV mới!");
            setNewResumeTitle('');
            setFileToUpload(null);
            loadResumes();
        } catch (ex) {
            console.log("Upload failed:", ex.response?.data || ex.message);
            Alert.alert("Error", "Cannot upload resume.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (resumeId) => {
        Alert.alert("Confirm", "Do you really want delete it?", [
            { text: "Cancel" },
            {
                text: "Delete", onPress: async () => {
                    try {
                        await authApis(user.access_token).delete(endpoints['resume-details'](resumeId));
                        Alert.alert("Thành công", "Đã xóa CV.");
                        loadResumes();
                    } catch (ex) {
                        console.log("Delete failed:", ex);
                        Alert.alert("Error", "Cannot delete resume.");
                    }
                }
            }
        ]);
    };
    
    const handleSetDefault = async (resumeId) => {
        try {
            await authApis(user.access_token).patch(endpoints['resume-details'](resumeId), { is_default: true });
            console.log("Set default response:", user);
            console.log("Set default resume ID:", resumeId);
            Alert.alert("Thành công", "Đã đặt CV làm mặc định.");
            loadResumes();
        } catch (ex) {
            console.log("Set default failed:", ex);
            Alert.alert("Lỗi", "Không thể đặt làm mặc định.");
        }
    };

    const handleOpenUpdateModal = (resumeId) => {
        setSelectedResumeId(resumeId);
        setIsUpdateModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title
                title={item.title}
                subtitle={item.is_default ? "Default" : null}
                right={() => (
                    <View style={styles.cardActions}>
                        <IconButton 
                            icon="pencil" 
                            iconColor="green" 
                            onPress={() => handleOpenUpdateModal(item.id)} 
                        />
                        <IconButton 
                            icon="delete" 
                            iconColor="red" 
                            onPress={() => handleDelete(item.id)} 
                        />
                    </View>
                )}
            />
            {!item.is_default && (
                 <Card.Actions>
                    <Button onPress={() => handleSetDefault(item.id)}>Set Default</Button>
                </Card.Actions>
            )}
        </Card>
    );

    return (
        <>
            <UpdateResumeModal 
                visible={isUpdateModalVisible}
                onClose={() => setIsUpdateModalVisible(false)}
                resumeId={selectedResumeId}
                onUpdateSuccess={loadResumes}
            />

            <View style={styles.container}>
                <Card style={styles.uploadCard}>
                    <Card.Content>
                        <TextInput
                            label="Resume Title"
                            value={newResumeTitle}
                            onChangeText={setNewResumeTitle}
                            style={{ marginBottom: 10 }}
                        />
                        <Button icon="attachment" mode="outlined" onPress={handlePickFile} style={{ marginBottom: 10 }}>
                            {fileToUpload ? fileToUpload.name : "Choose PDF File"}
                        </Button>
                        <Button icon="upload" mode="contained" onPress={handleUpload} loading={uploading} disabled={uploading}>
                            Upload
                        </Button>
                    </Card.Content>
                </Card>

                <Text variant="headlineSmall" style={styles.listTitle}>Danh sách CV của bạn</Text>
                
                {loading ? <ActivityIndicator /> : (
                    <FlatList
                        data={resumes}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có CV nào.</Text>}
                    />
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    uploadCard: { marginBottom: 20 },
    listTitle: { marginVertical: 10, textAlign: 'center' },
    card: { marginVertical: 5 },
    emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
    cardActions: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
    }
});

export default ResumeManagement;