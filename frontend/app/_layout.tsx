import { View, Text, Pressable } from "react-native";
import { Slot, Link, Href, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [emailPending, setEmailPending] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Supabase session error:", error.message);
        setIsAuthenticated(false);
        return;
      }

      const session = data.session;
      setIsAuthenticated(!!session);

      if (session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user && !userData.user.email_confirmed_at) {
          setEmailPending(userData.user.email ?? null);
          if (pathname !== "/verifyemail") {
            router.replace({
              pathname: "/verifyemail",
              params: { email: userData.user.email },
            });
          }
        } else if (
          pathname === "/login" ||
          pathname === "/signup" ||
          pathname === "/verifyemail"
        ) {
          router.replace("/");
        } else {
          setEmailPending(null);
        }
      } else {
        if (
          pathname !== "/login" &&
          pathname !== "/signup" &&
          pathname !== "/verifyemail"
        ) {
          router.replace("/login");
        }
      }
    };
    initAuth();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session);

        if (_event === "SIGNED_IN") {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (user && !user.email_confirmed_at) {
            setEmailPending(user.email ?? null);
            router.replace({
              pathname: "/verifyemail",
              params: { email: user.email },
            });
          } else {
            setEmailPending(null);
            router.replace("/");
          }
        }
        if (_event === "SIGNED_OUT") router.replace("/login");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [pathname, router]);

  // Loading screen
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const showSidebar =
    pathname !== "/login" &&
    pathname !== "/signup" &&
    pathname !== "/verifyemail" &&
    isAuthenticated;

  const links = [
    { href: "/", label: "Home" },
    { href: "/ingredients", label: "Ingredients" },
    { href: "/menuitems", label: "Menu Items" },
    { href: "/transactions", label: "Transactions" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top Bar */}
      <View
        style={{
          height: 75,
          backgroundColor: "white",
          borderBottomWidth: 1.5,
          borderBottomColor: "#ccc",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "black" }}>
          Byte2Bite
        </Text>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>
            Restaurant Inventory Management Platform
          </Text>
        </View>
        {isAuthenticated && (
          <Pressable onPress={handleLogout} style={{ padding: 8 }}>
            <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
          </Pressable>
        )}
      </View>

      {/* Sidebar + Main Content */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {showSidebar && (
          <View style={{ width: 200, backgroundColor: "#f4f4f4", padding: 20 }}>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href as Href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={{ paddingVertical: 8 }}
                  >
                    {({ pressed, hovered }) => (
                      <Text
                        style={{
                          marginVertical: 7,
                          fontSize: 20,
                          fontWeight:
                            isActive || pressed || hovered ? "700" : "400",
                        }}
                      >
                        {link.label}
                      </Text>
                    )}
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}
