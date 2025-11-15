import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'react-native';
import { Video } from 'expo-av';

export default function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;

  const deleteNote = () => {
    // Deletion handled in NoteListScreen
    Alert.alert('Delete', 'To delete, go back and press delete button');
  };

  const editNote = () => {
    // Implement edit later, or navigate to AddNote with prefilled data
    Alert.alert('Edit', 'Edit functionality not implemented yet');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <TouchableOpacity style={styles.editButton} onPress={editNote}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{note.content}</Text>
      {note.media && note.media.map((media, index) => (
        <View key={index} style={styles.mediaContainer}>
          {media.type === 'image' ? (
            <Image source={{ uri: media.url }} style={styles.mediaImage} />
          ) : (
            <Video
              source={{ uri: media.url }}
              style={styles.mediaImage}
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.deleteButton} onPress={deleteNote}>
        <Text style={styles.deleteText}>Delete Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
});
