import {TouchableOpacity, ScrollView, Text, Image} from "react-native";
import {Button, HelperText, TextInput} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import MyStyles from "../../styles/MyStyles";
import {useState} from "react";
import Apis, {endpoints} from "../../configs/Apis";
import {useNavigation} from "@react-navigation/native";

const Register = () => {
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
    }, {
        label: 'Confirm your password',
        field: 'confirm',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'First name',
        field: 'first_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Last name',
        field: 'last_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Email',
        field: 'email',
        icon: 'email',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState();
    const nav = useNavigation();

    const setState = (value, field) => {
        setUser({...user, [field]: value})
    }

    const picker = async () => {
        let {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled)
                setState(result.assets[0], 'avatar');
        }
    }

    const validate = () => {
        if (Object.values(user).length == 0) {
            setMsg("Please, inform your information!");
            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Please, inform your ${i.label}!`);
                return false;
            }

        if (user.password && user.password !== user.confirm) {
            setMsg("Password is incorect!");
            return false;
        }

        setMsg('');
        return true;
    }

    const register = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                let form = new FormData();
                for (let key in user)
                    if (key !== 'confirm') {
                        if (key === 'avatar') {
                            console.info(Math.random());
                            form.append('avatar', {
                                uri: user.avatar?.uri,
                                name: user.avatar?.fileName || "avatar.jpg",
                                type: user.avatar?.type?.includes("image") ? "image/jpeg" : user.avatar?.type || "image/jpeg"
                            })
                        } else
                            form.append(key, user[key]);
                    }

                let res = await Apis.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201)
                    nav.navigate('login');
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

            {info.map(i => <TextInput key={i.field} style={MyStyles.m}
                                      label={i.label}
                                      secureTextEntry={i.secureTextEntry}
                                      right={<TextInput.Icon icon={i.icon}/>}
                                      value={user[i.field]} onChangeText={t => setState(t, i.field)}/>)}

            <TouchableOpacity style={MyStyles.m} onPress={picker}>
                <Text>Choose your avatar...</Text>
            </TouchableOpacity>

            {user?.avatar && <Image source={{uri: user.avatar.uri}} style={[MyStyles.avatar, MyStyles.m]}/>}

            <Button onPress={register} disabled={loading} loading={loading} style={MyStyles.m}
                    mode="contained">Register</Button>
        </ScrollView>
    );
}

export default Register;