const usgsURL = 'https://earthquake.usgs.gov/ws/designmaps/asce7-10.json';
const geoCodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const atcHazardURL = "https://api-hazards.atcouncil.org/public/v1/wind.json?";



//request through axios..
function getLatLongFromAddress(geoCodeURL, address){
request = axios.get(geoCodeURL, {
        params: {
            address,
            key: 'AIzaSyAS1ppQZ0RbK3k5Zv121KdtG61DqY_Mrno'
        }
    })
    .then(function (response) {
        latLong = response.data.results[0].geometry.location;
        return latLong;
    })
    .catch(function (error) {
        console.log('error', error);
    });

    console.log('res:', request);

return request;
}


//STUDY PROMISES + CLOSURES + CALLBACK FUNCTIONS

function usgsApiRequest(riskCategory, siteClass, otherInfo, title, callback) {

    return function (geo) {
        const query = {
            latitude: geo.lat,
            longitude: geo.lng,
            riskCategory,
            siteClass,
            title
        };

        $.getJSON(usgsURL, query, (results) => {
            callback(results, otherInfo);
            getGraph(results);
            initMap(query);
        });

    }

}

function getSeisData(data, otherInfo) {
    let results = renderResult(data, otherInfo);
    $('.desCritInfo').html(results);
    return results;
}

function getAtcWindSpeed(atcHazardURL, callback) {
    request = axios.get(geoCodeURL, {
        params: {
            address,
            key: 'AIzaSyAS1ppQZ0RbK3k5Zv121KdtG61DqY_Mrno'
        }
    })
    .then(function (response) {
        latLong = response.data.results[0].geometry.location;
        return latLong;
    })
    .catch(function (error) {
        console.log('error', error);
    });
    console.log('gets here');

    return function (geo) {
        const query = {
            headers: {
                'api-key': 'jag25mnn50pqucyk'
            },
            lat: geo.lat,
            long: geo.lng        
        };
    console.log('lat', query.lat);

        $.getJSON(atcHazardURL, query, function (results) {
            callback(results);

        });
    };

}


function shoWind(datasets){
    let info = datasets;
    console.log('what:', info[0].data.value);
    return datasets;
}




function placesAPI(){
    let input = document.getElementById('autocomplete');
    let autocomplete = new google.maps.places.Autocomplete(input);
}



function initMap(query){

    let location = {
        lat: query.latitude,
        lng: query.longitude
    };

    let map = new google.maps.Map(document.getElementById('map'),{
        center: location,
        zoom: 17
    });

    let imageURL = 'https://i.imgur.com/kUG7GZa.png';

    // let image = new google.maps.MarkerImage(imageURL,
    //     new google.maps.Size(20, 20));

    let image = {
        "url": imageURL,
        "scaledSize": new google.maps.Size(30, 30),
        "origin": new google.maps.Point(0,0),
        "anchor": new google.maps.Point(0,0)
    };

    let frogPin = new google.maps.Marker({
       position: location,
       map,
       icon: image,
       title: 'hello'
    });


}



function renderResult(data, otherInfo) {
    let store = data;
    let cs = (store.response.data.sds * otherInfo.seisImpFtr) / otherInfo.respModFtr;
  return `
    <div>
        <ul>
            <li> Date: ${store.request.date}</li>
            <li> Project: ${store.request.parameters.title}</li>
            <li> Address: ${otherInfo.address}</li>
                <ul>    
                    <li>Latitude:  ${store.request.parameters.latitude}</li>
                    <li>Longitude:  ${store.request.parameters.longitude}</li>
                    <li>Risk Category:  ${store.request.parameters.riskCategory}</li>
                    <li>Site Class:  ${store.request.parameters.siteClass}</li>
                </ul>
            <li> Code: ${store.request.referenceDocument}</li>            
        </ul>
    </div>

    <div>
        <ul>
            <li class="bold"> USGS Design Criteria </li>
                <ul>
                    <li> PGA: ${store.response.data.pga}</li>
                    <li> Ss: ${store.response.data.ss}</li>
                    <li> S1: ${store.response.data.s1}</li> 
                    <li> Sds: ${store.response.data.sds}</li>
                    <li> Sd1: ${store.response.data.sd1}</li>
                    <li> SDC.Cntrl: ${store.response.data.sdc}</li>
                </ul>
        </ul>        
    </div>
    <div>
    <ul>
        <li class="bold"> Seismic Properties</li>
            <ul>
                <li> Cs: ${cs}</li>
            </ul>
    </ul>        
</div>
  `;
}



