import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useContext, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext, SavedJobsDispatchContext } from "../../configs/Contexts";

const Login = () => {
    const info = [{
        label: 'Username',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Password',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState();
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);
    const savedJobsDispatch = useContext(SavedJobsDispatchContext); // Lấy dispatch cho saved jobs

    const setState = (value, field) => {
        setUser({...user, [field]: value})
    }

    const validate = () => {
        if (Object.values(user).length == 0) {
            setMsg("Please inform your information!");
            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Please inform your ${i.label}!`);
                return false;
            }

        setMsg('');
        return true;
    }

    const login = async () => {
        if (validate() === true) {
            try {
                setLoading(true);


                let res = await Apis.post(endpoints['login'], {
                    ...user,
                    client_id: 'oPE1IbyrWjHGbX5MB6VrgtzDEvLMWm4mWQqrmu5o',
                    client_secret: 'ROSmb7qEVGddhEwlT0Af2x4iyqMGyeMz99GOPcXjGfb7rxWzMNmX4wepq5Unq2ETW5dghktcje3UyQQeaSKFGmcDAu61AZNW1eLjiCQqnBRzBvafuNUYdwh9GLd4BycX',
                    grant_type: 'password'
                });

                const accessToken = res.data.access_token;
                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);

                const finalUserObject = {
                    ...u.data,
                    "access_token": accessToken
                };

                dispatch({
                    "type": "login",
                    "payload": finalUserObject
                });

                const savedJobsRes = await authApis(accessToken).get(endpoints['saved-jobs']);
                const jobs = savedJobsRes.data.map(sj => sj.job);
                savedJobsDispatch({
                    type: "set",
                    payload: jobs
                });

            } catch (ex) {
                console.log('error:', ex);
                lert.alert("Error", "Hay nhap dung username va password");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <ScrollView>
            <HelperText type="error" visible={msg}>
                {msg}
            </HelperText>

            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={user[i.field]} onChangeText={t => setState(t, i.field)} />)}



            <Button onPress={login} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Login</Button>
        </ScrollView>
    )
}

export default Login;