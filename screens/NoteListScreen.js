import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabaseClient';

export default function NoteListScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setNotes(data);
    }
    setLoading(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes().then(() => setRefreshing(false));
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchNotes();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert('Delete Note', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteNote(item.id) },
          ]);
        }}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNote}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No notes yet. Tap + to add one.</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddNote')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#007AFF',
  },
  noteItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF3B30',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
  },
});
