import {createNativeStackNavigator} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import Applications from "./components/Home/Applications"
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import { Icon } from "react-native-paper";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="home" component={Home} options={{title: "Company list"}}/>
            <Stack.Screen name="applications" component={Applications} options={{title: "Applications list"}}/>
        </Stack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{headerShown: true}}>
            <Tab.Screen name="index" component={StackNavigator} options={{tabBarIcon: () => <Icon size={30} source="home" />}} />
            <Tab.Screen name="login" component={Login} options={{tabBarIcon: () => <Icon size={30} source="account" />}} />
            <Tab.Screen name="register" component={Register} options={{tabBarIcon: () => <Icon size={30} source="account-plus-outline" />}} />
        </Tab.Navigator>
    );
}

const App = () => {
    return (
        <NavigationContainer>
            <TabNavigator/>
        </NavigationContainer>
    );
}

export default App;