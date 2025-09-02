// Piece.tsx
export function Piece({
  imagePath,
  mapLocation, // { x: %, y: % }
  size,
}: {
  imagePath: string;
  mapLocation: { x: number; y: number };
  size: number | string;
}) {
  return (
    <img
      src={imagePath}
      className="absolute pointer-events-auto"
      style={{
        left: `${mapLocation.x}%`,
        top: `${mapLocation.y}%`,
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        transform: "translate(-50%, -50%)",
      }}
      alt=""
    />
  );
}
