import QueryStringManager from "@wsdot/arcgis-query-string-utilities";
import { loadModules } from "esri-loader";

loadModules(["esri/arcgis/utils", "esri/dijit/LayerList", "esri/map"], {
  css: "https://js.arcgis.com/3.24/esri/css/esri.css",
  url: "https://js.arcgis.com/3.24/",
  dojoConfig: {
    async: true
  }
}).then(([arcgisUtils, LayerList, EsriMap]) => {
  const mapId = "927b5daaa7f4434db4b312364489544d";

  const createMapOptions: any = {
    usePopupManager: true
  };

  // /**
  //  * Gets the layer's position in its collection (either map.graphicsLayersIds or map.layerIds).
  //  * @param {esri/Map} map
  //  * @param {string} layerId
  //  * @returns {number}
  //  */
  // function getLayerOrdinal(map: EsriMap, layerId: string): number | null {
  //   let ord = null,
  //     i,
  //     l;

  //   for (i = 0, l = map.graphicsLayerIds.length; i < l; i += 1) {
  //     if (map.graphicsLayerIds[i] === layerId) {
  //       ord = i + 1;
  //       break;
  //     }
  //   }

  //   if (ord === null) {
  //     for (i = 0, l = map.layerIds.length; i < l; i += 1) {
  //       if (map.layerIds[i] === layerId) {
  //         ord = i + 1;
  //         break;
  //       }
  //     }
  //   }

  //   return ord;
  // }

  // Update the map constructor options with those defined in the query string.
  createMapOptions.mapOptions = QueryStringManager.getMapInitOptions(
    createMapOptions
  );

  arcgisUtils
    .createMap(mapId, "map", createMapOptions)
    .then((response: any) => {
      // Get the map object.
      const map = response.map;

      // Create the QueryStringManager.
      // tslint:disable-next-line:no-unused-expression
      new QueryStringManager(map);

      const layers = arcgisUtils.getLayerList(response);
      const tocDiv = document.getElementById("toc")!;

      const layerList = new LayerList({ map, layers }, tocDiv);
      layerList.startup();

      // TODO: Update the layers' visibility to match the query string.
      const layersInfo = QueryStringManager.getLayerVisibilityInfo();
      //   if (layersInfo) {
      //     for (const layerId in layersInfo) {
      //       if (layersInfo.hasOwnProperty(layerId)) {
      //         const qs = ["input[value='", "']"].join(layerId);
      //         const checkbox = layerList.root.querySelector(qs);
      //         if (checkbox) {
      //           checkbox.checked = true;
      //           const layer = map.getLayer(layerId);
      //           layer.suspend();
      //           layer.show();
      //           const layerInfo = layersInfo[layerId];
      //           // set sublayers.
      //           if (layer.setVisibleLayers && Array.isArray(layerInfo)) {
      //             layer.setVisibleLayers(layerInfo);
      //           }
      //           layer.resume();
      //         } else {
      //           console.warn("checkbox not found", qs);
      //         }
      //       }
      //     }
      //   }
    });
});
