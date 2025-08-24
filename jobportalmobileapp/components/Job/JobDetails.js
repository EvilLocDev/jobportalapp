import { useEffect, useState, useContext } from "react";
import { ScrollView, ActivityIndicator, useWindowDimensions, View, Image, Alert } from "react-native";
import { Card, Text, IconButton, Button } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import Styles from "./Styles";
import { MyUserContext, SavedJobsContext, SavedJobsDispatchContext } from "../../configs/Contexts";
import ApplyJob from "../Application/ApplyJob";

const JobDetails = ({ route }) => {
    const [job, setJob] = useState(null);
    const [isApplyModalVisible, setApplyModalVisible] = useState(false);
    const jobId = route.params?.jobId;
    const { width } = useWindowDimensions();
    const nav = useNavigation();

    // Consumer
    const user = useContext(MyUserContext);
    const savedJobs = useContext(SavedJobsContext);
    const savedJobsDispatch = useContext(SavedJobsDispatchContext);

    const loadJobDetails = async () => {
        try {
            console.log("Loading job details for jobId:", jobId);
            let api = Apis;
            if (user && user.access_token) {
                api = authApis(user.access_token);
            }
            let res = await api.get(endpoints['job-details'](jobId));
            setJob(res.data);
        } catch (ex) {
            console.error("Failed to load job details:", ex);
        }
    }

    useEffect(() => {
        if (jobId) {
            loadJobDetails();
        }
    }, [jobId, user]);


    const handleSaveJob = async () => {
        try {
            const api = authApis(user.access_token);
            const res = await api.post(endpoints['save-job'](jobId));
            const updatedJob = res.data;

            setJob(updatedJob);

            if (updatedJob.is_saved) {
                savedJobsDispatch({ type: "add", payload: updatedJob });
                Alert.alert("Thành công", "Đã lưu công việc!");
            } else {
                savedJobsDispatch({ type: "remove", payload: updatedJob });
                Alert.alert("Thành công", "Đã bỏ lưu công việc!");
            }
        } catch (ex) {
            console.error("Failed to save job:", ex);
            Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    if (job === null) {
        return (
            <View style={Styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 16, color: '#6c757d' }}>Đang tải thông tin công việc...</Text>
            </View>
        );
    }

    return (
        <View style={Styles.container}>
            <ScrollView style={Styles.scrollView} showsVerticalScrollIndicator={false}>
                <Card style={Styles.card}>
                    <Card.Cover
                        source={{ uri: job.company?.logo || 'https://via.placeholder.com/400x200?text=Company+Logo' }}
                        style={Styles.cardCover}
                    />

                    <View style={Styles.logoContainer}>
                        <Image
                            source={{ uri: job.company?.logo || 'https://via.placeholder.com/80x80?text=Logo' }}
                            style={Styles.companyLogo}
                        />
                    </View>

                    <Card.Content style={Styles.cardContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[Styles.jobTitle, { flex: 1 }]}>{job.title}</Text>

                            {user && user.profile.user_type === 'candidate' && (
                                // Bọc cả hai nút trong một thẻ chung (React Fragment)
                                <>
                                    <IconButton
                                        icon={job?.is_saved ? "bookmark" : "bookmark-outline"}
                                        iconColor={job?.is_saved ? "#007bff" : "#6c757d"}
                                        size={30}
                                        onPress={handleSaveJob}
                                    />

                                    <View style={{ padding: 10 }}>
                                        <Button
                                            icon="send"
                                            mode="contained"
                                            onPress={() => setApplyModalVisible(true)}
                                            style={{ backgroundColor: '#007bff' }}
                                        >
                                            Apply Now
                                        </Button>
                                    </View>
                                </>
                            )}

                            {job && (
                                <ApplyJob
                                    visible={isApplyModalVisible}
                                    onClose={() => setApplyModalVisible(false)}
                                    jobId={job.id}
                                    jobTitle={job.title}
                                    navigation={nav}
                                />
                            )}
                        </View>

                        <View style={Styles.companyInfo}>
                            <Text style={Styles.companyName}>
                                Company name: {job.company?.name || 'Company Name Not Available'}
                            </Text>
                        </View>

                        <Text style={Styles.jobLocation}>
                            Location: {job.location || 'Location not specified'}
                        </Text>

                        <Text style={Styles.jobSalary}>
                            Salary: {job.salary || 'Salary not specified'}
                        </Text>

                        <View style={Styles.descriptionContainer}>
                            <Text style={Styles.descriptionTitle}>Job Description</Text>
                            <RenderHTML
                                source={{ html: job.description || '<p>No Description</p>' }}
                                contentWidth={width - 40}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>


        </View>
    );
}

export default JobDetails;