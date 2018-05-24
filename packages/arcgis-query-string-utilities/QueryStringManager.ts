import { MapOptions } from "esri";
import Layer = require("esri/layers/layer");
import EsriMap = require("esri/map");

// tslint:disable:max-classes-per-file

export class NotSupportedError extends Error {
  public readonly unsupported: string[];
  constructor(...unsupported: string[]) {
    super(`Browser does not support these required features: ${unsupported}`);
    this.unsupported = unsupported;
  }
}

/**
 * Detects support for URL and URLSearchParams.
 */
export function supportsURLParams() {
  if (typeof URL !== "undefined" && typeof URLSearchParams !== "undefined") {
    const url = new URL("http://localhost");
    return !!url.searchParams;
  }
  return false;
}

function getVisibleLayersQSValue(map: EsriMap) {
  const layersObj: {
    [key: string]: number[] | boolean;
  } = {};

  function loop(layerIds: string[], filterOutBasemaps?: boolean) {
    for (const layerId of layerIds) {
      const layer = map.getLayer(layerId);
      if (!layer.visible) {
        continue;
      }

      if (!map.basemapLayerIds) {
        console.warn("esri/Map.basemapLayerIds is undefined");
      } else if (
        filterOutBasemaps &&
        map.basemapLayerIds.indexOf(layerId) !== -1
      ) {
        continue;
      }

      if ((layer as any).setVisibleLayers) {
        layersObj[layerId] = (layer as any).visibleLayers;
      } else {
        layersObj[layerId] = true;
      }
    }
  }

  loop(map.layerIds, true);
  loop(map.graphicsLayerIds);

  return layersObj;
}

/**
 * Parses a comma separated number string into an array of numbers.
 * @param {string} s
 * @returns {number[]}
 */
function parseFloatArray(s: string) {
  return s.split(",").map(n => parseFloat(n));
}

/**
 * Uses a Map's geographicExtent property to determine it's center.
 * @param {esri/Map} map
 * @returns {number[]} An array of two values: x and y coordinates of the center of the map.
 */
function getCenter(map: EsriMap): [number, number] {
  const gx = map.geographicExtent;
  const x = gx.xmax - (gx.xmax - gx.xmin) / 2;
  const y = gx.ymax - (gx.ymax - gx.ymin) / 2;
  return [x, y];
}

export interface IVisibilityInfo {
  [s: string]: number[];
}

/**
 * Updates the URL's query string in the browser as the map is changed.
 * @param {esri/Map} map
 */
export default class QueryStringManager {
  /**
   * Gets an options object using options defined in the query string.
   * @param options If an object is provided, the query string options
   * will be added to it. Otherwise a new object will be created.
   * @throws {NotSupportedError} Calling this method from a browser that does not support URLSearchParams or URL will throw a NotSupportedError.
   */
  public static getMapInitOptions(options?: MapOptions) {
    // If no options were specified, create a new one.
    if (supportsURLParams()) {
      options = options || {};
      const url = new URL(window.location.href);
      // Get the center from the URL.
      const centerString = url.searchParams.get("center");
      if (centerString) {
        const center = parseFloatArray(centerString);
        options.center = center;
      }
      // Get the zoom from the URL
      const zoomString = url.searchParams.get("zoom");
      if (zoomString) {
        const zoom = parseInt(zoomString, 10);
        options.zoom = zoom;
      }
      return options;
    } else {
      throw new NotSupportedError("URLSearchParams");
    }
  }

  /**
   * Retrieves the layer info from the query string.
   * @returns {Object.<string, number[]>}
   */
  public static getLayerVisibilityInfo() {
    let layerInfo: IVisibilityInfo | null = null;
    if (supportsURLParams()) {
      const url = new URL(window.location.href);
      const layerInfoJson = url.searchParams.get("layers") || null;

      if (layerInfoJson) {
        try {
          layerInfo = JSON.parse(layerInfoJson);
        } catch (e) {
          layerInfo = null;
          console.warn(
            "Could not parse layer info data from query string",
            layerInfo
          );
        }
      }
    }
    return layerInfo;
  }
  /**
   * Creates a new instance of QueryStringManager.
   * @param map An ArcGIS API map
   * @throws {NotSupportedError} Thrown if called from browser that does not support URL or URLSearchParameters.
   */
  constructor(public readonly map: EsriMap) {
    if (!supportsURLParams()) {
      throw new NotSupportedError("URL", "URLSearchParams");
    }
    /**
     * Updates the query string in the browsers URL when the map
     * is zoomed or if a layer's visibility changes.
     * @this {(esri/Map|esri/layers/Layer)}
     */
    const updateQueryString = function(
      this: EsriMap | Layer | void,
      e: any | null
    ) {
      if (e == null) {
        throw new Error("No event parameter was provided.");
      }

      const url = new URL(window.location.href);

      const layersValueJson = url.searchParams.get("layers");
      let layersValue: any;
      if (layersValueJson) {
        try {
          layersValue = JSON.parse(layersValueJson);
        } catch (err) {
          console.warn("Error parsing JSON", err);
          layersValue = getVisibleLayersQSValue(map);
        }
      } else {
        layersValue = getVisibleLayersQSValue(map);
      }
      const state = {
        center: getCenter(map),
        zoom: map.getLevel(), // e.lod.level,
        layers: layersValue
      };

      if (e.lod) {
        url.searchParams.set("center", state.center.join(","));
        url.searchParams.set("zoom", state.zoom.toString(10));
      } else if (
        e.hasOwnProperty("visible") ||
        e.hasOwnProperty("visibleLayers") ||
        e.hasOwnProperty("layer")
      ) {
        const layer = e.layer || (this as Layer);

        if (layer.visible) {
          // TODO: Add or update layers object
          if (layer.visibleLayers) {
            layersValue[layer.id] = layer.visibleLayers;
          } else {
            layersValue[layer.id] = true;
          }
        } else {
          // Remove this layer from the query string layers object.
          if (layersValue.hasOwnProperty(layer.id)) {
            delete layersValue[layer.id];
          }
        }
        state.layers = layersValue;
        url.searchParams.set("layers", JSON.stringify(layersValue));
      }

      history.replaceState(state, document.title, url.toString());
    };

    map.on("extent-change", updateQueryString);

    function setEventsForLayer(layer: Layer) {
      layer.on("visibility-change", updateQueryString);
      if ((layer as any).setVisibleLayers) {
        layer.on("visible-layers-change", updateQueryString);
      }
    }

    // Attach layer events for layers currently in the map.
    [map.layerIds, map.graphicsLayerIds].forEach(layerIds => {
      layerIds.forEach(id => {
        const layer = map.getLayer(id);
        setEventsForLayer(layer);
      });
    });

    // Add event handler for map so that newly added layers will also be in the query string.
    map.on("layer-add-result", e => {
      if (e.layer) {
        setEventsForLayer(e.layer);
      }
      updateQueryString(e);
    });
  }
}
