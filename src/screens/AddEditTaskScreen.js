import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useTaskStore from '../../src/store/taskStore';
import notifee, { TriggerType } from '@notifee/react-native';
import useThemeStore from '../store/themeStore';

const { width, height } = Dimensions.get('window');
const scale = width / 375; 
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function AddEditTaskScreen({ route, navigation }) {
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const tasks = useTaskStore(state => state.tasks);
  const { darkTheme } = useThemeStore();

  const editingTaskId = route.params?.taskId || null;
  const editingTask = editingTaskId ? tasks.find(t => t.id === editingTaskId) : null;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || '');
  const [priority, setPriority] = useState(editingTask?.priority || 'Low');

  const validateDate = (date) => {
    if (!date.trim()) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  };

  const scheduleTaskReminder = async (task) => {
    if (!task.dueDate) return;
    try {
      const triggerDate = new Date(task.dueDate + 'T09:00:00');
      if (isNaN(triggerDate.getTime()) || triggerDate < new Date()) return;

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 60 * 1000,
      };

      await notifee.createTriggerNotification(
        {
          title: 'Task Reminder',
          body: `${task.title} is due today!`,
          android: { channelId: 'default', smallIcon: 'ic_launcher' },
        },
        trigger
      );
    } catch (err) {
      console.log('Failed to schedule reminder:', err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!dueDate.trim() || !validateDate(dueDate)) {
      Alert.alert('Error', 'Please enter a valid due date (YYYY-MM-DD)');
      return;
    }

    try {
      if (editingTaskId) {
        const updatedTask = { ...editingTask, title: title.trim(), description: description.trim(), dueDate: dueDate.trim(), priority };
        await updateTask(updatedTask);
        await scheduleTaskReminder(updatedTask);
      } else {
        const newTask = { id: Date.now().toString(), title: title.trim(), description: description.trim(), dueDate: dueDate.trim(), priority, completed: false };
        await addTask(newTask);
        await scheduleTaskReminder(newTask);
      }
      navigation.goBack();
    } catch (e) {
      console.log('Error in handleSave:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkTheme ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: darkTheme ? '#1e1e1e' : '#fff' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={normalize(26)} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: darkTheme ? '#fff' : '#000', fontSize: normalize(20) }]}>
          {editingTaskId ? 'Edit Task' : 'Add Task'}
        </Text>
        <View style={{ width: normalize(26) }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={[styles.label, { color: darkTheme ? '#ddd' : '#333', fontSize: normalize(16) }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor={darkTheme ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: darkTheme ? '#1e1e1e' : '#fff', color: darkTheme ? '#fff' : '#000', fontSize: normalize(15) }]}
        />

        <Text style={[styles.label, { color: darkTheme ? '#ddd' : '#333', fontSize: normalize(16) }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor={darkTheme ? '#888' : '#aaa'}
          style={[styles.input, { height: normalize(80), backgroundColor: darkTheme ? '#1e1e1e' : '#fff', color: darkTheme ? '#fff' : '#000', fontSize: normalize(15) }]}
          multiline
        />

        <Text style={[styles.label, { color: darkTheme ? '#ddd' : '#333', fontSize: normalize(16) }]}>Due Date</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={darkTheme ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: darkTheme ? '#1e1e1e' : '#fff', color: darkTheme ? '#fff' : '#000', fontSize: normalize(15) }]}
        />

        <Text style={[styles.label, { color: darkTheme ? '#ddd' : '#333', fontSize: normalize(16) }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {['Low', 'Medium', 'High'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityButton,
                { backgroundColor: darkTheme ? '#1e1e1e' : '#fff', borderColor: darkTheme ? '#555' : '#ccc' },
                priority === level && { backgroundColor: '#2575fc', borderColor: '#2575fc' }
              ]}
              onPress={() => setPriority(level)}
            >
              <Text
                style={[styles.priorityText, { color: darkTheme ? '#fff' : '#333', fontSize: normalize(14) }, priority === level && { color: '#fff' }]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { fontSize: normalize(16) }]}>
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(15),
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: { fontWeight: 'bold' },
  form: { padding: normalize(20) },
  label: { 
    fontWeight: '600', 
    marginBottom: normalize(6) 
},
  input: {
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    marginBottom: normalize(20),
    elevation: 1,
  },
  priorityRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: normalize(30) 
},
  priorityButton: {
    flex: 1,
    paddingVertical: normalize(10),
    borderRadius: normalize(8),
    borderWidth: 1,
    marginHorizontal: normalize(5),
    alignItems: 'center',
  },
  priorityText: { fontWeight: '500' },
  saveButton: {
    backgroundColor: '#2575fc',
    paddingVertical: normalize(15),
    borderRadius: normalize(10),
    alignItems: 'center',
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
},
});
