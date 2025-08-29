import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Alert, Modal } from "react-native";
import { Pressable, Button, ButtonText, Input, InputField, Card } from "@gluestack-ui/themed";
import { ACCESSORY_ID } from "@/components/InputAccessoryBar";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from "@/types/workout";
import { Lock, Mail, User as UserIcon } from "lucide-react-native";

export default function AdminConsoleScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const usersJson = await AsyncStorage.getItem("users");
        if (usersJson) {
          const loadedUsers = JSON.parse(usersJson);
          setUsers(loadedUsers);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        Alert.alert("Error", "Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    try {
      const updatedUsers = users.map(u => 
        u.user_id === selectedUser.user_id 
          ? { ...u, password_hash: newPassword } 
          : u
      );
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      Alert.alert("Success", "Password reset successfully.");
      setResetPasswordModalVisible(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to reset password:", error);
      Alert.alert("Error", "Failed to reset password.");
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // For now, we'll just show the reset password modal as a simple action
    setResetPasswordModalVisible(true);
  };

  // Simple check for admin status - in a real app, this would be more robust
  if (!user || user.email !== "admin@example.com") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied. Admin privileges required.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Console</Text>
        <Text style={styles.subtitle}>Manage user accounts</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users</Text>
          {users.length > 0 ? (
            users.map((u) => (
              <Pressable
                key={u.user_id}
                onPress={() => handleViewUser(u)}
              >
                <Card style={styles.userCard}>
                  <View style={styles.userAvatar}>
                    <UserIcon size={30} color="#fff" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.user_name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                  </View>
                </Card>
              </Pressable>
            ))
          ) : (
            <Text style={styles.noUsersText}>No users found.</Text>
          )}
        </View>
      )}

      {/* Reset Password Modal */}
      {selectedUser && (
        <Modal
          visible={resetPasswordModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.resetModal}>
              <Text style={styles.resetTitle}>Reset Password for {selectedUser.user_name}</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#888" style={styles.inputIcon} />
                <Input style={styles.input} inputAccessoryViewID={ACCESSORY_ID}>
                  <InputField
                    placeholder="New Password"
                    placeholderTextColor="#888"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </Input>
              </View>
              <View style={styles.modalButtons}>
                <Button
                  style={styles.cancelButton}
                  onPress={() => {
                    setResetPasswordModalVisible(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}
                >
                  <ButtonText style={styles.cancelButtonText}>CANCEL</ButtonText>
                </Button>
                <Button
                  style={styles.sendButton}
                  onPress={handleResetPassword}
                >
                  <ButtonText style={styles.sendButtonText}>RESET</ButtonText>
                </Button>
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 50,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 15,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
  },
  noUsersText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
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
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 20,
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
