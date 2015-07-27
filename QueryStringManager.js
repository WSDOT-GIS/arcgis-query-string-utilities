/// <reference path="C:\Users\jacobsj\Documents\GitHub\arcgis-query-string-utilities\bower_components/polyfills/url.js" />
/*global define*/
define(function () {
    "use strict";
    /**
     * Uses a Map's geographicExtent property to determine it's center.
     * @param {esri/Map} map
     * @returns {number[]} An array of two values: x and y coordinates of the center of the map.
     */
    function getCenter(map) {
        var gx = map.geographicExtent;
        var x = gx.xmax - ((gx.xmax - gx.xmin) / 2);
        var y = gx.ymax - ((gx.ymax - gx.ymin) / 2);
        return [x, y];
    }

    /**
     * 
     * @this {esri/Map}
     */
    var updateQueryString = function (e) {
        var center = getCenter(this);
        var zoom = e.lod.level;
        var state = {
            center: center,
            zoom: zoom
        };
        console.log(state);
        //var searchParams = new URLSearchParams(window.location.search);
        var url = new URL(window.location.href);
        url.searchParams.set("center", center.join(","));
        url.searchParams.set("zoom", zoom);
        history.replaceState(state, document.title, url.toString());
    };

    /**
     * Updates the URL's query string in the browser as the map is changed.
     * @param {esri/Map} map
     */
    var QueryStringManager = function (map) {
        this.map = map;
        map.on("extent-change", updateQueryString);
    };

    /**
     * Gets an options object using options defined in the query string.
     * @param {Object} [options] - If an object is provided, the query string options will be added to it. Otherwise a new object will be created.
     * @returns {Object}
     */
    QueryStringManager.getMapInitOptions = function(options) {
        // If no options were specified, create a new one.
        options = options || {};
        var url = new URL(window.location.href);
        // Get the center from the URL.
        var center = url.searchParams.get("center");
        if (center) {
            center = center.split(",").map(function (n) {
                return Number(n);
            });
            options.center = center;
        }
        // Get the zoom from the URL
        var zoom = url.searchParams.get("zoom");
        if (zoom) {
            zoom = parseInt(zoom, 10);
            options.zoom = zoom;
        }

        return options;
    };

    return QueryStringManager;
});