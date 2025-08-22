import {useEffect, useState} from "react";
import Apis, {endpoints} from "../../configs/Apis";
import {ActivityIndicator, ScrollView, Text} from "react-native";
import {Button, Card} from "react-native-paper";

const ApplicationDetails = ({route}) => {
    const [application, setApplication] = useState(null)
    const applicationId = route.params?.applicationId

    const loadApplication = async () => {
        let res = await Apis.get(endpoints['application-details'](applicationId));
        setApplication(res.data);
    }

    useEffect(() => {
        loadApplication();
    }, [applicationId]);

    return (
        <ScrollView>
            {application == null ? <ActivityIndicator/> : <>
                <Card>
                    <Card.Title title={application.candidate.username}/>
                    <Card.Cover source={{uri: application.candidate.avatar}}/>
                    <Card.Content>
                        <Text variant="bodyMedium">{application.status}</Text>
                    </Card.Content>
                    <Card.Actions>
                        <Button>Reject</Button>
                        <Button>Interview</Button>
                    </Card.Actions>
                </Card>
            </>}

        </ScrollView>
    )
}

export default ApplicationDetails;