//Dynamic UI Functions....
$('.hover').mousemove(function (e) {
        let hoverText = $(this).attr('hintText');
        $('#hintBox').text(hoverText).show();
        let x = e.screenX - this.offsetLeft;
        let y = e.screenY - this.offsetTop;
        $('#hintBox').css('top', y).css('left', x);
        // console.log('x', x);
        // console.log('y', y);

    })
    .mouseout(function () {
        $('#hintBox').hide();
});

//what the hell

function getGraph(results) {
    let ctx = $('#lineChart');
    let sdSpectrum = results.response.data.sdSpectrum;
    let sdSpecType = typeof(sdSpectrum);

    let xDataPts = sdSpectrum.map((item, index)=>{
        return item[0];
    });
    let yDataPts = sdSpectrum.map((item, index)=>{
        return item[1];
    });

    let lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xDataPts,
            xAxisID: 'what',
            yAxisID: 'hello',
            datasets: [{
                label: "Sds Data Pts",
                backgroundColor: "rgb(224,255,255)",
                borderColor: " rgb(93, 230, 240)",
                borderWidth: 2,
                hoverBackgroundColor: "rgb(187,255,255)",
                hoverBorderColor: " rgb(93, 230, 240)",
                data: yDataPts,
            }]
        },

        options: {
            maintainAspectRatio: true,
            scales: {
                yAxes: [{
                    stacked: true,
                    gridLines: {
                        display: true,
                        color: "rgba(151,255,255, 0.3)"
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        color: "rgba(151,255,255,0.3)"
                    }
                }]
            }
        }

    });
}


function watchSubmit() {

    placesAPI();

    $('.designCrit').submit(event => {
        event.preventDefault();
        const addressTarget = $(event.currentTarget).find('.address');
        const address = addressTarget.val();
        // const latitudeTarget = $(event.currentTarget).find('.latitude');
        // const latitude = latitudeTarget.val();
        // const longitudeTarget = $(event.currentTarget).find('.longitude');
        // const longitude = longitudeTarget.val();
        const riskCatTarget = $(event.currentTarget).find('.riskCategory');
        const riskCategory = riskCatTarget.val();
        const siteClassTarget = $(event.currentTarget).find('.siteClass');
        const siteClass = siteClassTarget.val();
        const respModFtrTarget = $(event.currentTarget).find('.respModFtr');
        const respModFtr = parseFloat(respModFtrTarget.val());
        const seisImpFtrTarget = $(event.currentTarget).find('.seisImpFtr');
        const seisImpFtr = parseFloat(seisImpFtrTarget.val());
        const titleTarget = $(event.currentTarget).find('.title');
        const title = titleTarget.val();
        // clear out the input
        addressTarget.val("");
        // latitudeTarget.val("");
        // longitudeTarget.val("");
        riskCatTarget.val("");
        siteClassTarget.val("");
        respModFtrTarget.val("");
        seisImpFtrTarget.val("");
        titleTarget.val("");

        let otherInfo = {
            respModFtr,
            seisImpFtr,
            address
        };

        let what = getLatLongFromAddress(geoCodeURL, address)
            .then(usgsApiRequest(riskCategory, siteClass, otherInfo, title, getSeisData))
            .then(getAtcWindSpeed(atcHazardURL, shoWind));

            
    });
}

$(watchSubmit);
