'use strict';
const axios = require('axios');
const debug = require('debug')("google:dm");
const qs = require('qs-google-signature');

var validTravelModes = ['driving', 'walking', 'bicycling', 'transit'];
var validUnits = ['metric', 'imperial'];
var validRestrictions = ['tolls', 'highways', 'ferries', 'indoor'];

var GOOGLE_DISTANCE_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json?',
    SEPARATOR = '|',

    // free api key
    GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || null,

    // maps for business users key
    GOOGLE_CLIENT_KEY = process.env.GOOGLE_BUSINESS_CLIENT_KEY || null,
    GOOGLE_SIGNATURE_KEY = process.env.GOOGLE_SIGNATURE_KEY || null;


var GoogleDistanceMatrix = function () {
    this.options = {
        origins: null,
        destinations: null,
        mode: 'driving',
        units: 'metric',
        language: 'en',
        avoid: null
    }
    if (GOOGLE_CLIENT_KEY && GOOGLE_SIGNATURE_KEY) {
        debug("Using Business Client/Key pair", GOOGLE_CLIENT_KEY, GOOGLE_SIGNATURE_KEY)
        this.options.client = GOOGLE_CLIENT_KEY;
        this.options.signature = GOOGLE_SIGNATURE_KEY;
    } else {
        debug("Using simple API Key", GOOGLE_API_KEY)
        this.options.key = GOOGLE_API_KEY;
    }
};

function formatLocations(locations) {
    return locations.join(SEPARATOR);
}

async function makeRequest(options, callback) {
    debug("request options", options)
    var requestURL = GOOGLE_DISTANCE_API_URL + qs.stringify(options, GOOGLE_DISTANCE_API_URL);
    debug("requestURL", requestURL)
    return await axios.get(requestURL)
        .then(response => response.data)
        .catch((error) => error);
    // console.log(requestURL);
}

GoogleDistanceMatrix.prototype.matrix = function (args, cb) {
    // format arguments
    this.options.origins = formatLocations(arguments[0]);
    this.options.destinations = formatLocations(arguments[1]);

    // makes a request to google api
    return makeRequest(this.options)
}

GoogleDistanceMatrix.prototype.mode = function (mode) {
    if (validTravelModes.indexOf(mode) < 0) {
        throw new Error('Invalid mode: ' + mode);
    }
    this.options.mode = mode;
}

GoogleDistanceMatrix.prototype.language = function (language) {
    this.options.language = language;
}

GoogleDistanceMatrix.prototype.avoid = function (avoid) {
    if (validRestrictions.indexOf(avoid) < 0) {
        throw new Error('Invalid restriction: ' + avoid);
    }
    this.options.avoid = avoid;
}

GoogleDistanceMatrix.prototype.units = function (units) {
    if (validUnits.indexOf(units) < 0) {
        throw new Error('Invalid units: ' + units);
    }
    this.options.units = units;
}

GoogleDistanceMatrix.prototype.departure_time = function (departure_time) {
    this.options.departure_time = departure_time;
}

GoogleDistanceMatrix.prototype.arrival_time = function (arrival_time) {
    this.options.arrival_time = arrival_time;
}

GoogleDistanceMatrix.prototype.key = function (key) {
    delete this.options.client;
    delete this.options.signature;
    this.options.key = key;
}

GoogleDistanceMatrix.prototype.client = function (client) {
    delete this.options.key;
    this.options.client = client;
}

GoogleDistanceMatrix.prototype.signature = function (signature) {
    delete this.options.key;
    this.options.signature = signature;
}

GoogleDistanceMatrix.prototype.traffic_model = function (trafficModel) {
    this.options.traffic_model = trafficModel;
}

GoogleDistanceMatrix.prototype.transit_mode = function (transitMode) {
    this.options.transit_mode = transitMode;
}

GoogleDistanceMatrix.prototype.transit_routing_preference = function (transitRoutingPreference) {
    this.options.transit_routing_preference = transitRoutingPreference;
}

GoogleDistanceMatrix.prototype.reset = function () {
    this.options = {
        origins: null,
        destinations: null,
        mode: 'driving',
        units: 'metric',
        language: 'en',
        avoid: null
    };
}

module.exports = new GoogleDistanceMatrix();