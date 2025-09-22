import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { authApis, endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';
import { List } from 'react-native-paper';
import MyStyles from '../../styles/MyStyles';

const RecommendedJobs = () => {
    const user = useContext(MyUserContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigation();

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            if (user && user.access_token) {
                try {
                    const res = await authApis(user.access_token).get(endpoints['recommendations']);
                    console.log('API /recommendations/ response:', JSON.stringify(res.data, null, 2));
                    setJobs(res.data);
                } catch (ex) {
                    console.log("Failed to fetch recommended jobs:", ex);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchRecommendedJobs();
    }, [user]);

    const parseFitAnalysis = (fitAnalysisArray) => {
        if (!Array.isArray(fitAnalysisArray)) return null;

        const contentItem = fitAnalysisArray.find(([key]) => key === 'content');
        if (!contentItem || !contentItem[1]) return null;

        const raw = contentItem[1].replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.log('Failed to parse fit_analysis content:', e, raw);
            return null;
        }
    };

    if (loading) {
        return <ActivityIndicator style={styles.centered} size="large" color="#0000ff" />;
    }

    const renderJob = ({ item }) => {
        const { job, fit_analysis } = item;
        const analysis = parseFitAnalysis(fit_analysis);

        return (
            <View style={styles.jobCard}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {/* Mô tả trong JSON có HTML -> có thể cần thư viện render HTML,
            tạm thời hiển thị plain text hoặc cắt bớt */}
                <Text style={styles.jobDescription}>
                    {job.location} | {job.job_type} | Lương: ${job.salary}
                </Text>

                {analysis ? (
                    <View style={styles.fitAnalysis}>
                        <Text style={styles.label}>
                            Fit Score: <Text style={styles.value}>{analysis.fit_score}</Text>
                        </Text>
                        <Text style={styles.label}>
                            Kỹ năng phù hợp:{' '}
                            <Text style={styles.value}>
                                {analysis.matching_skills?.join(', ') || 'Không có'}
                            </Text>
                        </Text>
                        <Text style={styles.label}>
                            Kỹ năng còn thiếu:{' '}
                            <Text style={styles.value}>
                                {analysis.missing_skills?.join(', ') || 'Không có'}
                            </Text>
                        </Text>
                        <Text style={styles.label}>
                            Giải thích: <Text style={styles.value}>{analysis.summary}</Text>
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.label}>Không có phân tích phù hợp</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={jobs}
                keyExtractor={(item, idx) => item.job.id.toString() + idx}
                renderItem={renderJob}
                ListEmptyComponent={
                    <Text style={styles.centeredText}>Hiện chưa có gợi ý công việc.</Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

export default RecommendedJobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  fitAnalysis: {
    marginTop: 8,
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  value: {
    fontWeight: '400',
  },
});