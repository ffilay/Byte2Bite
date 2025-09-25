import { View, Text, Pressable } from "react-native";
import { Slot, Link, usePathname } from "expo-router";

export default function RootLayout() {
  const pathname = usePathname(); // 🔹 Get current route

  const links = [
    { href: "/", label: "Home" },
    { href: "/ingredients", label: "Ingredients" },
    { href: "/menuitems", label: "Menu Items" },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Top Bar */}
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
        {/* Left side: Title */}
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "black" }}>
          Byte2Bite
        </Text>

        {/* Middle: Subtitle */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>
            Restaurant Inventory Management Platform
          </Text>
        </View>
      </View>

      {/* 🔹 Body with Sidebar + Content */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar */}
        <View style={{ width: 200, backgroundColor: "#f4f4f4", padding: 20 }}>
          {links.map((link) => {
            const isActive = pathname === link.href; // 🔹 check if active
            return (
              <Link key={link.href} href={link.href} asChild>
                <Pressable>
                  {({ hovered }) => (
                    <Text
                      style={{
                        marginVertical: 15,
                        fontSize: 20,
                        fontWeight: isActive || hovered ? "700" : "400",
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

        {/* Main content */}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}
