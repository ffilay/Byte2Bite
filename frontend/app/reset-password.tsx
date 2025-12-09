// app/reset-password.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // On mount, check if we have a valid recovery session
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Supabase should already have a session if the link was opened correctly
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("[ResetPassword] getUser error:", error);
          setHasValidSession(false);
        } else if (!data.user) {
          console.log("[ResetPassword] No user in session");
          setHasValidSession(false);
        } else {
          console.log("[ResetPassword] Recovery session for user:", data.user.email);
          setHasValidSession(true);
        }
      } catch (err) {
        console.error("[ResetPassword] Unexpected error:", err);
        setHasValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      showAlert("Missing fields", "Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Password mismatch", "The passwords do not match.");
      return;
    }

    // You can add more password rules here if needed

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[ResetPassword] updateUser error:", error);
        showAlert("Reset failed", error.message);
        return;
      }
      await supabase.auth.signOut();
      showAlert("Password updated", "Your password has been reset successfully.");
      // After resetting, send user back to login
      router.replace("/login");
    } catch (err: any) {
      console.error("[ResetPassword] Unexpected error:", err);
      showAlert(
        "Error",
        "Something went wrong while updating your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Checking reset link...</Text>
      </View>
    );
  }

  if (!hasValidSession) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Invalid or expired link</Text>
        <Text style={styles.text}>
          Your password reset link is invalid or has expired. Please request a new one
          from the login page.
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button title="Back to Login" onPress={() => router.replace("/login")} />
        </View>
      </View>
    );
  }

  // Valid session: show reset form
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="New password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Confirm new password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {submitting ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Update Password" onPress={handleUpdatePassword} />
      )}

      <Text style={styles.helpText}>
        After updating, you'll be redirected to the login screen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  helpText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
});
