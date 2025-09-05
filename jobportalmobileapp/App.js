import { useContext, useReducer, useEffect } from "react";

import { MyDispatchContext, MyUserContext, SavedJobsContext, SavedJobsDispatchContext, MyApplicationsContext, MyApplicationsDispatchContext } from "./configs/Contexts";
import MyUserReducer from "./reducers/MyUserReducer";
import SavedJobsReducer from "./reducers/SavedJobsReducer";
import MyApplicationsReducer from "./reducers/MyApplicationsReducer";
import { authApis, endpoints } from "./configs/Apis";

import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import ChangePassword from "./components/User/ChangePassword";
import JobDetails from "./components/Job/JobDetails";

import RecommendedJobs from "./components/Job/RecommendedJobs";
import SaveJobs from "./components/User/SaveJobs";
import ResumeManagement from "./components/Resume/ResumeManagement";

import Applications from "./components/Application/Applications";
import ApplicationDetails from "./components/Application/ApplicationDetails";
import MyApplications from "./components/Application/MyApplications";

import CreateCompany from "./components/Company/CreateCompany";
import CreateJob from "./components/Job/CreateJob";
import MyCompanies from "./components/Company/MyCompanies";
import CompanyJobManagement from "./components/Job/CompanyJobManagement";
import EditCompany from "./components/Company/EditCompany";
import EditJob from "./components/Job/EditJob";

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
            <ProfileStack.Screen name="ProfileInfo" component={Profile} options={{ title: "Personal infomation" }} />
            <ProfileStack.Screen name="ChangePassword" component={ChangePassword} options={{ title: "Change password" }} />
            <ProfileStack.Screen name="ResumeManagement" component={ResumeManagement} options={{ title: "Resume management" }} />
            <ProfileStack.Screen name="MyApplications" component={MyApplications} options={{ title: "Jobs applied" }} />
            <ProfileStack.Screen name="RecommendedJobs" component={RecommendedJobs} options={{ title: "Recommended Jobs" }} />
        </ProfileStack.Navigator>
    );
}

const EmployerStackNavigator = () => {
    return (
        <EmployerStack.Navigator>
            <EmployerStack.Screen name="MyCompanies" component={MyCompanies} options={{ title: "Company Management" }}/>
            <EmployerStack.Screen name="CreateCompany" component={CreateCompany} options={{ title: "Create New Company" }} />
            <EmployerStack.Screen name="EditCompany" component={EditCompany} options={{ title: "Edit Comapany" }} />
            <EmployerStack.Screen name="CompanyJobManagement" component={CompanyJobManagement} options={({ route }) => ({ title: `Job at ${route.params?.companyName}` })} />
            <EmployerStack.Screen name="CreateJob" component={CreateJob} options={{ title: "Create new Job" }} />
            <EmployerStack.Screen name="EditJob" component={EditJob} options={{ title: "Edit Job" }} />
            <EmployerStack.Screen name="EmployerJobDetail" component={JobDetails} options={{ title: "Job Details" }} />
            <EmployerStack.Screen name="Applications" component={Applications} options={({ route }) => ({ title: `Candidate for: ${route.params?.jobTitle}` })} />
            <EmployerStack.Screen name="ApplicationDetails" component={ApplicationDetails} options={{ title: "Application Details" }} />
        </EmployerStack.Navigator>
    );
}

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="home" component={Home} options={{ title: "Company List" }} />
            <Stack.Screen name="job-details" component={JobDetails} options={{ title: "Job Details" }} />
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
    const [myApplications, myApplicationsDispatch] = useReducer(MyApplicationsReducer, []);

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
                console.log("Error when loading job saved:", ex);
                savedJobsDispatch({ type: "set", payload: [] });
            }
        };

        const loadMyApplications = async () => {
            if (user?.profile?.user_type === 'candidate') {
                try {
                    let res = await authApis(user.access_token).get(endpoints['my-applications']);
                    myApplicationsDispatch({
                        type: "set",
                        payload: res.data
                    });
                } catch (ex) {
                    console.log("Error when loading applied list:", ex);
                }
            }
        };

        if (user) {
            loadSavedJobs();
            loadMyApplications();
        } else {
            savedJobsDispatch({ type: "set", payload: [] });
            myApplicationsDispatch({ type: "set", payload: [] });
        }
    }, [user]);

    return (
        <PaperProvider>
            <MyUserContext.Provider value={user}>
                <MyDispatchContext.Provider value={dispatch}>

                    <SavedJobsContext.Provider value={savedJobs}>
                        <SavedJobsDispatchContext.Provider value={savedJobsDispatch}>

                            <MyApplicationsContext.Provider value={myApplications}>
                                <MyApplicationsDispatchContext.Provider value={myApplicationsDispatch}>

                                    <NavigationContainer>
                                        <TabNavigator />
                                    </NavigationContainer>

                                </MyApplicationsDispatchContext.Provider>
                            </MyApplicationsContext.Provider>
                        </SavedJobsDispatchContext.Provider>
                    </SavedJobsContext.Provider>

                </MyDispatchContext.Provider>
            </MyUserContext.Provider>
        </PaperProvider>

    );
}

export default App;