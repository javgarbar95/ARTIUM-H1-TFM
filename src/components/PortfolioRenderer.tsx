import { View } from "react-native";
import { PortfolioDocument } from "../domain/models";
import { ArtworkImage } from "./ArtworkImage";
import { Empty, Eyebrow, Heading, Text } from "./ui";
import { colors } from "../theme/tokens";
export function PortfolioRenderer({
  document,
}: {
  document: PortfolioDocument;
}) {
  const gallery = document.config.templateId === "gallery";
  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          borderTopWidth: 3,
          borderColor: document.config.accentColor,
          paddingTop: 20,
          gap: 10,
        }}
      >
        <Eyebrow>
          SELECCIÓN DE OBRA / {gallery ? "GALERÍA" : "EDITORIAL"}
        </Eyebrow>
        <Heading>{document.author.displayName}</Heading>
        <Text style={{ color: colors.muted }}>
          {document.config.intro || "Tu selección, tu manera de contarla."}
        </Text>
      </View>
      {!document.works.length ? (
        <Empty
          title="Un portfolio por descubrir"
          message="Selecciona obras de tu biblioteca para empezar a construirlo."
          icon="layout"
        />
      ) : (
        <View
          style={{
            flexDirection: gallery ? "row" : "column",
            flexWrap: gallery ? "wrap" : "nowrap",
            gap: 14,
          }}
        >
          {document.works.map(({ artwork, media }, i) => (
            <View
              key={artwork.id}
              style={{
                width: gallery ? "47.5%" : "100%",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <ArtworkImage
                media={media}
                alt={artwork.altText}
                style={{ height: gallery ? 185 : 350, borderRadius: 4 }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: document.config.accentColor,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {String(i + 1).padStart(2, "0")} / {artwork.year}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: gallery ? 14 : 21,
                  lineHeight: gallery ? 21 : 29,
                }}
              >
                {artwork.title}
              </Text>
              <Text
                style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}
              >
                {artwork.technique}
              </Text>
              {!gallery ? (
                <Text style={{ fontSize: 13, lineHeight: 23 }}>
                  {artwork.description}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
