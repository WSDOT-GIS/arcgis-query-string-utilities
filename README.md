ArcGIS API for JavaScript Query String Utilities
================================================

Uses [URL API] and [Browser History] to update the web browsers URL query string as a map's extent is changed.

[Demo](http://wsdot-gis.github.com/arcgis-query-string-utilities/demo/)

Usage
-----

```javascript
require(["esri/map", "QueryStringManager"], function (Map, QueryStringManager) {
    var map;

    var mapOptions = {
        basemap: "hybrid",
        center: [-120.80566406246835, 47.41322033015946],
        zoom: 7,
        showAttribution: true
    };

    // Update the map constructor options with those defined in the query string.
    mapOptions = QueryStringManager.getMapInitOptions(mapOptions);

    map = new Map("map", mapOptions);

    var qsManager = new QueryStringManager(map);
});
```

[URL API]:https://url.spec.whatwg.org/#api
[Browser History]:https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history