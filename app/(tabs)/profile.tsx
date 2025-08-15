import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { ChevronRight, LogOut, Settings, User } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout, updateUnitPreference } = useAuth();
  const [useKg, setUseKg] = useState(user?.unit_preference === "kg");

  const handleUnitToggle = (value: boolean) => {
    setUseKg(value);
    updateUnitPreference(value ? "kg" : "lbs");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            router.replace("/");
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <User size={40} color="#fff" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.user_name || "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Use Kilograms (kg)</Text>
            <Switch
              value={useKg}
              onValueChange={handleUnitToggle}
              trackColor={{ false: "#333", true: "#e74c3c" }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notification Settings</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>App Appearance</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingCard}>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable 
            style={styles.settingRow}
            onPress={handleLogout}
          >
            <View style={styles.logoutRow}>
              <LogOut size={20} color="#e74c3c" />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <ChevronRight size={20} color="#888" />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingCard}>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <ChevronRight size={20} color="#888" />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </Pressable>
        </View>
      </View>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#e74c3c",
    marginLeft: 10,
  },
  versionText: {
    fontSize: 14,
    color: "#888",
  },
});