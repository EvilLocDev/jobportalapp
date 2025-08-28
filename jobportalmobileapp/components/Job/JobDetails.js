import { useEffect, useState, useContext } from "react";
import { ScrollView, ActivityIndicator, useWindowDimensions, View, Image, Alert } from "react-native";
import { Card, Text, IconButton, Button, Modal, Portal, Provider, Chip, ProgressBar } from "react-native-paper";
import { MyUserContext, SavedJobsContext, SavedJobsDispatchContext, JobFitContext, JobFitDispatchContext } from "../../configs/Contexts";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import RenderHTML from "react-native-render-html";
import Styles from "./Styles";

import ApplyJob from "../Application/ApplyJob";

const JobDetails = ({ route }) => {
    const [job, setJob] = useState(null);
    const [isApplyModalVisible, setApplyModalVisible] = useState(false);
    const [jobFitModalVisible, setJobFitModalVisible] = useState(false);

    const jobId = route.params?.jobId;
    const { width } = useWindowDimensions();
    const nav = useNavigation();

    // Consumer
    const user = useContext(MyUserContext);
    const savedJobs = useContext(SavedJobsContext);
    const savedJobsDispatch = useContext(SavedJobsDispatchContext);
    const jobFitState = useContext(JobFitContext);
    const jobFitDispatch = useContext(JobFitDispatchContext);

    const handleCheckFit = async () => {
        setJobFitModalVisible(true);
        jobFitDispatch({ type: "check_start" });

        try {
            const api = authApis(user.access_token);
            const res = await api.post(endpoints['calculate-job-fit'](jobId));
            jobFitDispatch({ type: "check_success", payload: res.data });
        } catch (ex) {
            const errorMessage = ex.response?.data?.detail || "An error occurred.";
            jobFitDispatch({ type: "check_error", payload: errorMessage });
            console.error("Failed to check job fit:", ex);
        }
    };

    const closeJobFitModal = () => {
        setJobFitModalVisible(false);
        // Tùy chọn: Xóa state cũ khi đóng modal
        jobFitDispatch({ type: "clear" });
    };

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
            console.log("Failed to load job details:", ex);
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
        <Provider>

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
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Button
                                            icon="chart-donut"
                                            mode="outlined"
                                            onPress={handleCheckFit}
                                            style={{ marginRight: 8 }}
                                        >
                                            Check Fit
                                        </Button>

                                        <IconButton
                                            icon={job?.is_saved ? "bookmark" : "bookmark-outline"}
                                            iconColor={job?.is_saved ? "#007bff" : "#6c757d"}
                                            size={30}
                                            onPress={handleSaveJob}
                                        />

                                        <Button
                                            icon="send"
                                            mode="contained"
                                            onPress={() => setApplyModalVisible(true)}
                                            style={{ backgroundColor: '#007bff' }}
                                        >
                                            Apply Now
                                        </Button>
                                    </View>
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
                
                <Portal>
                    <Modal visible={jobFitModalVisible} onDismiss={closeJobFitModal} contentContainerStyle={Styles.modalContainer}>
                        <ScrollView>
                            <Text style={Styles.modalTitle}>Job Fit Analysis</Text>
                            {jobFitState.loading && <ActivityIndicator style={{ marginVertical: 20 }} />}
                            
                            {jobFitState.error && <Text style={{ color: 'red', textAlign: 'center' }}>{jobFitState.error}</Text>}

                            {jobFitState.data && (
                                <View>
                                    <Text style={Styles.fitScoreText}>Fit Score: {jobFitState.data.fit_score}/100</Text>
                                    <ProgressBar progress={jobFitState.data.fit_score / 100} color="#007bff" style={{ marginVertical: 10 }}/>

                                    <Text style={Styles.sectionTitle}>Summary</Text>
                                    <Text style={Styles.summaryText}>{jobFitState.data.summary}</Text>

                                    <Text style={Styles.sectionTitle}>Matching Skills</Text>
                                    <View style={Styles.chipContainer}>
                                        {jobFitState.data.matching_skills.map(skill => <Chip key={skill} style={Styles.chip} icon="check-circle">{skill}</Chip>)}
                                    </View>

                                    <Text style={Styles.sectionTitle}>Missing Skills</Text>
                                    <View style={Styles.chipContainer}>
                                        {jobFitState.data.missing_skills.map(skill => <Chip key={skill} style={Styles.chipMissing} icon="alert-circle-outline">{skill}</Chip>)}
                                    </View>
                                </View>
                            )}

                            <Button onPress={closeJobFitModal} style={{ marginTop: 20 }}>Close</Button>
                        </ScrollView>
                    </Modal>
                </Portal>

            </View>

        </Provider>
    );
}

const Styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    fitScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#007bff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 4,
        backgroundColor: '#e0f7fa',
    },
    chipMissing: {
        margin: 4,
        backgroundColor: '#ffebee',
    }
});

export default JobDetails;