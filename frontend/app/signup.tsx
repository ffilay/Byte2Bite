import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";
import { RestaurantsService } from "@/services/RestaurantService";

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      window.alert("Missing Information, Please enter all fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: firstName + " " + lastName },
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
        window.alert("Signup Failed ${error.message}");
        return;
      }

      // ✅ If a user was created, redirect to verifyemail immediately
      if (data.user && !data.session) {
        router.replace({
          pathname: "/verifyemail",
          params: { email: data.user.email ?? email },
        });
        return;
      }

      if (data.session) {
        window.alert("Success, Account created! Redirecting...");
        router.replace("/"); // ✅ Navigate to home
      }
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      window.alert("Error, Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}

      <Text style={styles.linkText} onPress={() => router.replace("/login")}>
        Already have an account? Log in
      </Text>
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  linkText: {
    color: "#007AFF",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
