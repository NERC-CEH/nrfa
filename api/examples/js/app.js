//Create a global variable to scope the application.
var app = {};
//Set some options that you can override with the start and end year input boxes.

app.options = {
    startDate: '2017-01-01',
    endDate: '2019-12-31'
};

//init is the main function that is called on document.ready().
app.init = function () {
    //load in the Leaflet (L) map set at the centre of the UK. 
    var map = L.map('mapDiv').setView([55, -2], 5);
    //We're using simple web map services (WMS) of the CEH IHU areas and UK coastline here as a background to the map so we don't need to worry about paying for map layers. 
    //You can get map background layers from OpenStreetMap via services like mapbox.com, after you have requested an access key, see https://leafletjs.com/examples/quick-start/.
    //Create a Leaflet WMS tileLayer for the IHU groups.
    L.tileLayer.wms('https://wlwater.ceh.ac.uk/arcgis/services/ihu/groups/MapServer/WMSServer', {
            attribution: '<a href="http://ceh.ac.uk">CEH IHU areas</a>',
            layers: '0',
            format: 'image/png',
            transparent: true
        })
        //Add the WMS to the map we've just created.
        .addTo(map);
    //Create a Leaflet WMS tileLayer for the UK coastline.
    L.tileLayer.wms('https://wlwater.ceh.ac.uk/arcgis/services/basemaps/uk_coastline_vignetted_epsg4326/MapServer/WMSServer', {
            attribution: '<a href="http://ceh.ac.uk">CEH IHU areas</a>',
            layers: '7',
            format: 'image/png',
            transparent: true
        })
        //Add the WMS to the map we've just created.
        .addTo(map);

    //Load the NRFA stations json data from the webservice using jQuery's shorthand getJSON ajax function.
    jQuery.getJSON('https://nrfaapps.ceh.ac.uk/nrfa/ws/station-info?station=*&format=json-object&fields=station-search')
        //When it's loaded, then we can add the data to the map.
        .done(function (response) {
            //We should receive an array of station data.
            console.log('all stations data', response);
            //If there is data then...
            if (typeof response.data != 'undefined' && response.data.length > 0) {
                //Create a loop through the data.
                for (var i = 0; i < response.data.length; i++) {
                    //Set each item in the array to a variable instead of writing response.data[i] repeatedly. 
                    var station = response.data[i];
                    //Filter the map to only the stations that have live data otherwise there will be many empty graphs. station['live-data'] returns a boolean.
                    if (station['live-data']) {
                        //Create a Leaflet marker and add the current station data to its options for use later on. 
                        L.marker([station['lat-long'].latitude, station['lat-long'].longitude], {
                                station: station,
                                title: station.name
                            })
                            //This tooltip will appear when you hover over a station on the map.
                            .bindTooltip(station.name)
                            //Call the clickStationMarker function when a station marker is clicked on.
                            .on('click', app.clickStationMarker)
                            //Finally add this station marker to the map.
                            .addTo(map);
                    }
                }
            }
        })
        //Log the error if the getJSON function fails.
        .fail(function (error) {
            console.log('Error fetching all stations data.', error);
        });

    //If there is already a station chosen, when you click on the updateDateRange button, the graph will replot.
    jQuery('#updateDateRange').on('click', function () {
        //Reset the graph error text.
        jQuery('#graphError').html('');
        //Moment.js is a powerful date library, we're using it here to validate the input dates.
        //Update the start and end date options to the value of the input boxes with the start and end dates of the year respectively.
        app.options.startDate = jQuery('#startYear').val() + '-01-01';
        app.options.endDate = jQuery('#endYear').val() + '-12-31';
        //Stop processing if the start date is after the end date.
        console.log('Is the start date after the end date?', moment(app.options.startDate).isAfter(app.options.endDate));
        if (moment(app.options.startDate).isAfter(app.options.endDate)) {
            //Write an error to the graphError element.
            jQuery('#graphError').html('Start date must be before end date.');
            return;
        }
        //Also stop processing if the date range is greater than five years. Remember that JavaScript starts at zero, hence > 4.
        console.log('Is the date range more than five years?', moment(app.options.endDate).diff(app.options.startDate, 'years') > 4);
        if (moment(app.options.endDate).diff(app.options.startDate, 'years') > 4) {
            //Write an error to the graphError element.
            jQuery('#graphError').html('You can only request up to five years worth of data.');
            return;
        }
        //If there is a 'selected station' already, then replot the graph.
        if (typeof app.options.station != 'undefined') {
            app.drawPlot();
        }
    });
};

