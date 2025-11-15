import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Image, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../lib/supabaseClient';

export default function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;
  const [imageHeights, setImageHeights] = useState({});
  const containerWidth = Dimensions.get('window').width - 40; // padding 20 each side
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const deleteNote = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('notes').delete().eq('id', note.id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.goBack(); // Go back after successful deletion
    }
  };

  const editNote = () => {
    navigation.navigate('AddNote', { note });
  };

  return (
    <>
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
            <TouchableOpacity onPress={() => { setSelectedMedia(media); setModalVisible(true); }}>
              <Image
                source={{ uri: media.url }}
                style={[styles.mediaImage, { height: imageHeights[`${index}`] || 200 }]}
                resizeMode="contain"
                onLoad={(event) => {
                  const { height, width } = event.nativeEvent.source;
                  const scaledHeight = height * (containerWidth / width);
                  setImageHeights(prev => ({ ...prev, [`${index}`]: scaledHeight }));
                }}
              />
            </TouchableOpacity>
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
    <Modal
      visible={modalVisible}
      transparent={false}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'black' }}
        onPress={() => setModalVisible(false)}
      >
        {selectedMedia && (
          <Image
            source={{ uri: selectedMedia.url }}
            style={{ flex: 1, resizeMode: 'contain' }}
          />
        )}
      </TouchableOpacity>
    </Modal>
  </>
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
