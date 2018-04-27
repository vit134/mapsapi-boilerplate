//eslint-disable
import Boilerplate from './Boilerplate/Boilerplate';
//import MapInit from './MapInit/MapInit';

Boilerplate();

ymaps.ready({
    require: ['ShapeLayer'],

    successCallback: () => {
        fetch('build/data_test.json')
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                buildGrid(data);
            });

        /* fetch('build/data_hotel.json')
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                //console.log(prepareData(data));
                //buildGrid(data);
            });

        function prepareData(data) {
            return data.map((el) => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [el.longitude, el.latitude]
                    },
                    properties: {
                        weight: el.opening_year
                    }
                };
            });
        } */

        function buildGrid(data) {
            const map = new ymaps.Map('map', {
                center: [37.6, 55.75],
                zoom: 12
            }, {
                avoidFractionalZoom: false
            });

            const heatmap = new ymaps.ShapeLayer(Object.keys(data).map((key) => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: key.split(/,\s*/).map(Number).reverse()
                    },
                    properties: {
                        weight: Number(data[key].total_count)
                    }
                };
            }), {
                shapeForm: 'squares',
                clusterize: true,
                gridSize: 27 * Math.pow(2, -11),
                fillColor: function (cluster) {
                    const weight = cluster.objects.reduce((counter, object) => {
                        return counter + object.properties.weight;
                    }, 0);
                    return 'rgba(0,' +
                                Math.min(Math.round(weight / 15), 255) +
                                ',0,0.3)';
                }
            });

            map.layers.add(heatmap);

            map.events.add('click', (e) => {
                const objects = heatmap.getObjectsInPosition(e.get('coords'));
                if (objects.length) {
                    map.balloon.open(
                        objects[0].geometry.coordinates,
                        '<pre>' + JSON.stringify(objects, null, 4) + '</pre>'
                    );
                }
            });
        }
    }
});
