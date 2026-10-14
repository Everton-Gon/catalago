import { HOME_BANNERS, type HomeBanner } from "./homeBanners";

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  order: number;
}
export interface ManagedBanner extends HomeBanner {
  active: boolean;
  order: number;
}
export interface StorefrontContent {
  banners: ManagedBanner[];
  collections: Collection[];
  intervalMs: number;
}
export const DEFAULT_CONTENT: StorefrontContent = {
  banners: HOME_BANNERS.map((banner, order) => ({
    ...banner,
    active: Boolean(banner.image),
    order,
  })),
  collections: [
    "Gospel",
    "Filmes e séries",
    "Animes e desenhos",
    "Games",
    "Presentes",
  ].map((name, order) => ({
    id: ["gospel", "filmes-series", "animes-desenhos", "games", "presentes"][
      order
    ],
    slug: ["gospel", "filmes-series", "animes-desenhos", "games", "presentes"][
      order
    ],
    name,
    description: "",
    image: HOME_BANNERS[order]?.image ?? "",
    active: true,
    order,
  })),
  intervalMs: 6000,
};
export function activeBanners(content: StorefrontContent) {
  return content.banners
    .filter(
      (banner): banner is ManagedBanner & { image: string } =>
        banner.active && Boolean(banner.image),
    )
    .sort((a, b) =>
      a.id === "gospel" ? -1 : b.id === "gospel" ? 1 : a.order - b.order,
    );
}
