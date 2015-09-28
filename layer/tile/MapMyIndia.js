/*
 * MapMyIndia Layer
 */
L.MapMyIndia = L.Class.extend({

    includes: L.Mixin.Events,

    //TODO proper options from mmi api
    options: {
        zoom: 8, scale_control: false, zoom_control: false
    },

    initialize: function (type, options) {
        console.log('initialize');
        L.Util.setOptions(this, options);
        this._ready = mireo.map !== undefined;
        // TODO  this.type = type; ??? is there type for mmi
    },

    onAdd: function (map, insertAtTheBottom) {
        console.log('onAdd');
        this._map = map;
        this._insertAtTheBottom = insertAtTheBottom;
        this._initContainer();
        this._initMapObject();
        map.on('viewreset', this._reset, this);
        this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
        map.on('move', this._update, this);
        this._reset();
        this._update();
    },

    onRemove: function (map) {
        console.log('onRemove');
        // remove layer's DOM elements and listeners
        map.getPanes().overlayPane.removeChild(this._el);
        map.off('viewreset', this._reset, this);
    },

    _reset: function () {
        console.log('_reset');
        this._initContainer();
    },

    setElementSize: function (e, size) {
        e.style.width = size.x + 'px';
        e.style.height = size.y + 'px';
    },

    _initContainer: function () {
        var tilePane = this._map._container,
            first = tilePane.firstChild;

        if (!this._container) {
            this._container = L.DomUtil.create('div', 'mmi-map-container leaflet-top leaflet-left');
            this._container.id = '_MMIMapContainer_' + L.Util.stamp(this);
            //this._container.style.zIndex = 'auto';
        }

        tilePane.insertBefore(this._container, first);
        this.setElementSize(this._container, this._map.getSize());
    },

    _initMapObject: function () {
        if (!this._ready) return;
        var map_div = document.getElementById(this._container.id);
        var map = new mireo.map(map_div, this.options);
        this._mapMyIndia = map;
        this.fire('MapObjectInitialized', { mapObject: map });
    },

    _update: function (force) {
        if (!this._mapMyIndia) return;
        this._resize();
        var center = this._map.getCenter();
        console.log(center);
        var _center = [center.lat, center.lng];
        var zoom = this._map.getZoom();
        console.log(zoom);
        console.log('mmi zoom' + this._mapMyIndia.zoom());

        if (force || this._mapMyIndia.zoom() !== zoom)
            this._mapMyIndia.zoom(16 - zoom);
        var pt = new mireo.wgs.point(_center[0], _center[1]);
        this._mapMyIndia.center(pt);
    },

    _resize: function () {
        var size = this._map.getSize();
        if (this._container.style.width === size.x &&
            this._container.style.height === size.y)
            return;
        this.setElementSize(this._container, size);

    }

});