import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { ImgHTMLAttributes } from "react";

interface PackageImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function PackageImage({ src, alt, className, loading = "lazy", ...rest }: PackageImageProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      {...rest}
    />
  );
}
