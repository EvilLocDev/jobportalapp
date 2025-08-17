import { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, useWindowDimensions, View, Image } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import Apis, { endpoints } from "../../configs/Apis";
import Styles from "./Styles";

const JobDetails = ({route}) => {
    const [job, setJob] = useState(null);
    const jobId = route.params?.jobId;
    const { width } = useWindowDimensions();

    const loadJobDetails = async () => {
        try {
            let res = await Apis.get(endpoints['job-details'](jobId));
            setJob(res.data);
        } catch (ex) {
            console.error("Failed to load job details:", ex);
        }
    }

    useEffect(() => {
        if (jobId) {
            loadJobDetails();
        }
    }, [jobId]);

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
                        <Text style={Styles.jobTitle}>{job.title}</Text>
                        
                        <View style={Styles.companyInfo}>
                            <Text style={Styles.companyName}>
                                {job.company?.name || 'Công ty'}
                            </Text>
                        </View>
                        
                        <Text style={Styles.jobLocation}>
                            �� {job.location || 'Địa điểm không xác định'}
                        </Text>
                        
                        <Text style={Styles.jobSalary}>
                            💰 {job.salary || 'Lương thỏa thuận'}
                        </Text>

                        <View style={Styles.descriptionContainer}>
                            <Text style={Styles.descriptionTitle}>📋 Mô tả công việc</Text>
                            <RenderHTML 
                                source={{html: job.description || '<p>Không có mô tả</p>'}} 
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