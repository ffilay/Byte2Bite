import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error.message);
          setUserEmail(null);
          return;
        }

        if (data.session?.user?.email) {
          setUserEmail(data.session.user.email);
        } else {
          setUserEmail(null);
        }
        if (data.session?.user?.user_metadata?.display_name) {
          setUserName(data.session.user.user_metadata?.display_name);
        } else {
          setUserName(null);
        }
      } catch (err) {
        console.error("Unexpected error loading session:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for changes in authentication state (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        } else {
          setUserEmail(null);
        }
        if (session?.user?.user_metadata?.display_name) {
          setUserName(session.user.user_metadata?.display_name);
        } else {
          setUserName(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
      router.replace("/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading user info...</Text>
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not logged in</Text>
        <Button title="Go to Login" onPress={() => router.replace("/login")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userName}!</Text>
      <Text style={styles.subtitle}>You are logged in.</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
});
