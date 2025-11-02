import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Verify your email
      </Text>
      <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>
        A Email Confirmation link has been sent to{" "}
        <Text style={{ fontWeight: "bold" }}>{email || "your email"}</Text>.{" "}
        Check your inbox to finish creating your acount.
      </Text>
      <Pressable
        onPress={() => router.replace("/login")}
        style={{
          backgroundColor: "#000",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Return to Login</Text>
      </Pressable>
    </View>
  );
}
