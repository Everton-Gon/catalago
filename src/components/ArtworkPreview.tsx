import { useEffect, useState } from "react";
import { readArtwork, type Artwork } from "@/utils/artwork";

export default function ArtworkPreview({ image }: { image: Artwork }) {
  const [src, setSrc] = useState("");
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let active = true,
      url = "";
    setSrc("");
    setMissing(false);
    void readArtwork(image.id)
      .then((file) => {
        if (active) {
          url = URL.createObjectURL(file);
          setSrc(url);
        }
      })
      .catch(() => {
        if (active) setMissing(true);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [image.id]);
  return (
    <div className="my-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
      {src && (
        <img
          src={src}
          alt={`Arte anexada: ${image.name}`}
          className="size-16 rounded-lg object-contain"
        />
      )}
      <div className="min-w-0 text-xs">
        <p className="break-all font-semibold">{image.name}</p>
        <p
          role="status"
          className={missing ? "text-red-700" : "text-brand-700"}
        >
          {missing
            ? "Imagem indisponível. Edite o item e anexe novamente."
            : "Imagem anexada ao produto"}
        </p>
        <p className="mt-1 text-ink-500">
          Será salva ao registrar o orçamento.
        </p>
      </div>
    </div>
  );
}
