import QueryStringManager, {
  IVisibilityInfo,
  NotSupportedError,
  supportsURLParams
} from "@wsdot/arcgis-query-string-utilities";

import arcgisUtils = require("esri/arcgis/utils");
import LayerList = require("esri/dijit/LayerList");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import Layer = require("esri/layers/layer");
import EsriMap = require("esri/map");

const mapId = "927b5daaa7f4434db4b312364489544d";

const createMapOptions: any = {
  usePopupManager: true
};

/**
 * Gets the layer's position in its collection (either map.graphicsLayersIds or map.layerIds).
 * @param map
 * @param layerId
 */
function getLayerOrdinal(map: EsriMap, layerId: string) {
  let ord: number | null = null;

  for (let i = 0, l = map.graphicsLayerIds.length; i < l; i += 1) {
    if (map.graphicsLayerIds[i] === layerId) {
      ord = i + 1;
      break;
    }
  }

  if (ord === null) {
    for (let i = 0, l = map.layerIds.length; i < l; i += 1) {
      if (map.layerIds[i] === layerId) {
        ord = i + 1;
        break;
      }
    }
  }

  return ord;
}

const urlParamsSupported = supportsURLParams();

if (!urlParamsSupported) {
  console.warn(
    "This browser does not support required features. One or more of the following is not supported: URL, URLSearchParams, URL.prototype.searchParams"
  );
}

if (urlParamsSupported) {
  // Update the map constructor options with those defined in the query string.
  createMapOptions.mapOptions = QueryStringManager.getMapInitOptions(
    createMapOptions
  );
}

arcgisUtils.createMap(mapId, "map", createMapOptions).then((response: any) => {
  // Get the map object.
  const map = response.map;

  if (urlParamsSupported) {
    // Create the QueryStringManager.
    // tslint:disable-next-line:no-unused-expression
    new QueryStringManager(map);
  }

  const layers = arcgisUtils.getLayerList(response);
  const tocDiv = document.getElementById("toc")!;

  const layerList = new LayerList({ map, layers }, tocDiv);
  layerList.startup();

  let layersInfo: IVisibilityInfo | null = null;
  if (urlParamsSupported) {
    // Update the layers' visibility to match the query string.
    layersInfo = QueryStringManager.getLayerVisibilityInfo();
  }

  if (!layersInfo) {
    return;
  }

  for (const layerId in layersInfo) {
    if (layersInfo.hasOwnProperty(layerId)) {
      // Get layers with matching ID. (There should only be one match at most.)
      const matchingLayers: Layer[] = layerList.layers
        .filter(l => l.id === layerId)
        .map(l => l.layer);
      if (!matchingLayers.length) {
        continue;
      }
      for (const layer of matchingLayers) {
        const layerInfo = layersInfo[layerId];
        layer.suspend();
        try {
          if (layerInfo) {
            layer.show();
          }
          const dynamicLayer = layer as ArcGISDynamicMapServiceLayer;
          if (Array.isArray(layerInfo) && dynamicLayer.setVisibleLayers) {
            dynamicLayer.setVisibleLayers(layerInfo);
          }
        } finally {
          layer.resume();
        }
      }
    }
  }
});
