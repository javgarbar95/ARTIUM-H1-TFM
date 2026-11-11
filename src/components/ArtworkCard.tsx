import { Pressable, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Artwork, Database, User } from "../domain/models";
import { users, universities } from "../fixtures/seed";
import { ArtworkImage } from "./ArtworkImage";
import { Text } from "./ui";
import { colors } from "../theme/tokens";
export function ArtistLine({ user }: { user: User }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${user.displayName}`}
      onPress={() => router.push(`/artist/${user.id}`)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        minHeight: 54,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: user.color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 11 }}>
          {user.initials}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 12 }}>
          {user.displayName}
        </Text>
        <Text style={{ fontSize: 10, color: colors.muted, lineHeight: 15 }}>
          {universities.find((u) => u.id === user.universityId)?.shortName} ·
          Perfil ficticio
        </Text>
      </View>
      <Feather name="arrow-up-right" size={17} color={colors.muted} />
    </Pressable>
  );
}
export function ArtworkCard({
  artwork,
  db,
  compact = false,
}: {
  artwork: Artwork;
  db: Database;
  compact?: boolean;
}) {
  const user = users.find((u) => u.id === artwork.ownerId);
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      {!compact && user ? (
        <View style={{ paddingHorizontal: 14, paddingVertical: 3 }}>
          <ArtistLine user={user} />
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver obra ${artwork.title}`}
        onPress={() => router.push(`/artwork/${artwork.id}`)}
      >
        <ArtworkImage
          media={db.media.find((m) => m.id === artwork.imageId)}
          alt={artwork.altText}
          style={{ height: compact ? 180 : 290 }}
        />
        <View style={{ padding: 15, gap: 5 }}>
          <Text
            style={{ fontSize: 9, color: colors.brand, letterSpacing: 1.5 }}
          >
            {artwork.discipline.toUpperCase()} / {artwork.year}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins-SemiBold",
              fontSize: compact ? 15 : 19,
            }}
          >
            {artwork.title}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {artwork.technique}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
