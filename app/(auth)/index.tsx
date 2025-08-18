import { StyleSheet, Text, View, TextInput, Pressable, Image, Modal, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail } from "lucide-react-native";
import { useRef, useState } from "react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { login } = useAuth();

  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      await login(email, password);
      router.replace("/mesocycles");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = () => {
    setResetModalVisible(true);
  };

  const handleSendResetEmail = () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    // Simulate sending a reset email
    Alert.alert("Reset Email Sent", "If an account exists with this email, you will receive a password reset link shortly.", [
      {
        text: "OK",
        onPress: () => {
          setResetModalVisible(false);
          setResetEmail("");
        }
      }
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={["#1a1a1a", "#121212"]}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=100&auto=format&fit=crop" }} 
          style={styles.logoImage} 
        />
        <Text style={styles.logoText}>Forged Physique</Text>
        <Text style={styles.tagline}>Science is Stronger</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <Mail size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Lock size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>
        
        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </Pressable>
        
        <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>

      {/* Password Reset Modal */}
      <Modal
        visible={resetModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resetModal}>
            <Text style={styles.resetTitle}>Reset Password</Text>
            <Text style={styles.resetDescription}>
              Enter your email address to receive a password reset link.
            </Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable 
                style={styles.sendButton}
                onPress={handleSendResetEmail}
              >
                <Text style={styles.sendButtonText}>SEND</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 20,
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#fff",
  },
  loginButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotPasswordText: {
    color: "#e74c3c",
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#888",
  },
  signupLink: {
    color: "#e74c3c",
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  resetModal: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    width: "90%",
    padding: 20,
  },
  resetTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 10,
  },
  resetDescription: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  sendButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
  },
});