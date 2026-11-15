import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from '@convex-dev/auth/methods/username-password/react';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, House } from '@/components/sprites';
import { Body, Chip, Panel, PixelButton, PixelText } from '@/components/ui';
import { C, F } from '@/lib/theme';
import { FRIENDS } from '@/lib/world';
import { api } from '../../convex/_generated/api';

function describe(error: string) {
  switch (error) {
    case 'USER_NOT_FOUND':
    case 'INVALID_CREDENTIALS':
      return 'That username and password don’t match.';
    case 'USERNAME_TAKEN':
      return 'Someone already lives at that username.';
    case 'PASSWORD_TOO_SHORT':
      return 'Password needs to be longer.';
    case 'PASSWORD_TOO_COMMON':
      return 'That password is too common. Pick another.';
    case 'USERNAME_HAS_INVALID_CHARACTERS':
      return 'Usernames can’t contain those characters.';
    case 'RATE_LIMITED':
      return 'Too many tries. Wait a minute and try again.';
    default:
      return `Couldn’t sign in (${error}).`;
  }
}

export function SignIn() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signUp' | 'signIn'>('signUp');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const signIn = useSignInWithUsernamePassword(api.auth);
  const signUp = useSignUpWithUsernamePassword(api.auth);
  const pending = signIn.pending || signUp.pending;

  async function submit() {
    setError(null);
    const run = mode === 'signUp' ? signUp.signUp : signIn.signIn;
    const result = await run({ username: username.trim(), password });
    if (result.status !== 'complete') setError(describe(result.userError.error));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { paddingTop: insets.top + 30 }]}>
      <View style={styles.scene}>
        <House style="cottage" size={96} wall="#FFD9C2" roof={C.coral} lit={false} />
        {FRIENDS.slice(0, 3).map((f) => (
          <Avatar key={f.id} palette={f.palette} accessory={f.accessory} size={4} />
        ))}
      </View>
      <PixelText size={40} style={{ textAlign: 'center' }}>
        terrarium
      </PixelText>
      <Body style={{ textAlign: 'center', color: C.inkSoft, marginBottom: 20 }}>A little living world for your friend group.</Body>
      <Panel>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip testID="mode-signup" label="Move in" active={mode === 'signUp'} onPress={() => setMode('signUp')} />
            <Chip testID="mode-signin" label="I live here" active={mode === 'signIn'} onPress={() => setMode('signIn')} />
          </View>
          <TextInput
            testID="username"
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            style={styles.input}
            placeholderTextColor={C.inkSoft}
          />
          <TextInput
            testID="password"
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            secureTextEntry
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
            style={styles.input}
            placeholderTextColor={C.inkSoft}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PixelButton
            testID="submit-auth"
            label={pending ? '...' : mode === 'signUp' ? 'Move in' : 'Come home'}
            disabled={pending || username.trim().length === 0 || password.length === 0}
            onPress={submit}
          />
        </View>
      </Panel>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.sky, paddingHorizontal: 20 },
  scene: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 10 },
  input: {
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.pixelMid,
    fontSize: 17,
    color: C.ink,
  },
  error: { fontFamily: F.pixelMid, color: C.coralDeep, fontSize: 14 },
});
