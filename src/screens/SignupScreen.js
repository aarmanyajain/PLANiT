import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  PixelRatio,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { signup } from '../services/authService';

const { width } = Dimensions.get('window');
const scale = width / 375; 
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword) return "All fields are required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSignup = async () => {
    const error = validateInputs();
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    setLoading(true);
    try {
      const data = await signup(email, password);
      console.log("Signup success:", data);
      if (isMounted.current) navigation.replace("Home");
    } catch (error) {
      console.error("Signup error:", error);
      if (isMounted.current) Alert.alert("Signup Failed", error.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/time.json')}
        autoPlay
        loop
        style={styles.lottie}
      />

      <Text style={styles.title}>PLANiT</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={normalize(22)}
              color="#666"
              style={{ paddingHorizontal: normalize(8) }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={normalize(22)}
              color="#666"
              style={{ paddingHorizontal: normalize(8) }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(24),
    backgroundColor: '#f5f7fb',
  },
  lottie: {
    width: normalize(140),
    height: normalize(140),
    alignSelf: 'center',
    marginBottom: normalize(10),
  },
  title: {
    fontSize: normalize(38),
    fontWeight: 'bold',
    color: '#6a11cb',
    textAlign: 'center',
    marginBottom: normalize(6),
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: normalize(30),
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: normalize(16),
    padding: normalize(20),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: normalize(6),
    shadowOffset: { width: 0, height: 3 },
  },
  input: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: normalize(10),
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(14),
    color: '#000',
    marginBottom: normalize(15),
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: normalize(15),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: normalize(15),
    paddingRight: normalize(6),
  },
  button: {
    width: '100%',
    backgroundColor: '#6a11cb',
    paddingVertical: normalize(15),
    borderRadius: normalize(12),
    alignItems: 'center',
    marginTop: normalize(10),
  },
  buttonText: { 
    color: '#fff',
    fontWeight: 'bold', 
    fontSize: normalize(16)
 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: normalize(25),
  },
  switchLabel: {
    color: '#555',
    fontSize: normalize(14),
  },
  loginText: {
    color: '#6a11cb',
    fontSize: normalize(14),
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
