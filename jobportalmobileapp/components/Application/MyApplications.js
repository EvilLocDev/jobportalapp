import React, { useContext } from "react";
import { FlatList, View, Alert } from "react-native";
import { MyApplicationsContext, MyApplicationsDispatchContext, MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import { List, Button, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";

const MyApplications = () => {
    const user = useContext(MyUserContext);
    const applications = useContext(MyApplicationsContext);
    const dispatch = useContext(MyApplicationsDispatchContext);

    const handleWithdraw = (applicationId) => {
        Alert.alert(
            "Confirm",
            "Do you really wan to withdraw this application?",
            [
                { text: "Cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            const res = await authApis(user.access_token).post(
                                endpoints['withdraw-application'](applicationId)
                            );
                            
                            dispatch({ type: "update", payload: res.data });
                            Alert.alert("Successfully", "You withdraw apply successfully.");
                        } catch (ex) {
                            console.log("Withdraw failed:", ex);
                            Alert.alert("Error", ex.response?.data?.detail || "Cannot withdraw apply.");
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={item.job.title}
            description={`Company: ${item.job.company.name}\nStatus: ${item.status}`}
            descriptionNumberOfLines={2}
            right={() => (
                ['pending', 'reviewed'].includes(item.status) && (
                    <Button 
                        style={{ alignSelf: 'center', marginRight: 10 }}
                        onPress={() => handleWithdraw(item.id)}
                    >
                        Withdraw
                    </Button>
                )
            )}
        />
    );

    return (
        <View style={MyStyles.container}>
             {applications.length === 0 && <Text style={{textAlign: 'center', marginTop: 20}}>You have not any application yet.</Text>}
            <FlatList
                data={applications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

export default MyApplications;