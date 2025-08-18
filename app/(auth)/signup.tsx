import { useRef, useState } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Image, TouchableWithoutFeedback, Keyboard } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { Lock, Mail, User } from "lucide-react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignup = async () => {
    if (!email || !password || !userName) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      await signup(email, password, userName);
      router.replace("/mesocycles");
    } catch (err) {
      setError("Error creating account. Please try again.");
    }
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
        <Text style={styles.title}>Create Account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <User size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={userName}
            onChangeText={setUserName}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Mail size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            ref={emailInputRef}
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
            onSubmitEditing={handleSignup}
          />
        </View>
        
        <Pressable
          style={styles.signupButton}
          onPress={handleSignup}
        >
          <Text style={styles.signupButtonText}>SIGN UP</Text>
        </Pressable>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </View>
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
  signupButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#888",
  },
  loginLink: {
    color: "#e74c3c",
    fontWeight: "700" as const,
  },
});