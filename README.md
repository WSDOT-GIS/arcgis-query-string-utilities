ArcGIS API for JavaScript Query String Utilities
================================================

Uses [URL API] and [Browser History] to update the web browsers URL query string as a map's extent is changed.

[Demo](http://wsdot-gis.github.com/arcgis-query-string-utilities/demo/)


Installation
------------
Run the following command to install this module using [Bower].

    bower install arcgis-query-string-utilities --save


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

[Bower]:http://bower.io
[Browser History]:https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
[URL API]:https://url.spec.whatwg.org/#api
