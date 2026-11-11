import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const routes = [
    ["index", "Inicio", "home"],
    ["search", "Buscar", "search"],
    ["portfolio", "Portfolio", "briefcase"],
    ["messages", "Mensajes", "message-circle"],
    ["profile", "Perfil", "user"],
  ] as const;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6436C9",
        tabBarInactiveTintColor: "#71687C",
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
          fontSize: 10,
          marginTop: 4,
        },
        tabBarStyle: {
          height: 68 + Math.max(insets.bottom, 8),
          paddingTop: 9,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: "#fff",
          borderTopColor: "#E8E3EF",
        },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      {routes.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color }) => (
              <Feather
                name={icon}
                size={21}
                color={typeof color === "string" ? color : "#71687C"}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
