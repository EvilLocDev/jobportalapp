import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import Applications from "./components/Home/Applications"
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import {Icon} from "react-native-paper";
import Profile from "./components/User/Profile";
import {useContext, useReducer} from "react";
import {MyDispatchContext, MyUserContext} from "./configs/Contexts";
import MyUserReducer from "./reducers/MyUserReducer";
import ApplicationDetails from "./components/Home/ApplicationDetails";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="home" component={Home} options={{title: "Company list"}}/>
            <Stack.Screen name="applications" component={Applications} options={{title: "Applications list"}}/>
            <Stack.Screen name="application-details" component={ApplicationDetails} options={{title:"Application detail"}}/>
        </Stack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const user = useContext(MyUserContext);
    return (
        <Tab.Navigator>
            <Tab.Screen name="index" component={StackNavigator} options={{
                headerShown: false,
                title: "Company List",
                tabBarIcon: () => <Icon size={30} source="home"/>
            }}/>

            {user === null ? <>
                <Tab.Screen name="login" component={Login}
                            options={{title: "Login", tabBarIcon: () => <Icon size={30} source="account"/>}}/>
                <Tab.Screen name="register" component={Register} options={{
                    title: 'Register',
                    tabBarIcon: () => <Icon size={30} source="account-plus-outline"/>
                }}/>
            </> : <>
                <Tab.Screen name="profile" component={Profile}
                            options={{title: "Account", tabBarIcon: () => <Icon size={30} source="account"/>}}/>
            </>}


        </Tab.Navigator>
    );
}

const App = () => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    return (
        <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}>
                <NavigationContainer>
                    <TabNavigator/>
                </NavigationContainer>
            </MyDispatchContext.Provider>
        </MyUserContext.Provider>
    );
}

export default App;