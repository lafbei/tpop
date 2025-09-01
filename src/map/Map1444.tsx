import { MapInteractionCSS } from 'react-map-interaction';
import { Piece } from './Piece';
import { tokenSizes } from '../constants/tokensizes';
import { Locations } from '../constants/locations';

// This component uses CSS to scale your content.
// Just pass in content as children and it will take care of the rest.
export const Map1444 = () => {
  return (
    <MapInteractionCSS>
      <img src="src/assets/maps/mainmap.jpg" />
      map({Object.entries(Locations).map(([name, coords]) => (
        <Piece key={name} imagePath={`src/assets/tokens/yellowtown.png`} mapLocation={coords} size={tokenSizes.small} />
      ))})
    </MapInteractionCSS>
  );
}