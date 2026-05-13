// Инициализируем карту
const map = new maplibregl.Map({
  container: 'map',
style: "https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/voyager.json",
//   style: {
//    "version": 8,
//    "sources": {},
//    "layers": []
//  },
  center: [97.9652, 55.9562],
  zoom: 10.6,//
// maxZoom: 12,
    minZoom: 2,
hash: true,
});

map.on('load', () => {
    // Выполняется после загрузки карты
// 	map.addLayer({
//        id: 'background',
//        type: 'background',
//        paint: {
//        'background-color': '#E8F0F2'
//        }
//    });

    // Добавление источника данных
    map.addSource('countries', {
        type: 'geojson',
        data: './data/countries.geojson',
        attribution: 'Natural Earth'
    });

    // Добавление слоя
    map.addLayer({
        id: 'countries-layer',
        type: 'fill',
        source: 'countries',
        paint: {
            'fill-color': ['match', ['get', 'MAPCOLOR7'],
			1, '#FADADD',
                2, '#C9E4DE',
                3, '#F9E79F',
                4, '#D5E8F0',
                5, '#F5CBA0',
                6, '#D7BDE2',
                '#E8F0F2'
			],
'fill-opacity': 0,
            'fill-outline-color': '#FFFFFF'
        }
    });

 // Обводка стран
    map.addLayer({
        id: 'countries-border',
        type: 'line',
        source: 'countries',
        paint: {
            'line-color': '#FFFFFF',
            'line-width': 1,
            'line-opacity': 0.8
        }
    });

	// map.addSource('rivers', {
    //     type: 'geojson',
    //     data: './data/rivers.geojson'
    // });

    // map.addLayer({
    //     id: 'rivers-layer',
    //     type: 'line',
    //     source: 'rivers',
    //     paint: {
    //         'line-color': '#4A90E2',
    //         'line-width': 1.5,
    //         'line-opacity': 0.7
    //     }
    // });

//     map.addSource('lakes', {
//         type: 'geojson',
//         data: './data/lakes.geojson'
//     });

//     map.addLayer({
//         id: 'lakes-layer',
//         type: 'fill',
//         source: 'lakes',
//         paint: {
//             'fill-color': '#7CB5EC',
//             'fill-opacity': 0.7,
//             'fill-outline-color': '#4A90E2',
//         }
//     });

// // Границы озёр
// map.addLayer({
//     id: 'lakes-outline',
//     type: 'line',
//     source: 'lakes',
//     paint: {
//          'line-color': '#2E5C8A',
//             'line-width': 2,
//             'line-opacity': 0.8
//     }
// });

    map.addSource('cities', {
        type: 'geojson',
        data: './data/cities.geojson'
    });

    map.addLayer({
        id: 'cities-layer',
        type: 'circle',
        source: 'cities',
        paint: {
            'circle-color': [
                'match',
                ['get', 'NAME'],
                'Krasnoyarsk', '#FF6B6B',
                '#FFA07A'
            ],
            'circle-radius': [
                'match',
                ['get', 'NAME'],
                'Krasnoyarsk', 6,
                4                  // обычный радиус для остальных
            ]
        },
		filter: ['<', ['get', 'POP_MAX'], 1000000]
    });

// Крупные города (население > 1 млн)
    map.addLayer({
        id: 'cities-large',
        type: 'circle',
        source: 'cities',
        paint: {
            'circle-color': '#E67E22',
            'circle-radius': 8,
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
        },
        filter: ['>=', ['get', 'POP_MAX'], 1000000]
    });



	// Селения

map.addSource('places', {
    type: 'geojson',
    data: './data/places.geojson'
});

// Кружок (точка)
map.addLayer({
    id: 'places-points',
    type: 'circle',
    source: 'places',
    paint: {
'circle-radius': [
    'interpolate', ['linear'], ['get', 'year_first_mention'],
    1700, 8,    // старые селения — маленькие точки
    1800, 6,    // средние — побольше
    1900, 4     // новые — крупные
],
        'circle-color': [
    'match',
    ['get', 'place_type'],
    'disappeared_village', '#b0b0b0',  // серый цвет для исчезнувших
    '#FFA07A'                           // обычный цвет для существующих
],
'circle-opacity': [
    'match',
    ['get', 'place_type'],
    'disappeared_village', 0.6,         // полупрозрачные
    1.0
],
'circle-stroke-color': '#000000',  // чёрный цвет обводки
        'circle-stroke-width': 1         // толщина обводки (можно 1 или 2)
    }
});

// Плашка с названием и годом
map.addLayer({
    id: 'places-labels',
    type: 'symbol',
    source: 'places',
    layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Open Sans Semibold'],
        'text-size': 16,
        'text-offset': [0.6, 0],
        'text-anchor': 'left',
        'text-justify': 'left',
        'text-max-width': 20
    },
    paint: {
        'text-color': '#1a1a1a',
        'text-halo-color': '#fbf8f3',
        'text-halo-width': 4,
        'text-halo-blur': 1,
		'text-translate': [1, 1],             // сдвиг тени (имитация)
    	'text-translate-anchor': 'viewport'
    }
});




 // ИНТЕРАКТИВНОСТЬ
    // Курсоры
    map.on('mouseenter', 'countries-layer', () => {
        map.getCanvas().style.cursor = 'crosshair';
    });

    map.on('mouseleave', 'countries-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'cities-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseenter', 'cities-large', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'cities-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseleave', 'cities-large', () => {
        map.getCanvas().style.cursor = '';
    });

	  // Попапы для стран
    map.on('click', 'countries-layer', (e) => {
        if (e.features && e.features.length > 0) {
            const props = e.features[0].properties;
            new maplibregl.Popup({
                className: 'custom-popup',
                closeButton: true,
                closeOnClick: false
            })
            .setLngLat(e.lngLat)
            .setHTML(`
                <div class="country-popup">
                    <h3>${props.NAME_RU || props.NAME}</h3>
                    <div class="popup-info">
                        <span class="label">Население:</span>
                        <span class="value">${(props.POP_EST || 0).toLocaleString()} чел.</span>
                    </div>
                    <div class="popup-info">
                        <span class="label">Континент:</span>
                        <span class="value">${props.CONTINENT || 'не указан'}</span>
                    </div>
                    <div class="popup-info">
                        <span class="label">Экономика:</span>
                        <span class="value">${props.ECONOMY ? props.ECONOMY.split(':')[1] || props.ECONOMY : 'нет данных'}</span>
                    </div>
                </div>
            `)
            .addTo(map);
        }
    });

    // Попапы для малых городов
    map.on('click', 'cities-layer', (e) => {
        if (e.features && e.features.length > 0) {
            const props = e.features[0].properties;
            new maplibregl.Popup({
                className: 'city-popup',
                closeButton: true,
                closeOnClick: false
            })
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(`
                <div class="city-popup-content">
                    <h3>${props.NAME_RU || props.NAME}</h3>
                    <div class="popup-info">
                        <span class="label">Население:</span>
                        <span class="value">${(props.POP_MAX || 0).toLocaleString()} чел.</span>
                    </div>
                </div>
            `)
            .addTo(map);
        }
    });

    // Попапы для крупных городов
    map.on('click', 'cities-large', (e) => {
        if (e.features && e.features.length > 0) {
            const props = e.features[0].properties;
            new maplibregl.Popup({
                className: 'city-popup large',
                closeButton: true,
                closeOnClick: false
            })
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(`
                <div class="city-popup-content">
                    <h3>⭐ ${props.NAME_RU || props.NAME}</h3>
                    <div class="popup-info">
                        <span class="label">Население:</span>
                        <span class="value">${(props.POP_MAX || 0).toLocaleString()} чел.</span>
                    </div>
                    <div class="popup-note">Крупный город-миллионник</div>
                </div>
            `)
            .addTo(map);
        }
    });

});
