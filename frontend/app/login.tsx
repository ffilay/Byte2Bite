import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabaseClient";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    // In web, use the browser's alert
    window.alert(`${title}\n\n${message}`);
  } else {
    // In iOS/Android, use React Native's Alert
    Alert.alert(title, message);
  }
};

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`❌ Login failed: ${error.message}`);
      } else if (data.session) {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => router.replace("/"), 800);
      } else {
        setMessage("⚠️ No active session found. Please check your email.");
      }
    } catch (err: any) {
      setMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Checking session...</Text>
      </View>
    );
  }

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showAlert("Missing email", "Please enter your email address first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: "http://localhost:8081/reset-password",
      });

      if (error) {
        console.error("Password reset error:", error);
        showAlert("Reset failed", error.message);
        return;
      }

      showAlert(
        "Check your email",
        "If an account exists with that email, a password reset link has been sent."
      );
    } catch (err: any) {
      console.error("Unexpected forgot-password error:", err);
      showAlert(
        "Error",
        "Something went wrong while sending the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading || !email || !password}
      />

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.linkText} onPress={handleForgotPassword}>
        Forgot Password?
      </Text>

      <Text style={styles.linkText} onPress={() => router.push("/signup")}>
        Don’t have an account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  message: {
    marginTop: 12,
    textAlign: "center",
    color: "black",
  },
  linkText: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
