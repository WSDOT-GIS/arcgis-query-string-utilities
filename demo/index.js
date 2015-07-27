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