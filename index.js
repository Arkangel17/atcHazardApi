const usgsURL = 'https://earthquake.usgs.gov/ws/designmaps/asce7-10.json';
const geoCodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const atcWindURL = "https://api-hazards.atcouncil.org/public/v1/wind.json?";

function getLatLongFromAddress(geoCodeURL, address) {

    return axios.get(geoCodeURL, {
            params: {
                address,
                key: 'AIzaSyAS1ppQZ0RbK3k5Zv121KdtG61DqY_Mrno'
            }
        })
        .then(function (response) {
            return getLatLong(response);
        })
        .catch(function (reject) {
            console.log('error');
        });
}

function usgsApiRequest(geo, riskCategory, siteClass, otherInfo, title) {
        console.log('geo', geo);

    return axios.get(usgsURL, {
            params: {
                latitude: geo.lat,
                longitude: geo.lng,
                riskCategory,
                siteClass,
                title
            }
        })
        .then(function (response) {
            let test = getSeisData(response, otherinfo);
            console.log('test', test);
            return{
                'seisData': getSeisData(response, otherinfo),
                'graph': getGraph(response),
                'map': initMap(geo)
            }
        })
        .catch(function (reject) {
            console.log('error @ usgsApiReq');
        });

}



//STUDY PROMISES + CLOSURES + CALLBACK FUNCTIONS

function getLatLong(res) {
    latLong = res.data.results[0].geometry.location;
    console.log('latLong', latLong);
    return latLong;

}

function getSeisData(data, otherInfo) {
    console.log('data', data);
    let results = renderSeisResult(data, otherInfo);
    $('.desCritInfo').html(results);
    return results;
}


function placesAPI() {
    let input = document.getElementById('autocomplete');
    let autocomplete = new google.maps.places.Autocomplete(input);
}



function initMap(query) {

    let location = {
        lat: query.latitude,
        lng: query.longitude
    };

    let map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 17
    });

    let imageURL = 'https://i.imgur.com/kUG7GZa.png';

    // let image = new google.maps.MarkerImage(imageURL,
    //     new google.maps.Size(20, 20));

    let image = {
        "url": imageURL,
        "scaledSize": new google.maps.Size(30, 30),
        "origin": new google.maps.Point(0, 0),
        "anchor": new google.maps.Point(0, 0)
    };

    let frogPin = new google.maps.Marker({
        position: location,
        map,
        icon: image,
        title: 'hello'
    });


}

///HOW THIS WAS NOT HERE IN MASTER BRANCH

function renderSeisResult(data, otherInfo) {
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
                    <li> pga: ${store.response.data.pga}</li>
                    <li> Fpga: ${store.response.data.fpga}</li>
                    <li> PgaM: ${store.response.data.pgam}</li>
                    <li> Ss: ${store.response.data.ss}</li>
                    <li> S1: ${store.response.data.s1}</li> 
                    <li> Sm1: ${store.response.data.sm1}</li>
                    <li> Sms: ${store.response.data.sms}</li>
                    <li> Fa: ${store.response.data.fa}</li>
                    <li> Fv: ${store.response.data.fv}</li>
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


function renderWindResults(datasets) {

    return `
    <div>
        <ul>
            <li class="bold"> ATC WINDSPEEDS </li>
                <ul>
                <li> elevation: ${datasets.elevation} </li>
                    <li> asce716: </li>
                        <ul>
                            <li> riskCat I: </li>
                            <li> riskCat II: </li>
                            <li> riskCat III: </li>
                            <li> riskCat IV: </li>
                        </ul>
                </ul>
                <ul>
                <li> asce710: </li>
                    <ul>
                    <li> riskCat I: </li>
                    <li> riskCat II: </li>
                    <li> riskCat III: </li>
                    <li> riskCat IV: </li>
                    </ul>
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

    })
    .mouseout(function () {
        $('#hintBox').hide();
    });

//what the hell

function getGraph(results) {
    let ctx = $('#lineChart');
    let sdSpectrum = results.response.data.sdSpectrum;
    let sdSpecType = typeof (sdSpectrum);

    let xDataPts = sdSpectrum.map((item, index) => {
        return item[0];
    });
    let yDataPts = sdSpectrum.map((item, index) => {
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
        let address = addressTarget.val() || "99 Green Street, San Francisco, CA, USA";
        const riskCatTarget = $(event.currentTarget).find('.riskCategory');
        let riskCategory = riskCatTarget.val() || "III";
        const siteClassTarget = $(event.currentTarget).find('.siteClass');
        let siteClass = siteClassTarget.val() || "C";
        const respModFtrTarget = $(event.currentTarget).find('.respModFtr');
        let respModFtr = parseFloat(respModFtrTarget.val()) || "6.5";
        const seisImpFtrTarget = $(event.currentTarget).find('.seisImpFtr');
        let seisImpFtr = parseFloat(seisImpFtrTarget.val()) || "1.25";
        const titleTarget = $(event.currentTarget).find('.title');
        let title = titleTarget.val() || "Test";

        let resObject = {
            address,
            riskCategory,
            siteClass,
            respModFtr,
            seisImpFtr,
            title
        }

        // clear out the input
        addressTarget.val("");
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

        let p1 = getLatLongFromAddress(geoCodeURL, address); 
        let p2 =  p1.then((geo) =>{
            usgsApiRequest(geo, riskCategory, siteClass, otherInfo, title);
        });
    //             getAtcWindSpeed(atcHazardURL, geo);
    //         });


    Promise.all([p1, p2]).then(values => {

        console.log('values', values);
    });

});
}

$(watchSubmit);