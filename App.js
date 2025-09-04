import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen'; 
import AddEditTaskScreen from './src/screens/AddEditTaskScreen';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import useTaskStore from './src/store/taskStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const loadTasks = useTaskStore(state => state.loadTasks);

  useEffect(() => {
    async function initNotifications() {
      // Load tasks from AsyncStorage
      await loadTasks();

      // Request notification permission
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Notification permissions granted');
      } else {
        console.log('❌ Notification permissions denied');
      }

      // Create default Android channel
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 4, // high importance
      });
    }

    initNotifications();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} /> 
        <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
