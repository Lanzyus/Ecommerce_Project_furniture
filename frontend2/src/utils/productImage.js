const API_URL = "http://127.0.0.1:8001";

export const getProductImage = (product) => {
  if (!product) {
    return "/placeholder.jpg";
  }

  const primaryMedia =
    product.media?.find((item) => item.is_primary) ??
    product.media?.[0];

  if (!primaryMedia?.file) {
    return "/placeholder.jpg";
  }

  // Already an absolute URL
  if (
    primaryMedia.file.startsWith("http://") ||
    primaryMedia.file.startsWith("https://")
  ) {
    return primaryMedia.file;
  }

  // Ensure there is exactly one slash
  const filePath = primaryMedia.file.startsWith("/")
    ? primaryMedia.file
    : `/${primaryMedia.file}`;

  return `${API_URL}${filePath}`;
};

export default getProductImage;