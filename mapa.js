var tooltip = '';
var colors;
var nuevoBarrio = 'Orcasitas';

function drawMapColorByPrice(data, tagName, xSize = 900, ySize = 600) {

    const geoCenterMadrid = [-3.703521, 40.417007] 
    const scaleF = 70
    const mapStrokeColor = "#FFFFFF"

    //Pintar gráfico barras por defecto
    let datosGraficos = datosGrafBarras(data.features,nuevoBarrio) ;     
    pintaGrafBarras(datosGraficos);

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
        .on("click", clicked(data))
        .on("mouseover", showTooltip)        
        .on("mouseout", hideTooltip)

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
    d3.select(this).attr("r", 5.5).style("fill", "tomato");
    tooltip.style("display", "block")
        .text("Barrio: " + nuevoBarrio + " (Precio: " +  limpiaPrecio(d.properties.avgprice)  + ")");
}

function hideTooltip() {
    tooltip.style("display", "none");
    d3.select(this).attr("r", 5.5).style("fill", nei => colors(nei.properties.avgprice));
}

/*
Gráfico de barras
*/

function clicked(data){
    //Eliminamos el svg del gráfico de columnas (lo seleccionamos, nos movemos a su elemento padre, y lo borramos desde este)
    let misvg = document.getElementById("columnGraph");            
    let padre = misvg.parentNode;
    padre.removeChild(misvg);
    
        //Guardamos los datos que coinciden con el barrio seleccionado
    const datosGraficosOtro = datosGrafBarras(data.features, nuevoBarrio);
    
    //repintamos el gráfico con los nuevos datos
    pintaGrafBarras(datosGraficosOtro);
}

function datosGrafBarras(alojamientos,barrio){
    let datosBarrio = [];
    
        for (let i in alojamientos) {
            let midato = alojamientos[i].properties.name;
            if (midato === barrio ){
                let bedrooms = alojamientos[i].properties.avgbedrooms;
                for (let j in bedrooms){
                    arrBedrooms =[];
                    arrBedrooms.push(bedrooms[j].bedrooms);
                    arrBedrooms.push(bedrooms[j].total);
                    datosBarrio.push(arrBedrooms); 
                }
                break
            }

        }
       
    return(datosBarrio);
}

function pintaGrafBarras(dataset) {
    const margin = ({ top: 50, right: 0, bottom: 40, left: 50, barPadding:2 });
    const h = 600;
    const w = 500;

    //Creamos las escalas de los ejes. Usamos scaleBand porque, aunque los datos son numéricos, no se comportan como tales
    
    const xScale = d3.scaleBand()
        .domain(dataset.map(d => d[0]))
        .range([margin.left, w - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])]).nice()
        .range([h - margin.bottom, margin.top]);

    //Definimos los ejes

    const xAxis = g => g
        .attr("transform", `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
     


    //Creamos un svg para el gráfico
    const svg1 = d3.select("#graficoBarras")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

        //Pintamos las columnas
    
        svg1.attr("id","columnGraph")
            .append("g")
            .selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("fill", "steelblue")         
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(0) - yScale(d[1]))
            .attr("width", xScale.bandwidth());

    //Función que crea línea de cuadrícula horizontal

    function make_y_gridlines() {
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    //Añadimos líneas de cuadrícula
    svg1.append("g")
        .attr("class", "grid")
        .style("stroke-dasharray", ("3,3"))
        .attr("transform", `translate(${margin.left},0)`)
        .call(make_y_gridlines()
            .tickSize(-h)
            .tickFormat("")
            )

    //Añadimos etiquetas a las columnas
    svg1.append("g")
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text((d) => {if (d[1] === 1) {
            return d[1] + " propiedad"
            }else{
            return d[1] + " propiedades"
            }
        })
        .attr("x", (d) => xScale(d[0]) + xScale.bandwidth()/2)
        .attr("y", (d) => yScale(d[1])-5)
        .attr("class","labels")
        .style("text-anchor", "middle");

    //Añadimos texto con el número total de alojamientos

    const totalAlojamientos = calcTotalHabitaciones(dataset.features);
    svg1.append("g")
        .append("text")
        .attr("class","leyenda")
        .text(nuevoBarrio + " (Total: " + totalAlojamientos + " prop.)" )
        .attr("x",w)
        .attr("y",margin.top + 20)
        .attr("text-anchor", "middle")
        .style("text-anchor", "end");

    //Mostramos los ejes

    svg1.append("g")
        .attr("class","eje")
        .call(xAxis);

    svg1.append("g")
        .attr("class", "eje")
        .call(yAxis);

    //Añadimos etiquetas a los ejes

    const axisLabelText = svg1.append("text") 
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", -(h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style('font-size', 11)
        .text("N\u00FAmero de propiedades")
        .style('fill', 'black')
        .style('font-weight', 'bold');

    const xaxisLabelText = svg1.append("text") 
       
        .attr("y", h -margin.bottom + 18)
        .attr("x", (w/2)+24)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style('font-size', 11)
        .text("N\u00FAmero de habitaciones por propiedad")
        .style('fill', 'black')
        .style('font-weight', 'bold')
        .attr("text-anchor", "middle");

    const titulo1 = svg1.append("text")

        .attr("x", w/2)
        .attr("y",10) 
        .attr("class","titulo")
        .text("N\u00FAmero de propiedades agrupadas por n\u00FAmero de alojamientos")
        .style("text-anchor", "middle")
}

function calcTotalHabitaciones(alojamientos){
            
    for (let i in alojamientos) {
        let barrio = alojamientos[i].properties.name;
        if (barrio === nuevoBarrio) {
            let totalBedrooms = 0;
                for (let j in alojamientos[i].properties.avgbedrooms) {
                    totalBedrooms += alojamientos[i].properties.avgbedrooms[j].total;
                }
            return totalBedrooms;
        }
    }
    
}