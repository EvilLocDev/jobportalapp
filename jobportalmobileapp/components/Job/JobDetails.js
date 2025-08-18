import { useEffect, useState, useContext } from "react";
import { ScrollView, ActivityIndicator, useWindowDimensions, View, Image, Alert } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import Styles from "./Styles";
import { MyUserContext, SavedJobsContext, SavedJobsDispatchContext } from "../../configs/Contexts";

const JobDetails = ({route}) => {
    const [job, setJob] = useState(null);
    const jobId = route.params?.jobId;
    const { width } = useWindowDimensions();

    // Consumer
    const user = useContext(MyUserContext);
    const savedJobs = useContext(SavedJobsContext);
    const savedJobsDispatch = useContext(SavedJobsDispatchContext);

    const loadJobDetails = async () => {
        try {
            // Nếu user đã đăng nhập, dùng authApis để lấy trạng thái is_saved
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

    // Hàm xử lý lưu/bỏ lưu công việc
    const handleSaveJob = async () => {
        console.log("Handling save job for jobId:", user);
        if (!user) {
            Alert.alert("Thông báo", "Bạn cần đăng nhập để thực hiện chức năng này.");
            return;
        }

        try {
            const api = authApis(user.access_token);
            await api.post(endpoints['save-job'](jobId));
            
            // Kiểm tra xem công việc đã được lưu trước đó chưa
            const isCurrentlySaved = savedJobs.some(savedJob => savedJob.id === job.id);
            
            if (isCurrentlySaved) {
                // Nếu đã lưu -> thực hiện bỏ lưu
                savedJobsDispatch({ type: "remove", payload: job });
                Alert.alert("Successful", "Unsave successful!");
            } else {
                // Nếu chưa lưu -> thực hiện lưu
                savedJobsDispatch({ type: "add", payload: job });
                Alert.alert("Successful", "Save successful!");
            }
        } catch (ex) {
            console.error("Failed to save job:", ex);
            Alert.alert("Error", "An error occurred. Please try again.");
        }
    };

    // Xác định trạng thái đã lưu hay chưa từ global state
    const isSaved = job ? savedJobs.some(savedJob => savedJob.id === job.id) : false;

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
                            {/* Nút lưu chỉ hiển thị cho ứng viên đã đăng nhập */}
                            {user && user.profile.user_type === 'candidate' && (
                                <IconButton
                                    icon={isSaved ? "bookmark" : "bookmark-outline"}
                                    iconColor={isSaved ? "#007bff" : "#6c757d"}
                                    size={30}
                                    onPress={handleSaveJob}
                                />
                            )}
                        </View>
                        
                        <View style={Styles.companyInfo}>
                            <Text style={Styles.companyName}>
                                {job.company?.name || 'Company Name Not Available'}
                            </Text>
                        </View>
                        
                        <Text style={Styles.jobLocation}>
                            �� {job.location || 'Location not specified'}
                        </Text>
                        
                        <Text style={Styles.jobSalary}>
                            💰 {job.salary || 'Salary not specified'}
                        </Text>

                        <View style={Styles.descriptionContainer}>
                            <Text style={Styles.descriptionTitle}>📋 Mô tả công việc</Text>
                            <RenderHTML 
                                source={{html: job.description || '<p>No Description</p>'}} 
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