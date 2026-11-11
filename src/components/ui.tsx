import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextInput,
  TextInputProps,
  TextProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { colors } from "../theme/tokens";
import { brandLogo } from "../theme/brand";
export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.text, style]} />;
}
export function Heading({
  children,
  small = false,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: "Poppins-SemiBold",
        fontSize: small ? 21 : 30,
        lineHeight: small ? 29 : 39,
        letterSpacing: small ? -0.4 : -0.8,
      }}
    >
      {children}
    </Text>
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: "Poppins-Medium",
        fontSize: 10,
        letterSpacing: 2,
        color: colors.brand,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  icon?: React.ComponentProps<typeof Feather>["name"];
  disabled?: boolean;
  busy?: boolean;
}) {
  const foreground =
    variant === "primary" || variant === "danger" ? "#fff" : colors.brand;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            variant === "primary"
              ? colors.brand
              : variant === "danger"
                ? colors.danger
                : variant === "secondary"
                  ? colors.soft
                  : "transparent",
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: "#E3D9F4",
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={foreground} />
      ) : icon ? (
        <Feather name={icon} size={18} color={foreground} />
      ) : null}
      <Text
        style={{
          fontFamily: "Poppins-Medium",
          fontSize: 14,
          color: foreground,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: selected ? colors.brand : colors.line,
        backgroundColor: selected ? colors.soft : "#fff",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: selected ? "Poppins-SemiBold" : "Poppins-Regular",
          color: selected ? colors.brand : colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: error ? "#FCECEF" : colors.soft,
        marginVertical: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          lineHeight: 19,
          color: error ? colors.danger : colors.brand,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
export function Field({
  label,
  limit,
  ...props
}: TextInputProps & { label: string; limit?: number }) {
  return (
    <View style={{ gap: 7, marginBottom: 18 }}>
      <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13 }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#857B92"
        {...props}
        maxLength={limit ?? props.maxLength}
        style={[
          styles.input,
          props.multiline && { minHeight: 104, textAlignVertical: "top" },
          props.style,
        ]}
      />
      {limit ? (
        <Text style={{ fontSize: 10, color: colors.muted, textAlign: "right" }}>
          {props.value?.length ?? 0}/{limit}
        </Text>
      ) : null}
    </View>
  );
}
export function Empty({
  title,
  message,
  icon = "image",
}: {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
}) {
  return (
    <View
      style={{
        paddingVertical: 35,
        paddingHorizontal: 22,
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{ padding: 20, backgroundColor: colors.soft, borderRadius: 50 }}
      >
        <Feather name={icon} color={colors.brand} size={28} />
      </View>
      <Heading small>{title}</Heading>
      <Text style={{ color: colors.muted, textAlign: "center" }}>
        {message}
      </Text>
    </View>
  );
}
export function Confirm({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  busy = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#211C3099",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 22,
            gap: 16,
            maxWidth: 480,
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Heading small>{title}</Heading>
          <Text>{message}</Text>
          <Button
            label="Cancelar"
            onPress={onCancel}
            variant="secondary"
            disabled={busy}
          />
          <Button
            label="Confirmar"
            onPress={onConfirm}
            variant="danger"
            busy={busy}
          />
        </View>
      </View>
    </Modal>
  );
}
export function Header({
  back = false,
  title,
}: {
  back?: boolean;
  title?: string;
}) {
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
          style={{ minWidth: 48, minHeight: 48, justifyContent: "center" }}
        >
          <Feather name="arrow-left" size={23} color={colors.ink} />
        </Pressable>
      ) : brandLogo ? (
        <Image
          source={brandLogo}
          accessible
          accessibilityLabel="Artium"
          resizeMode="contain"
          style={{ width: 42, height: 62 }}
        />
      ) : (
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            fontSize: 26,
            letterSpacing: -1,
          }}
        >
          Artium<Text style={{ fontSize: 26, color: colors.brand }}>·</Text>
        </Text>
      )}
      {title ? (
        <Text style={{ fontFamily: "Poppins-Medium", flex: 1 }}>{title}</Text>
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Text style={{ fontSize: 9, letterSpacing: 1, color: colors.muted }}>
          DEMO LOCAL
        </Text>
      </View>
    </View>
  );
}
export function Screen({
  children,
  back = false,
  title,
  scroll = true,
}: {
  children: React.ReactNode;
  back?: boolean;
  title?: string;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-paper">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{ flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" }}
        >
          <Header back={back} title={title} />
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 22,
                paddingTop: 14,
                paddingBottom: 42,
                gap: 18,
              }}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export const styles = StyleSheet.create({
  text: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CFC7DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.ink,
    minHeight: 52,
  },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
});
