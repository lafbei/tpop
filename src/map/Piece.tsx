type PieceProps = {
  imagePath: string;
  mapLocation: { x: number; y: number; };
  size: { width: number; height: number; };
};

export function Piece({ imagePath, mapLocation, size }: PieceProps) {
    return (
        <div className="piece" style={{ position: 'absolute', left: mapLocation.x + '%', top: mapLocation.y + '%', width: size.width, height: size.height, backgroundImage: `url(${imagePath})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'translate(-50%, -50%)' }} />
    );
}