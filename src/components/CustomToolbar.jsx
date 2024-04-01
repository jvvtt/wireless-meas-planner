import * as L from 'leaflet'
import { useMap } from "react-leaflet"

var iconTitle = [
    'Drone node marker',
  ];
  
  var iconUrl = [
    './public/drone-marker.png',
  ];

export function CustomToolbar({children, drawOpts}) {
    const geo_map = useMap()

    const createDrawnMarker = (id, type) => {
        const icon = L.icon({
          iconUrl: iconUrl[id],
          iconSize: [25, 25],
          iconAnchor: [12, 25],
          tooltipAnchor: [12, -12]
        });
        icon.myType = type;
        var marker = new L.Draw.Marker(geo_map, {icon: icon});
        return(marker);
    }

    L.DrawToolbar.include({
        getModeHandlers: function (geo_map) {
          return [
            {
              enabled: drawOpts.rectangle,
              handler: new L.Draw.Rectangle(geo_map, this.options.rectangle),
				      title: L.drawLocal.draw.toolbar.buttons.rectangle                  
            },
            {
              enabled: drawOpts.polyline,
              handler: new L.Draw.Polyline(geo_map, this.options.polyline),
				      title: 'Measure distance'
            },
            {
              enabled: drawOpts.circle,
              handler: new L.Draw.Circle(geo_map, this.options.circle),
				      title: L.drawLocal.draw.toolbar.buttons.circle
            },
            {
              enabled: drawOpts.circlemarker,
              handler: new L.Draw.CircleMarker(geo_map, this.options.circlemarker),
				      title: 'Ground node marker'
            },
            {
              enabled: drawOpts.polygon,
              handler: new L.Draw.Polygon(geo_map, this.options.polygon),
				      title: 'Define the Flight Geography'
            },
            {
              enabled: true,
              handler: createDrawnMarker(0, 'Drone'),
              title: iconTitle[0]
            }
          ];
        }
    });

    /*
    const drawButtons = document.getElementsByClassName('leaflet-draw-draw-marker');
    for (let i = 0; i < drawButtons.length; i++) {
        let j = iconTitle.indexOf(drawButtons[i].title);
        drawButtons[i].style.backgroundImage ='url(' + iconUrl[j] + ')';
        drawButtons[i].style.backgroundSize = '25px 25px';
        drawButtons[i].style.backgroundPositionX = '2px';
        drawButtons[i].style.backgroundPositionY = '2px';
    }
    */
    
}

  

