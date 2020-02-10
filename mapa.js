//Map dimensions (in pixels)
var width = 511,
    height = 600;

//Map projection
var projection = d3.geo.mercator()
    .scale(75005.53697048627)
    .center([-3.7022880000000002,40.47905123676801]) //projection center
    .translate([width/2,height/2]) //translate to center the map in view

//Generate paths based on projection
var path = d3.geo.path()
    .projection(projection);

//Create an SVG
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create zoom/pan listener
//Change [1,Infinity] to adjust the min/max zoom scale
var zoom = d3.behavior.zoom()
    .scaleExtent([1, Infinity])
    .on("zoom",zoomed);

svg.call(zoom);

const dataFileName = "https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/d9f3a11cfa08154c36623c1bf01537bb7b022491/practica.json"

d3.json(dataFileName,function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console

//var colors = d3.scaleSequential(d3.interpolateBlues)
  //.domain([0,d3.max(allAveragePrices)/2])

var colors = d3.scaleSequential(d3Chromatic.interpolatePiYG);

  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(geodata.features)
    .enter()
    .append("path")
    .attr("d",path)
    .style('fill', nei => colors(nei.properties.avgprice))
    .on("click",clicked);

});

// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d,i) {

}


//Update map on zoom/pan
function zoomed() {
  features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
}