const usgsURL = 'https://earthquake.usgs.gov/ws/designmaps/asce7-10.json';
const geoCodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const atcWindURL = "https://api-hazards.atcouncil.org/public/v1/wind.json?";
const atcSnowURL = "https://api-hazards.atcouncil.org/public/v1/snow.json?";



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
            return usgsData(response);
        })
        .catch(function (reject) {
            console.log(' usgs: error');
        });

}


function getLatLong(res) {
    latLong = res.data.results[0].geometry.location;
    return latLong;
}


function usgsData(res) {
    resData = res.data;
    return resData
}


function renderData(seisData, winData, snowData, otherInfo) {
    let results = renderResult(seisData, winData, snowData, otherInfo);
    $('.desCritInfo').html(results);
    return results;
}


function getAtcWindSpeed(atcWindURL, geo) {

    return axios.get(atcWindURL, {
            params: {
                lat: geo.lat,
                lng: geo.lng
            },
            headers: {
                "api-key": "jag25mnn50pqucyk"
            }
        })
        .then(function (response) {
            return response;
        })
        .catch(function (reject) {
            console.log('error mo fo')
        });
}


function getAtcSnowLoad(atcSnowURL, geo) {

    return axios.get(atcSnowURL, {
            params: {
                lat: geo.lat,
                lng: geo.lng
            },
            headers: {
                "api-key": "jag25mnn50pqucyk"
            }
        })
        .then(function (response) {
            return response;
        })
        .catch(function (reject) {
            console.log('error mo fo')
        });
}


function placesAPI() {
    let input = document.getElementById('autocomplete');
    let autocomplete = new google.maps.places.Autocomplete(input);
}



function initMap(query) {

    let location = {
        lat: query.lat,
        lng: query.lng
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



function renderResult(seisData, winData, snowData, otherInfo) {

    let cs = (seisData.response.data.sds * otherInfo.seisImpFtr) / otherInfo.respModFtr;

    return `
    <div>
        <ul>
            <li> Date: ${seisData.request.date}</li>
            <li> Project: ${seisData.request.parameters.title}</li>
            <li> Address: ${otherInfo.address}</li>
                <ul>    
                    <li>Latitude:  ${seisData.request.parameters.latitude}</li>
                    <li>Longitude:  ${seisData.request.parameters.longitude}</li>
                    <li>Risk Category:  ${seisData.request.parameters.riskCategory}</li>
                    <li>Site Class:  ${seisData.request.parameters.siteClass}</li>
                </ul>
            <li> Code: ${seisData.request.referenceDocument}</li>            
        </ul>
    </div>

    <div>
        <ul>
            <li class="bold"> USGS Design Criteria </li>
                <ul>
                    <li> pga: ${seisData.response.data.pga}</li>
                    <li> Fpga: ${seisData.response.data.fpga}</li>
                    <li> PgaM: ${seisData.response.data.pgam}</li>
                    <li> Ss: ${seisData.response.data.ss}</li>
                    <li> S1: ${seisData.response.data.s1}</li> 
                    <li> Sm1: ${seisData.response.data.sm1}</li>
                    <li> Sms: ${seisData.response.data.sms}</li>
                    <li> Fa: ${seisData.response.data.fa}</li>
                    <li> Fv: ${seisData.response.data.fv}</li>
                    <li> Sds: ${seisData.response.data.sds}</li>
                    <li> Sd1: ${seisData.response.data.sd1}</li>
                    <li> SDC.Cntrl: ${seisData.response.data.sdc}</li>
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

<div>
<ul>
    <li class="bold"> ATC WINDSPEEDS </li>
        <ul>
        <li> ELEVATION: ${winData.data.elevation} </li>
            <li> ASCE 7-16: </li>
                <ul>
                    <li> riskCat I: ${winData.data.datasets[4].data.value} </li>
                    <li> riskCat II: ${winData.data.datasets[5].data.value}</li>
                    <li> riskCat III: ${winData.data.datasets[6].data.value}</li>
                    <li> riskCat IV: ${winData.data.datasets[7].data.value}</li>
                </ul>
        </ul>
        <ul>
            <li> ASCE 7-10: </li>
                <ul>
                    <li> riskCat I: ${winData.data.datasets[12].data.value}</li>
                    <li> riskCat II: ${winData.data.datasets[13].data.value}</li>
                    <li> riskCat III-IV: ${winData.data.datasets[14].data.value}</li>
                </ul>
        </ul>
</ul>
</div>

<div>
<ul>
    <li class="bold"> ATC SNOW LOADS </li>
        <ul>
        <li> ELEVATION: ${snowData.data.elevation} </li>
            <li> ASCE 7-16: </li>
                <ul>
                    <li>Grd Snow Load: ${snowData.data.datasets[0].data.value} </li>
                </ul>
        </ul>
        <ul>
            <li> ASCE 7-10: </li>
                <ul>
                    <li>Grd Snow Load: ${snowData.data.datasets[1].data.value}</li>
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


        for(i = 0; i < 5; i++){
            getLatLongFromAddress(geoCodeURL, address).then(geo => {
                let promises = [usgsApiRequest(geo, riskCategory, siteClass, otherInfo, title), getAtcWindSpeed(atcWindURL, geo), getAtcSnowLoad(atcSnowURL, geo)];
                Promise.all(promises).then(results => {
                    let res = {
                        'seismic': results[0],
                        'wind': results[1],
                        'snow': results[2]
                    }
                    let seisData = res.seismic;
                    let winData = res.wind;
                    let snowData = res.snow;
                    console.log('res', res);
                    getGraph(seisData);
                    renderData(seisData, winData, snowData, otherInfo)
                });
                initMap(geo);

            })
        };

    });
}

$(watchSubmit);