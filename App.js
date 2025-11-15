import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './lib/supabaseClient';
import AuthScreen from './screens/AuthScreen';
import NoteListScreen from './screens/NoteListScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setAuthenticated(!!session);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {authenticated ? (
          <>
            <Stack.Screen
              name="NoteList"
              component={NoteListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddNote"
              component={AddNoteScreen}
              options={{ title: 'Add Note' }}
            />
            <Stack.Screen
              name="NoteDetail"
              component={NoteDetailScreen}
              options={{ title: 'Note Details' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            options={{ headerShown: false }}
          >
            {(props) => <AuthScreen {...props} onAuth={() => setAuthenticated(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
