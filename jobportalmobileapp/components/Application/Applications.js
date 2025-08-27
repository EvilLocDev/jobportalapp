import MyStyles from "../../styles/MyStyles";
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { List, Text } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";

const Applications = ({ route }) => {
    const { jobId, jobTitle } = route.params;
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const user = useContext(MyUserContext);

    const loadApplications = async () => {
        if (!user || !jobId) return;

        try {
            setLoading(true);
            let res = await authApis(user.access_token).get(endpoints['job-applications'](jobId));
            setApplications(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadApplications();
    }, [jobId]);

    const renderItem = ({ item }) => (
        <List.Item
            key={`Application${item.id}`}
            title={item.candidate.username}
            description={`Trạng thái: ${item.status}\nApply date: ${new Date(item.created_date).toLocaleDateString()}`}
            descriptionNumberOfLines={2}
            left={() => <Image style={MyStyles.avatar} source={{ uri: item.candidate.avatar }} />}
            onPress={() => nav.navigate('ApplicationDetails', { 'applicationId': item.id })}
        />
    );

    return (
        <View style={MyStyles.container}>
            {loading && <ActivityIndicator />}
            {!loading && applications.length === 0 && <Text style={{textAlign: 'center', marginTop: 20}}>No candidate apply.</Text>}
            <FlatList
                data={applications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
}

export default Applications;