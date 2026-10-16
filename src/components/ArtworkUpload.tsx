import { useId, useState } from "react";
import { saveArtwork, type Artwork } from "@/utils/artwork";
import ArtworkPreview from "./ArtworkPreview";

export default function ArtworkUpload({
  image,
  onChange,
  onBusy,
}: {
  image?: Artwork;
  onChange: (image?: Artwork) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800">
        {image ? "Substituir foto ou arte" : "Enviar foto ou arte"}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-3 file:text-brand-800"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          onBusy?.(true);
          setError("");
          try {
            onChange(await saveArtwork(file));
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : "Falha ao anexar imagem.",
            );
          } finally {
            setBusy(false);
            onBusy?.(false);
          }
        }}
      />
      <p className="mt-2 text-xs text-ink-500">
        JPG, PNG ou WebP, até 3 MB. A imagem será enviada por link no WhatsApp.
      </p>
      {busy && (
        <p role="status" className="text-sm">
          Preparando imagem…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {image && (
        <>
          <ArtworkPreview image={image} />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="min-h-11 text-sm font-semibold text-brand-700 underline"
          >
            Remover imagem
          </button>
        </>
      )}
    </div>
  );
}
