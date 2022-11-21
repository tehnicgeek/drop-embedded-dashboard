"use strict";
var loactionData; 
var loactionData_device;
var myMarker = new Array();
var cliendid = "dashboard" + Math.random().toString()
var client = new Paho.MQTT.Client("52.15.66.248", 9001,cliendid);
var map;
// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("drop/gpsLocation");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
        client.connect({onSuccess:onConnect});
    }
}

function hex_to_ascii(str1)
{
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function gpsParseData(dataReceived) {
    
    var stringReceived = dataReceived["payload"];
    var converted = hex_to_ascii(stringReceived).toString('utf8');
    var listofCoverted = converted.split(";");
    var latitude = listofCoverted[0].split(",");
    var longitude = listofCoverted[1].split(",");
    var timestamp = listofCoverted[2]

    if (latitude[0] !== "0.00"){
        dd = parseInt(latitude[0].substring(0,2))
        mm = parseFloat(parseFloat(latitude[0].substring(2,4))/60.0);
        mmm = Number.parseFloat(parseFloat(latitude[0].substring(4,))*60.0).toFixed(0)
        lat = dd + parseFloat(mm) + parseFloat(parseFloat(mmm)/3600.0)
        dd = parseInt(longitude[0].substring(0,3))
        mm = parseFloat(parseFloat(longitude[0].substring(3,5))/60.0);
        mmm = Number.parseFloat(parseFloat(longitude[0].substring(5,))*60.0).toFixed(0)
        lon = dd + parseFloat(mm) + parseFloat(parseFloat(mmm)/3600.0)

        latString = Number.parseFloat(lat).toFixed(6).toString();
        lonString = Number.parseFloat(lon).toFixed(6).toString();

        if(latitude[1] === "s" || latitude[1] === "S"){
            latString = "-" + latString;
        }
        if(longitude[1] === "w" || longitude[1] === "W"){
            lonString = "-" + lonString;
        }
        console.log("Lat: ",latString, "Lon: ", lonString)
        dataJson = {
            lat : latString,
            lon : lonString,
            deviceID : dataReceived.deviceID
        }
        return dataJson;
    }

}

function initMap() {
    var gm = google.maps;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 41.4129545, lng: -104.1832655}
    });
    setTimeout(function(){     
    },5000);

    $( document ).ready(function() {
        console.log( "ready!" );
        $.ajax({
            type: "GET",
            url: "/fecthgateway",
            dataType: "json",
            cache: false
        }).done (function (data) {
            console.log(data);
            loactionData = data;
            $.ajax({
                type: "GET",
                url: "/fecthendnodes",
                dataType: "json",
                cache: false
            }).done (function (data) {
                console.log(data);
                loactionData_device = data;
                (function(){
                    var spiderConfig = {
                        keepSpiderfied: true,
                        event: 'mouseover'
                    };
    
                    function initialize() {
                        var markerSpiderfier = new OverlappingMarkerSpiderfier(map, spiderConfig); 
                        var data = loactionData;
                        for (var x in data) {
            
                            var loc = new gm.LatLng(data[x].lat, data[x].lon);
                            
                            myMarker[data[x].gatewayid] = new gm.Marker({
                                position: loc,
                                title: data[x].gatewayid,
                                map: map,
                                icon: "https://s3.amazonaws.com/loraimages/tower.png"
                            });
            
                            myMarker[data[x].gatewayid].desc = data[x].gatewayid;
            
                            // markers.push(myMarker[data[x].gatewayid]); // Saving Markers
            
                            markerSpiderfier.addMarker(myMarker[data[x].gatewayid]);  // Adds the Marker to OverlappingMarkerSpiderfier    
                        }
    
                        var data = loactionData_device;
                        for (var x in data) {
            
                            var loc = new gm.LatLng(data[x].lat, data[x].lon);
                            
                            myMarker[data[x].devaddr] = new gm.Marker({
                                position: loc,
                                title: data[x].devaddr,
                                map: map,
                                icon: "https://s3.amazonaws.com/loraimages/gps.png"
                            });
            
                            myMarker[data[x].devaddr].desc = data[x].devaddr;     
                            markerSpiderfier.addMarker(myMarker[data[x].devaddr]);  // Adds the Marker to OverlappingMarkerSpiderfier    
                        }
                        var iw = new gm.InfoWindow();
                        markerSpiderfier.addListener('click', function(marker, e) {
                            iw.setContent("ID: "+ marker.title+ ", Lat: " + parseFloat(marker.position.lat()).toFixed(2) + ", Lon: " + parseFloat(marker.position.lng()).toFixed(2));
                            iw.open(map, marker);
                        });
            
                        markerSpiderfier.addListener('spiderfy', function(markers) {
                            iw.close();
                        }); 
                        var markerCluster = new MarkerClusterer(map, myMarker);
                        markerCluster.setMaxZoom(15);
                        // connect the client
                        client.connect({onSuccess:onConnect});
                        // myMarker['AA555A0000006003'].setPosition(new google.maps.LatLng(33.7346,-117.787));
                    }
                    //gm.event.addDomListener(window, 'load', initialize); 
                    initialize();
                })(); 
            }); 
        });
    });
    //tower & gps loc init

}

//MQTT Message Arrived
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    var receivedData = JSON.parse(message.payloadString);
    // console.log("Final Output",receivedData);
    if(receivedData.gateway_info.length === 3){
        if(!(receivedData.gateway_info[0] in myMarker)==0){
            // Key is Available 
            var latlng = new google.maps.LatLng(receivedData.gateway_info[1],receivedData.gateway_info[2]);
            myMarker[receivedData.gateway_info[0]].setPosition(latlng);
            console.log("Gateway Updated")
        }
        else 
        {
            // Key is Not Available 
            console.log("New Gateway Found");
            window.location.reload()
        }
    }
    if(receivedData.deviceID !== undefined){
        var data = gpsParseData(JSON.parse(message.payloadString));
        if (!(receivedData.deviceID in myMarker)==0)
        {
            // Key is Available 
            // console.log("Existing Device", DeviceLocationLoader, data, data.deviceID);
            var latlng = new google.maps.LatLng(data.lat,data.lon);
            myMarker[receivedData.gateway_info[0]].setPosition(latlng);
            console.log("Endnode Updated")
        }
        else 
        {
            // Key is Not Available 
            console.log("New Endnode Found")
            window.location.reload()
        }
    }
}