//This function is called when a station marker is clicked.
app.clickStationMarker = function (e) {
    console.log('station data', e.target);
    //Set this station to be the 'selected station' within the options object.
    app.options.station = e.target.options.station;
    //Create a string to store the station's html to output to the screen. 
    var html = '<h3>Station information about ' + app.options.station.name + '</h3>';
    //lat-long and grid-reference are nested json objects, so they won't work in the simple 'for' loop below. So I've added them to the html manually.
    html += 'lat/long: ' + app.options.station['lat-long'].string + ', ' + app.options.station['lat-long'].latitude + ', ' + app.options.station['lat-long'].longitude + '<br />';
    html += 'grid-reference: ' + app.options.station['grid-reference'].ngr + ', ' + app.options.station['grid-reference'].easting + ', ' + app.options.station['grid-reference'].northing + '<br />';
    //This loop is to output all the rest of the non-nested items in the station information. It loops through the keys of the station information and outputs the key next to its value.
    for (var property in app.options.station) {
        if (property != 'lat-long' && property != 'grid-reference') {
            html += property + ': ' + app.options.station[property] + '<br />';
        }
    }
    console.log('html', html);
    //Add that html to the div with id=stationInfo for display.
    jQuery('#stationInfo').html(html);
    //Then draw the plot of data.
    app.drawPlot();
}

//Plot the data for the chosen station.
app.drawPlot = function () {
    //Create the URLs for the CDR and GDF webservices, adding in the station name and the start and end dates.
    var cdrUrl = 'https://nrfaapps.ceh.ac.uk/nrfa/json/nhmp-spi-cdr?station=' + app.options.station.id + '&start-date=' + app.options.startDate + '&end-date=' + app.options.endDate;
    var gdfUrl = 'https://nrfaapps.ceh.ac.uk/nrfa/json/gdf-live?station=' + app.options.station.id + '&start-date=' + app.options.startDate + '&end-date=' + app.options.endDate;
    //Plotly has a built in ajax function (Plotly.d3.json) to load and process the json data from the webservice.
    //We need to call it for both CDR and GDF.  
    Plotly.d3.json(cdrUrl, function (error1, cdrResponse) {
        Plotly.d3.json(gdfUrl, function (error2, gdfResponse) {
            //If there are errors, then there is likely to be no response from server. So stop processing data.
            if (error1) {
                console.log('error1', error1);
                return;
            }
            if (error2) {
                console.log('error2', error2);
                return;
            }
            //Otherwise, create the plot.
            console.log('gdf data', gdfResponse);
            console.log('cdr data', cdrResponse);
            //Set the title of the plot to be the station name, set the titles for the axes and set the margins for the plot.
            var layout = {
                title: app.options.station.name,
                yaxis: {
                    title: 'Value'
                },
                xaxis: {
                    title: 'Date'
                },
                margin: {
                    t: 80,
                    l: 40,
                    r: 40,
                    b: 40
                }
            };
            //Create an array of trace objects to add to the map using the unpack function. 
            var traces = [{
                type: "line",
                name: 'CDR',
                x: app.unpack(cdrResponse.data, 'date-time'),
                y: app.unpack(cdrResponse.data, 'value'),
                id: '18'
            }, {
                type: "line",
                name: 'GDF',
                x: app.unpack(gdfResponse.data, 'date-time'),
                y: app.unpack(gdfResponse.data, 'value'),
                id: '18'
            }];
            console.log('traces', traces);
            //Create the plot; this adds the plot to the div with id=plotlyDiv, adds the traces and sets the layout.
            Plotly.react('plotlyDiv', traces, layout);
        })
    })
}

//This function creates an array of values for the specific key to add to the graph, it creates the arrays for the x and y data.
app.unpack = function (rows, key) {
    console.log('key', key);
    var rowData = rows.map(function (row) {
        return row[key];
    });
    console.log('rowData', rowData);
    return rowData;
};

//When the dom of the page is ready, start the app.init function.
jQuery(document).ready(app.init);