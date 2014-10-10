function main(markets) {
  var map = new L.Map('map', {
    center: [40.4333, 3.7000],
    zoom: 2
  });

  markets = markets.join("','")

  var sql = "SELECT * FROM countries WHERE iso2 IN('" + markets + "')";

  cartodb.createLayer(map, {
    user_name: 'arce',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT * FROM countries",
      cartocss: '#countries { polygon-fill: #ffffff; }'
    }]
  })
  .addTo(map) 
  .done(function(layer) {

    layer.createSubLayer({
      sql: sql,
      cartocss: '#countries {polygon-fill: #81b900;}'
    });

  });

}

$(function() {

  $(".get-albums-js").on("click", function(e) {

    e.preventDefault();
    e.stopPropagation();

    $(".content").fadeOut(150);

    $.ajax({ url: "/get/albums", success: function(data) {

      var tracks    = _.pluck(data.items, "track");
      var countries = _.pluck(tracks, "available_markets");

      var markets = _.union.apply(null, countries);
      main(markets);

    }});

  })

});

