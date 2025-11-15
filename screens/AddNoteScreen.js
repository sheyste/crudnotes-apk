import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabaseClient';
import { decode } from 'base64-arraybuffer';

export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // array of {type: 'image' or 'video', uri, filename}

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      result.assets.forEach((asset) => {
        setMediaFiles(prev => [...prev, {
          type: 'image',
          uri: asset.uri,
          filename: asset.uri.split('/').pop()
        }]);
      });
    }
  };

  const uploadMedia = async () => {
    const uploadedUrls = [];
    for (const file of mediaFiles) {
      let arrayBuffer;
      if (file.uri.startsWith('blob:')) {
        // For web blob URIs
        const response = await fetch(file.uri);
        const blob = await response.blob();
        arrayBuffer = await blob.arrayBuffer();
      } else {
        // For file URIs
        const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.BASE64 });
        const uint8Array = decode(base64);
        arrayBuffer = uint8Array.buffer;
      }
      const { data, error } = await supabase.storage
        .from('notes-media')
        .upload(`${Date.now()}-${file.filename}`, arrayBuffer, {
          contentType: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('notes-media').getPublicUrl(data.path);
      uploadedUrls.push({ type: file.type, url: urlData.publicUrl });
    }
    return uploadedUrls;
  };

  const saveNote = async () => {
    console.log('saveNote called');
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    try {
      const mediaUrls = await uploadMedia();
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError) {
        Alert.alert('Authentication Error', authError.message);
        return;
      }
      if (!user.user) {
        Alert.alert('Error', 'No user found, please log in again');
        return;
      }
      const { error } = await supabase.from('notes').insert({
        title,
        content,
        media: mediaUrls.length > 0 ? mediaUrls : null,
        user_id: user.user.id,
      });
      if (error) throw error;
      Alert.alert('Success', 'Note saved');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderMediaItem = ({ item, index }) => (
    <View key={index} style={styles.mediaItem}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      <TouchableOpacity style={styles.removeButton} onPress={() => removeMedia(index)}>
        <Text style={styles.removeText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Note Content"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Add Images</Text>
      </TouchableOpacity>
      {mediaFiles.map((item, index) => renderMediaItem({ item, index }))}
      <TouchableOpacity style={styles.button} onPress={saveNote}>
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  mediaItem: {
    position: 'relative',
    marginBottom: 10,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
