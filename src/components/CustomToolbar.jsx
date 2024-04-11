import * as L from "leaflet";
import { useMap } from "react-leaflet";
import { droneIcon, iconPoiGndHeading } from "../leaflet-ui/controls.js";

var iconTitle = ["Drone node marker"];

export function CustomToolbar({ children, drawOpts }) {
  const geo_map = useMap();

  const createDrawnMarker = (type) => {
    let marker;
    if (type === "Drone") {
      droneIcon.myType = type;
      marker = new L.Draw.Marker(geo_map, { icon: droneIcon });
    } else if (type === "POI-GND-HEAD") {
      iconPoiGndHeading.myType = type;
      marker = new L.Draw.Marker(geo_map, { icon: iconPoiGndHeading });
    }
    return marker;
  };

  L.DrawToolbar.include({
    getModeHandlers: function (geo_map) {
      return [
        {
          enabled: drawOpts.rectangle,
          handler: new L.Draw.Rectangle(geo_map, this.options.rectangle),
          title: L.drawLocal.draw.toolbar.buttons.rectangle,
        },
        {
          enabled: drawOpts.polyline,
          handler: new L.Draw.Polyline(geo_map, this.options.polyline),
          title: "Measure distance",
        },
        {
          enabled: drawOpts.circle,
          handler: new L.Draw.Circle(geo_map, this.options.circle),
          title: L.drawLocal.draw.toolbar.buttons.circle,
        },
        {
          enabled: drawOpts.circlemarker,
          handler: new L.Draw.CircleMarker(geo_map, this.options.circlemarker),
          title: "Ground node marker",
        },
        {
          enabled: drawOpts.polygon,
          handler: new L.Draw.Polygon(geo_map, this.options.polygon),
          title: "Define the Flight Geography",
        },
        {
          enabled: true,
          handler: createDrawnMarker("Drone"),
          title: iconTitle[0],
        },
        {
          enabled: true,
          handler: createDrawnMarker("POI-GND-HEAD"),
          title: "POI for GND heading",
        },
      ];
    },
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
