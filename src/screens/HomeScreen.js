import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useTaskStore from '../../src/store/taskStore';
import { useNavigation } from '@react-navigation/native';
import useThemeStore from '../store/themeStore';

const { width, height } = Dimensions.get('window');

const scale = width / 375;
const normalize = size =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    tasks,
    loadTasks,
    toggleTaskCompleted,
    deleteTask,
    syncTasks,
    lastSynced,
  } = useTaskStore();
  const { darkTheme, setTheme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filteredPriority, setFilteredPriority] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const init = async () => {
      await loadTasks();
      await syncTasks();
      setLoading(false);
    };
    init();
  }, []);

  const handleAddTask = () => navigation.navigate('AddEditTask');
  const handleToggle = async id => await toggleTaskCompleted(id);
  const handleDelete = async id => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => deleteTask(id) },
    ]);
  };

  const displayedTasks = filteredPriority
    ? tasks.filter(task => task.priority === filteredPriority)
    : tasks;

  const handleLongPress = task => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2575fc" />
        <Text style={{ marginTop: 12, color: '#555', fontSize: normalize(14) }}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkTheme ? '#1e1e1e' : '#f5f7fb' },
      ]}
    >
      <View style={styles.appHeader}>
        <View>
          <Text
            style={[styles.appTitle, { color: darkTheme ? '#fff' : '#000' }]}
          >
            PLANiT
          </Text>
          <Text
            style={[styles.greeting, { color: darkTheme ? '#ccc' : '#666' }]}
          >
            Hello User!!
          </Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons
            name="ellipsis-vertical"
            size={normalize(24)}
            color={darkTheme ? '#fff' : '#000'}
            style={{ marginTop: 4 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.title, { color: darkTheme ? '#fff' : '#000' }]}>
          My Tasks
        </Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Ionicons
            name="funnel-outline"
            size={normalize(24)}
            color={darkTheme ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      {/* Sync work */}
      <Text
        style={[
          styles.syncText,
          { color: darkTheme ? '#aaa' : '#666', fontSize: normalize(12) },
        ]}
      >
        {lastSynced === 'offline'
          ? 'Offline mode'
          : lastSynced
          ? `Last synced: ${new Date(lastSynced).toLocaleTimeString()}`
          : 'Syncing...'}
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Ionicons
          name="add-circle-outline"
          size={normalize(20)}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              marginTop: 40,
              color: '#999',
              fontSize: normalize(14),
            }}
          >
            No tasks yet. Start by adding one
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.taskCard,
              { backgroundColor: darkTheme ? '#2a2a2a' : '#fff' },
            ]}
            onLongPress={() => handleLongPress(item)}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handleToggle(item.id)}
            >
              <Text
                style={[
                  styles.taskTitle,
                  {
                    color: darkTheme ? '#fff' : '#000',
                    fontSize: normalize(16),
                  },
                  item.completed && {
                    textDecorationLine: 'line-through',
                    color: '#999',
                  },
                ]}
              >
                {item.title}{' '}
                <Text style={styles.priority}>[{item.priority}]</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('AddEditTask', { taskId: item.id })
              }
            >
              <Ionicons
                name="create-outline"
                size={normalize(20)}
                color="#2575fc"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={normalize(20)} color="red" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* modal for filter */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: darkTheme ? '#2c2c2c' : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: darkTheme ? '#fff' : '#000', fontSize: normalize(18) },
              ]}
            >
              Filter by Priority
            </Text>
            {['Low', 'Medium', 'High'].map(level => (
              <TouchableOpacity
                key={level}
                style={{ paddingVertical: 10 }}
                onPress={() => {
                  setFilteredPriority(level);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: darkTheme ? '#fff' : '#000',
                    fontSize: normalize(16),
                  }}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => {
                setFilteredPriority(null);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.closeText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* modal for details */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: darkTheme ? '#2c2c2c' : '#fff' },
            ]}
          >
            {selectedTask && (
              <>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: darkTheme ? '#fff' : '#000' },
                  ]}
                >
                  {selectedTask.title}
                </Text>
                <Text
                  style={{
                    color: darkTheme ? '#ccc' : '#333',
                    marginBottom: 10,
                  }}
                >
                  {selectedTask.description || 'No description'}
                </Text>
                <Text
                  style={{
                    color: darkTheme ? '#ccc' : '#333',
                    fontWeight: 'bold',
                  }}
                >
                  Priority: {selectedTask.priority}
                </Text>

                <TouchableOpacity
                  style={[styles.closeButton, { marginTop: 15 }]}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* modal for dark mode */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: darkTheme ? '#2c2c2c' : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: darkTheme ? '#fff' : '#000', fontSize: normalize(18) },
              ]}
            >
              Settings
            </Text>

            <View style={styles.themeRow}>
              <Text
                style={{
                  color: darkTheme ? '#fff' : '#000',
                  fontSize: normalize(16),
                }}
              >
                Dark Theme
              </Text>
              <Switch value={darkTheme} onValueChange={setTheme} />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
},
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
},

  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: { 
    fontSize: normalize(28), 
    fontWeight: 'bold' 
},
  greeting: { 
    fontSize: normalize(16), 
    marginTop: 2 
},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: { 
    fontSize: normalize(22), 
    fontWeight: '600' 
},
  syncText: { 
    fontSize: normalize(12), 
    marginBottom: 15 
},

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2575fc',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 15,
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: normalize(16), 
    fontWeight: 'bold' 
},

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  taskTitle: { fontSize: normalize(16) },
  priority: { 
    fontSize: normalize(13), 
    color: '#2575fc' 
},
  actionButton: { marginLeft: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { 
    fontSize: normalize(20), 
    fontWeight: 'bold', 
    marginBottom: 20 
},
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2575fc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: { 
    color: '#fff', 
    fontSize: normalize(16), 
    fontWeight: 'bold' 
},
});
