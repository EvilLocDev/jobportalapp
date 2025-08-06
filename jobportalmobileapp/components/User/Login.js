import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useContext, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/Contexts";

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
                    client_id: 'rMOa7XeLXYqdOr2LaM2NQqg7lSXxfx4CMkSL2Tii',
                    client_secret: 'zYhQTkGW40tppegfft68eQ6hQXx2RyH0D7FyAx5a9oMapzGDiunwb6SuCSmnYwz1pbYzneRgeu8XqKVwS2jmthfAv5kLuobFqZYCTatx2NuqzYbJyyr0Tw4avMBEZMbs',
                    grant_type: 'password'
                });
                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);

                dispatch({
                    "type": "login",
                    "payload": u.data
                });

            } catch (ex) {
                console.error(ex);
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