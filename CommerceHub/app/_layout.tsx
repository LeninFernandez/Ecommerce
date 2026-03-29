import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: 'https://ecommerce-ebui.onrender.com/' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});