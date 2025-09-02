import MapBoard from "../components/MapBoard";
import { ProvinceLocations } from "../data/provinceLocations";

export default function Board() {
  return (
    <div className="w-screen h-screen">
      <MapBoard
        locations={ProvinceLocations}
        captureMode={true} // toggle off in “play mode”
        onProvinceClick={(name) => console.log("Clicked:", name)}
        units={{
          Castile: [
            { area: "Castile", units: ["2 Infantry", "1 Cavalry"] },
          ],
          England: [
            { area: "EastAnglia", units: ["2 Infantry"] },
          ],
        }}
      />
    </div>
  );
}
