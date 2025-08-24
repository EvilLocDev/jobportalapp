import { useContext, useReducer, useEffect } from "react"; // Thêm useEffect

import { MyDispatchContext, MyUserContext, SavedJobsContext, SavedJobsDispatchContext } from "./configs/Contexts";
import MyUserReducer from "./reducers/MyUserReducer";
import SavedJobsReducer from "./reducers/SavedJobsReducer";
import { authApis, endpoints } from "./configs/Apis"; // Import authApis và endpoints

import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import ChangePassword from "./components/User/ChangePassword";
import JobDetails from "./components/Job/JobDetails";
import SaveJobs from "./components/User/SaveJobs";
import ResumeManagement from "./components/Resume/ResumeManagement";

import CreateCompany from "./components/Company/CreateCompany";
import CreateJob from "./components/Job/CreateJob";
import MyCompanies from "./components/Company/MyCompanies";
import CompanyJobManagement from "./components/Job/CompanyJobManagement";

import "./styles/globals.css"

import { Icon, PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const EmployerStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="ProfileInfo" component={Profile} options={{ title: "Thông tin cá nhân" }} />
            <ProfileStack.Screen name="ChangePassword" component={ChangePassword} options={{ title: "Đổi mật khẩu" }} />
            <ProfileStack.Screen name="ResumeManagement" component={ResumeManagement} options={{ title: "Quản lý CV" }} />
        </ProfileStack.Navigator>
    );
}

const EmployerStackNavigator = () => {
    return (
        <EmployerStack.Navigator>
            <EmployerStack.Screen 
                name="MyCompanies" 
                component={MyCompanies} 
                options={{ title: "Quản lý công ty" }} 
            />
            <EmployerStack.Screen 
                name="CreateCompany" 
                component={CreateCompany} 
                options={{ title: "Tạo Công Ty Mới" }} 
            />
            <EmployerStack.Screen 
                name="CompanyJobManagement" 
                component={CompanyJobManagement} 
                options={({ route }) => ({ title: `Việc làm tại ${route.params?.companyName}` })}
            />
            <EmployerStack.Screen 
                name="CreateJob" 
                component={CreateJob} 
                options={{ title: "Đăng Tin Mới" }} 
            />
        </EmployerStack.Navigator>
    );
}

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="home" component={Home} options={{ title: "Danh sách công ty" }} />
            <Stack.Screen name="job-details" component={JobDetails} options={{ title: "Chi tiết công việc" }} />
        </Stack.Navigator>
    )
};

const TabNavigator = () => {
    const user = useContext(MyUserContext);


    return (
        <Tab.Navigator>
            <Tab.Screen name="index" component={StackNavigator} options={{
                headerShown: false,
                title: "Trang chủ",
                tabBarIcon: () => <Icon size={30} source="home" />
            }} />

            {user === null ? <>
                <Tab.Screen name="login" component={Login}
                    options={{ title: "Đăng nhập", tabBarIcon: () => <Icon size={30} source="account" /> }} />
                <Tab.Screen name="register" component={Register}
                    options={{ title: 'Đăng ký', tabBarIcon: () => <Icon size={30} source="account-plus-outline" /> }} />
            </> : <>
                <Tab.Screen 
                    name="profile" 
                    component={ProfileStackNavigator}
                    options={{ 
                        headerShown: false,
                        title: "Tài khoản", 
                        tabBarIcon: () => <Icon size={30} source="account" /> 
                    }} 
                />

                {user.profile?.user_type === 'candidate' && (
                    <Tab.Screen name="save-job-list" component={SaveJobs}
                        options={{ title: "Việc đã lưu", tabBarIcon: () => <Icon size={30} source="folder" /> }} 
                    />
                )}

                {user.profile?.user_type === 'employer' && (
                    <Tab.Screen
                        name="employer-stack"
                        component={EmployerStackNavigator}
                        options={{
                            headerShown: false,
                            title: "Quản lý",
                            tabBarIcon: () => <Icon size={30} source="briefcase" />
                        }}
                    />
                )}

            </>}

        </Tab.Navigator>
    );
}

const App = () => {
    const [user, dispatch] = useReducer(MyUserReducer, null);
    const [savedJobs, savedJobsDispatch] = useReducer(SavedJobsReducer, []);

    console.log("App user state:", user);

    useEffect(() => {
        const loadSavedJobs = async () => {
            try {
                let res = await authApis(user.access_token).get(endpoints['saved-jobs']);
                const jobs = res.data.map(item => item.job);
                
                savedJobsDispatch({
                    type: "set",
                    payload: jobs
                });
            } catch (ex) {
                console.error("Lỗi khi tải danh sách việc đã lưu:", ex);
                savedJobsDispatch({ type: "set", payload: [] });
            }
        };

        if (user) {
            loadSavedJobs();
        } else {
            savedJobsDispatch({ type: "set", payload: [] });
        }
    }, [user]);

    return (
        <PaperProvider>
            <MyUserContext.Provider value={user}>
                <MyDispatchContext.Provider value={dispatch}>

                    <SavedJobsContext.Provider value={savedJobs}>
                        <SavedJobsDispatchContext.Provider value={savedJobsDispatch}>
                            <NavigationContainer>
                                <TabNavigator />
                            </NavigationContainer>
                        </SavedJobsDispatchContext.Provider>
                    </SavedJobsContext.Provider>

                </MyDispatchContext.Provider>
            </MyUserContext.Provider>
        </PaperProvider>

    );
}

export default App;