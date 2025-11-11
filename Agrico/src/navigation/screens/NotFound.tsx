import { Text, Button } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';

export function NotFound() {
  return (
    <View style={styles.container}>
      <Text>404</Text>
      {/*<Button screen="HomeTabs">Go to Home</Button>*/}
      <Text>Please check your internet connection </Text>
      <Text>then try to close and reopen the app.</Text>
      <Text>or try again later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
