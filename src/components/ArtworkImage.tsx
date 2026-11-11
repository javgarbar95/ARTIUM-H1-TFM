import { useEffect, useState } from "react";
import { Image, View, StyleProp, ViewStyle } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { MediaAsset } from "../domain/models";
import { resolveMediaUri } from "../services/media";
import { Text } from "./ui";
export function ArtworkImage({
  media,
  alt,
  style,
}: {
  media?: MediaAsset;
  alt: string;
  style?: StyleProp<ViewStyle>;
}) {
  const key = media?.localUri ?? media?.bundledKey;
  const [resolved, setResolved] = useState<{
    key?: string;
    uri?: string;
    error: boolean;
  }>({ error: false });
  const uri = resolved.key === key ? resolved.uri : undefined;
  const error = !media || (resolved.key === key && resolved.error);
  useEffect(() => {
    let active = true;
    if (media)
      resolveMediaUri(media)
        .then((uri) => {
          if (active) setResolved({ key, uri, error: false });
        })
        .catch(() => {
          if (active) setResolved({ key, error: true });
        });
    return () => {
      active = false;
    };
  }, [media, key]);
  return (
    <View
      style={[
        {
          backgroundColor: "#F0ECE7",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {error ? (
        <View
          accessible
          accessibilityLabel={`Imagen no disponible: ${alt}`}
          style={{ padding: 14, alignItems: "center" }}
        >
          <Feather name="image" size={24} color="#686071" />
          <Text style={{ fontSize: 11, textAlign: "center" }}>
            Imagen no disponible
          </Text>
        </View>
      ) : uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel={alt}
          accessible
          resizeMode="contain"
          onError={() => setResolved({ key, error: true })}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Text style={{ fontSize: 11 }}>Cargando imagen…</Text>
      )}
    </View>
  );
}
