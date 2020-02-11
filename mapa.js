var tooltip = '';
var colors;
var nuevoBarrio = 'Orcasitas';

function drawMapColorByPrice(data, tagName, xSize = 900, ySize = 600) {

    const geoCenterMadrid = [-3.703521, 40.417007] 
    const scaleF = 70
    const mapStrokeColor = "#FFFFFF"

    // Gráfico barras con barrio por defecto
    drawBarChart(
        avgbedroomsToArrayByName(data, nuevoBarrio),
        "#barchart",
        nuevoBarrio,
        "Nº habitaciones",
        "Nº apartamentos")

    const svg = d3
        .select(tagName)
        .append('svg')
        .style("width", xSize + 'px')
        .style("height", ySize + 'px');

    tooltip = d3.select(tagName).append("div").attr("class", "tooltip").attr("id","tooltip");        

    const colormap = svg
        .append('g')
        .attr('class','colormap')

    // GeoGenerator (with projection)
    var projection = d3.geoMercator()
        .scale(xSize * scaleF)
        .center(geoCenterMadrid)
        .translate([xSize/2,ySize/2])

    var geoGenerator = d3.geoPath()
        .projection(projection);
          
    // Get AvgPrice information
    var allAveragePrices =data.features.map(obj => obj.properties.avgprice)     

    // Color Scheme (interpolateBlues)
    colors = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0,d3.max(allAveragePrices)/2])    

    // Generate map
    colormap
        .selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .style('fill', nei => colors(nei.properties.avgprice))
        .attr('stroke',mapStrokeColor)
        .attr('stroke-width', "1")
        .attr('class', 'barrio')        
        .on("mouseover", showTooltip)        
        .on("mouseout", hideTooltip)    
        .on("click", (d, i) => {
            // Update here barchart information
            drawBarChart(
                avgbedroomsToArrayByCartoID(data, d["properties"]["cartodb_id"]),
                "#barchart",
                d["properties"]["name"],
                "Nº habitaciones",
                "Nº apartamentos")
        })
}

function limpiaPrecio(price){
    if (price === undefined) {
        return "desconocido";
    }
    else {
        return price;
    }
}

function showTooltip(d) {    
    nuevoBarrio = d.properties.name
    d3.select(this).attr("r", 5.5).style("fill", "RGB(205, 92, 92)");
    tooltip.style("display", "block")
        .text("Barrio: " + nuevoBarrio + " (Precio: " +  limpiaPrecio(d.properties.avgprice)  + ")");
}

function hideTooltip() {
    tooltip.style("display", "none");
    d3.select(this).attr("r", 5.5).style("fill", nei => colors(nei.properties.avgprice));
}