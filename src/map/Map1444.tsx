import { MapInteractionCSS } from 'react-map-interaction';
import { Piece } from './Piece';
import { tokenSizes } from '../data/tokensizes';
import { Locations } from '../data/locations';
import { Sprites } from '../assets/sprites';

// This component uses CSS to scale your content.
// Just pass in content as children and it will take care of the rest.
export const Map1444 = () => {
  return (
    <div className="w-full h-full bg-slate-800">
      <MapInteractionCSS>
        <img src="src/assets/maps/mainmap.jpg" />
        map({Object.entries(Locations).map(([name, coords]) => (
          <Piece key={name} imagePath={Sprites.greentown} mapLocation={coords} size={tokenSizes.small.width} />
        ))})
      </MapInteractionCSS>
    </div>
  );
}