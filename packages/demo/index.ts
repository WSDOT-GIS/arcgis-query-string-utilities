import QueryStringManager, {
  IVisibilityInfo,
  supportsURLParams
} from "@wsdot/arcgis-query-string-utilities";

import arcgisUtils from "esri/arcgis/utils";
import LayerList from "esri/dijit/LayerList";
import ArcGISDynamicMapServiceLayer from "esri/layers/ArcGISDynamicMapServiceLayer";
import Layer from "esri/layers/layer";

const mapId = "927b5daaa7f4434db4b312364489544d";

const createMapOptions: any = {
  usePopupManager: true
};

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
