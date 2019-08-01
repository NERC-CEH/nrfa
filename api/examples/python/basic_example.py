# -*- coding: utf-8 -*-
"""
NFRA API - Python examples of use

See https://nrfaapps.ceh.ac.uk/nrfa/nrfa-api.html
for a full description of the API and its capabilities.

This script is for Python 3
For Python 2, use urllib2 instead of urllib.request
i.e.
import urllib2
response = urllib2.urlopen(url).read()

"""
import urllib.request
import json

# The base URL to access the NFRA API
base_url = "https://nrfaapps.ceh.ac.uk/nrfa/ws"

# There are three web services available...
# -----------------------------------------------------------------------------
# 1. station-ids
# Returns a list of station identifiers
# -----------------------------------------------------------------------------
# Build request URL
# The response format must be specified
# Here we ask for a JSON object.
# See https://nrfaapps.ceh.ac.uk/nrfa/nrfa-api.html#parameter-format
# for all available formats
query = "format=json-object"
station_ids_url = "{BASE}/station-ids?{QUERY}".format(BASE=base_url,
                                                      QUERY=query)

# Send request and read response
response = urllib.request.urlopen(station_ids_url).read()

# Decode from JSON to Python dictionary
response = json.loads(response)

# See the list of station IDs
station_ids = response['station-ids']
print("1. List of station IDs (first 10):")
print(station_ids[:10])
print()

# -----------------------------------------------------------------------------
# 2. station-info
# Return metadata for given station(s)
# -----------------------------------------------------------------------------
# Build request URL
# The station ID(s) and response format must be specified.
# Here we specify two station IDs and request JSON again.
query = "station=9001,13004&format=json-object"
stations_info_url = "{BASE}/station-info?{QUERY}".format(BASE=base_url,
                                                         QUERY=query)

# Send request and read response
response = urllib.request.urlopen(stations_info_url).read()

# Decode from JSON to Python dictionary
response = json.loads(response)

# See info from each station
stations_info = response['data']
print("2. List of station info:")
for station_info in stations_info:
    print(station_info)
print()

# Note, there is an optional query parameter called 'fields'. This allows us to
# specify what data is returned for the stations. Default is 'id' and 'name',
# but many options are available...
# See https://nrfaapps.ceh.ac.uk/nrfa/nrfa-api.html#parameter-fields


# -----------------------------------------------------------------------------
# 3. time-series
# Return time series data for a single station
# -----------------------------------------------------------------------------
# Build request URL
# The station ID, data type and response format must be specified.
# Here we ask for gauged daily flows (gdf) in JSON format.
# See https://nrfaapps.ceh.ac.uk/nrfa/nrfa-api.html#parameter-data-type
# for all available data types, and
# https://nrfaapps.ceh.ac.uk/nrfa/nrfa-api.html#time-series-formats
# for all available time series response formats (note, although we use JSON
# again, the other formats available differ from those for previous requests)
query = "station=9001&data-type=gdf&format=json-object"
stations_info_url = "{BASE}/time-series?{QUERY}".format(BASE=base_url,
                                                        QUERY=query)

# Send request and read response
response = urllib.request.urlopen(stations_info_url).read()

# Decode from JSON to Python dictionary
response = json.loads(response)

# See data from response
print("3. Details of time series:")
print("Time of request: %s" % response["timestamp"])
print("Station: %s" % response['station']['name'])
print("Data type: %s" % response['data-type']['name'])
print("Data time series (first 10):")
print(response['data-stream'][:10])
