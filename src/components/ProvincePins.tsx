export type Locs = Record<string, { x: number; y: number }>;

type Props = {
  locations: Locs;
  onSelect?: (name: string) => void;
  hovered?: string | null;
};

export default function ProvincePins({ locations, onSelect, hovered }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(locations).map(([name, p]) => (
        <button
          key={name}
          className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto rounded-full border
            ${hovered === name ? "w-4 h-4 border-2" : "w-3 h-3 border"} bg-white/70`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          title={name}
          onClick={(e) => { e.stopPropagation(); onSelect?.(name); }}
        />
      ))}
    </div>
  );
}
