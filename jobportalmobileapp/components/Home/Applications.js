import MyStyles from "../../styles/MyStyles";
import {ActivityIndicator, FlatList, Image, TouchableOpacity, View} from "react-native";
import {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {List} from "react-native-paper";
import Apis, {endpoints} from "../../configs/Apis";

const Applications = ({route}) => {
    const jobId = route.params?.jobId;
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const loadApplications = async () => {
        try {
            setLoading(true);

            let res = await Apis.get(endpoints['applications'](jobId));
            setApplications(res.data);

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadApplications();
    }, [jobId]);

    return (
      <View>
          <FlatList ListFooterComponent={loading && <ActivityIndicator />} data={applications}
                                  renderItem={({item}) => <List.Item key={`Application${item.id}`} title={item.title}
                                                                description={item.created_date}
                                                                left={() => <TouchableOpacity onPress={() => nav.navigate('application-details', {'applicationId': item.id})}>
                                                                    <Image style={MyStyles.avatar} source={{uri: item.candidate?.profile?.avatar}} />
                                                                </TouchableOpacity>} />} />
      </View>
    );
}

export default Applications;