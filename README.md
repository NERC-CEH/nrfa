# NRFA
[National River Flow Archive](https://nrfa.ceh.ac.uk) github
## NRFA JavaScript example
The js folder is self-contained and (using index.html) is a simple html web page example of how to display NRFA riverflow stations on a [Leaflet map](https://leafletjs.com).
When you click on one of the map's station markers, then the detail about that station will load from the NRFA API as well as a [Plotly graph](https://plot.ly/javascript/) of the NRFA's catchment daily rainfall (CDR) and gauged daily flow (GDF) for that station for a given date range.
Detailed code comments are available in the app.js file that describes how the application works.
A simple stylesheet is included to layout the various items on the page.
### Installation
Clone the js folder and open index.html in a web browser. All the dependencies are included via CDN as per the links below.
### Dependencies
[jQuery](https://code.jquery.com/): [v3.4.1](https://code.jquery.com/jquery-3.4.1.min.js)
[Leaflet](https://leafletjs.com): [v1.5.1](https://unpkg.com/leaflet@1.5.1/dist/leaflet.js)
[Moment.js](https://momentjs.com): [v2.24.0](https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js)
[Plotly](https://plot.ly/javascript/): ['latest', currently v1.49.0](https://cdn.plot.ly/plotly-latest.min.js)
