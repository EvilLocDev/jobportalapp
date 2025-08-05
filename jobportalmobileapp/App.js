import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import Applications from "./components/Home/Applications"
import Home from "./components/Home/Home";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={Home} options={{title: "Company list"}}/>
      <Stack.Screen name="applications" component={Applications} options={{title: "Applications list"}}/>
    </Stack.Navigator>
  );
}

const App = () => {
  return (
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
  );
}

export default App;