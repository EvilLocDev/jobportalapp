import MyStyles from "../../styles/MyStyles";
import {useEffect, useState} from "react";
import Apis, {endpoints} from "../../configs/Apis";
import {Chip} from "react-native-paper";
import {Text, View} from "react-native";

const Home = () => {
    const [companies, setCompanies] = useState([]);

    const loadCompanies = async () => {
        let res = await Apis.get(endpoints['companies']);
        setCompanies(res.data);
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.subject}>COMPANY LIST</Text>
            <View style={[MyStyles.row, MyStyles.wrap]}>
                {companies.map(c => <Chip icon="label" style={MyStyles.m} key={c.id}>{c.name}</Chip>)}
            </View>
        </View>
    );
}

export default Home;