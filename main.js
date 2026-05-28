// Инициализируем карту
const map = new maplibregl.Map({
	container: 'map',
	style: "https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/voyager.json",
	center: [96.919, 56.0339],
	zoom: 8.99,
	minZoom: 2,
	hash: true,
});

map.on('load', () => {
    // Выполняется после загрузки карты

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
    				1700, 8,    // старые селения — крупные точки
    				1800, 6,    // средние — побольше
    				1900, 4     // новые — маленькие
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
				'text-translate': [1, 1],// сдвиг тени (имитация)
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

	map.on('mouseenter', 'places-points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'places-points', () => {
        map.getCanvas().style.cursor = '';
    });

	map.on('mouseenter', 'places-labels', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'places-labels', () => {
        map.getCanvas().style.cursor = '';
    });


// Попап
// Попап для населённых пунктов (клик по точке или по названию)
function showPopup(e) {
    if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;

        // Используем поля из places.geojson
        const title = props.name || props.NAME_RU || 'Населённый пункт';
        const year = props.year_first_mention;
        const placeType = props.place_type;
		const historyDoc = props.history_doc;

        // Формируем HTML
        let html = `<div class="city-popup-content"><h3>${title}</h3>`;

 		if (placeType === 'disappeared_village') {
 		    html += `<div class="popup-info">
			<span class="value">Исчезнувшее селение</span></div>`;
		}

        if (year) {
            html += `<div class="popup-info popup-info-string">
			<span class="label">Год основания<br>(первого упоминания в документах):&nbsp;</span><span class="value">${year} г.</span>
			<br>
			<span class="label popup-doc">в ${historyDoc}</span>
			</div>`;
        }

        // Если есть ссылка на историю
        if (props.history_url) {
    	    html += `<div class="popup-link-btn"><a href="${props.history_url}" target="_blank" rel="noopener noreferrer">📜 Подробная история ↗</a></div>`;
		}
            html += `</div>`;

        new maplibregl.Popup({
            className: 'city-popup',
            closeButton: true,
            closeOnClick: false
        })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(html)
        .addTo(map);
    }
}

// Обработчик клика по точкам
	map.on('click', 'places-points', showPopup);

// Обработчик клика по текстовым подписям (названиям)
	map.on('click', 'places-labels', showPopup);
});
