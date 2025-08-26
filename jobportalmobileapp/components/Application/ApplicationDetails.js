import React, { useEffect, useState, useContext } from "react";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import { ActivityIndicator, ScrollView, View, Alert } from "react-native";
import * as WebBrowser from 'expo-web-browser'; 
import { Button, Avatar, Card, Text, Chip, Divider } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";

const ApplicationDetails = ({ route }) => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(false);
    const applicationId = route.params?.applicationId;
    const user = useContext(MyUserContext);

    const loadApplication = async () => {
        if (!user || !applicationId) return;
        setLoading(true);
        try {
            let res = await authApis(user.access_token).get(endpoints['application-details'](applicationId));
            setApplication(res.data);
        } catch (ex) {
            console.log("Failed to load application details:", ex);
            Alert.alert("Error", "Cannot loading application details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplication();
    }, [applicationId]);

    const handleUpdateStatus = async (newStatus) => {
        Alert.alert(
            "Confirm",
            `Are you sure to updating to the status "${newStatus}"?`,
            [
                { text: "Cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            const res = await authApis(user.access_token).patch(
                                endpoints['update-application-status'](applicationId),
                                { status: newStatus }
                            );
                            setApplication(res.data);
                            Alert.alert("Successfully", "Update status successfully.");
                        } catch (ex) {
                            console.log("Failed to update status:", ex);
                            Alert.alert("Error", "Update status failed.");
                        }
                    }
                }
            ]
        );
    };

    const handleViewResume = async (resume) => {
        if (!resume?.file) {
            Alert.alert("Error", "Cannot find the resume.");
            console.log("No resume file URL provided:", resume);
            return;
        }

        try {
            if (application.status === 'pending') {
                const res = await authApis(user.access_token).post(
                    endpoints['review-application'](applicationId)
                );
                setApplication(res.data);
            }
        } catch (ex) {
            console.log("Failed to auto-update status to reviewed:", ex);
        }

        await WebBrowser.openBrowserAsync(resume.file);
    };

    if (loading) return <ActivityIndicator style={MyStyles.margin} />;
    if (!application) return <Text style={{textAlign: 'center', marginTop: 20}}>No apply information.</Text>;

    return (
        <ScrollView style={MyStyles.container}>
            <Card style={MyStyles.margin}>
                <Card.Title
                    title={application.candidate.username}
                    subtitle={`${application.candidate.first_name} ${application.candidate.last_name}`}
                    left={(props) => <Avatar.Image {...props} source={{ uri: application.candidate.avatar }} />}
                />
                <Card.Content>
                    <Chip icon="briefcase" style={MyStyles.margin}>Application status: {application.status}</Chip>
                    <Divider style={MyStyles.margin} />
                    <Button 
                        icon="file-pdf-box" 
                        mode="contained"
                        onPress={() => handleViewResume(application.resume)}
                    >
                        View Resume
                    </Button>
                </Card.Content>

                {!['accepted', 'rejected', 'withdrawn'].includes(application.status) && (
                    <View>
                        <Divider style={MyStyles.margin} />
                        <Text style={{ ...MyStyles.subject, marginLeft: 16 }}>Update application status</Text>
                        <Card.Actions style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {application.status !== 'reviewed' && <Button onPress={() => handleUpdateStatus('reviewed')}>Reviewed</Button>}
                            {application.status !== 'accepted' && <Button onPress={() => handleUpdateStatus('accepted')}>Accepted</Button>}
                            {application.status !== 'rejected' && <Button onPress={() => handleUpdateStatus('rejected')}>Rejected</Button>}
                        </Card.Actions>
                    </View>
                )}
            </Card>
        </ScrollView>
    );
};

export default ApplicationDetails;