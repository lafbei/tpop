import { MapInteractionCSS } from 'react-map-interaction';
import { Piece } from './Piece';
import { tokenSizes } from '../data/tokensizes';
import { ProvinceLocations } from '../data/provinceLocations';
import { Sprites } from '../assets/sprites';
import { TradeNodeLocations } from '../data/tradeNodeLocations';

// This component uses CSS to scale your content.
// Just pass in content as children and it will take care of the rest.
export const Map1444 = () => {
  return (
    <div className="w-full h-full bg-slate-800">
      <MapInteractionCSS>
        <img src="src/assets/maps/mainmap.jpg" />
        map({Object.entries(ProvinceLocations).map(([name, coords]) => (
          <Piece key={name} imagePath={Sprites.greentown} mapLocation={coords} size={tokenSizes.small.width} />
        ))})
        map({Object.entries(TradeNodeLocations).map(([name, coords]) => (
          <Piece key={name} imagePath={Sprites.yellowtown} mapLocation={coords} size={tokenSizes.large.width} />
        ))})
      </MapInteractionCSS>
    </div>
  );
}