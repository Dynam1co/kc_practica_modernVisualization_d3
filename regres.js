var coordenadas =[]

function drawPointChar(dataset2, tagName, title = "", xLabel = "", yLabel = "", xSize = 500, ySize = 600) {    
    dataset2 = calculaCoordenadas(dataset2.features)    
    
    const margin = ({ top: 50, right: 10, bottom: 40, left: 50 });
    const h=600;
    const w = 1000;                                               
    
    //Crear un elemento SVG
    const svg2 = d3.select("#regres")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "dispersionGraph")
        .append("g");

    //Calculamos los valores mínimos para las escalas y el eje
    const minX = d3.min(dataset2, (d) => d.totalBedrooms);
    const minY = d3.min(dataset2, (d) => d.avgprice);
    xMinBolas = d3.min(dataset2, d => d.totalBedrooms)
    xMaxBolas = d3.max(dataset2, d => d.totalBedrooms)
    
    const maxX =200;
    const maxY = 140;
    
    const xScale = d3.scaleLinear()
        .domain([0, maxX]).nice()
        .range([margin.left, w - margin.right*2])

    const yScale = d3.scaleLinear()
        .domain([0, maxY]).nice()
        .range([h - margin.bottom, margin.top]);

    const rScale = d3.scaleLinear()
        .domain([0, maxY]).nice()
        .rangeRound([2, 5]);

    // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)            

    svg2.append("g")
        .attr("class", "eje")
        .attr("transform", `translate(0,${h - margin.bottom +6})`)
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", w- margin.left - 18)
        .attr("y", -6)
        .style("text-anchor", "middle")
        .text("Total propiedades");

    svg2.append("g")
        .attr("class", "eje")
        .attr("transform", `translate(${margin.left},6)`)
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x",-margin.top - 6)
        .attr("y", margin.right )
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Precio medio");

    // Regresión            
    const linReg = ss.linearRegression(coordenadas);                        
    const linRegLine = ss.linearRegressionLine(linReg);
    
    let line = svg2.append("g")
        .append("line")
        .attr("class", "regLine")
        .attr("x1", xScale(minX))
        .attr("x2", xScale(minX))
        .attr("y1", yScale(linRegLine(minX)))
        .attr("y2", yScale(linRegLine(minX)));            

    //Añadimos los puntos del gráfico y filtramos para trabajar sin los outlayer
    const circle = svg2.selectAll("circle")
        .data(dataset2)
        .enter()
        .filter(d => {
            return d.totalBedrooms < 200 &&
                d.avgprice < 140
        })
        .append("circle");

    // Color puntos en función de nº habitaciones
    var colors = d3
        .scaleSequential(d3.interpolateTurbo)
        .domain([xMinBolas,xMaxBolas])

    circle
        .attr("cx", (d) => xScale(d.totalBedrooms))
        .attr("cy", (d) => yScale(d.avgprice))
        .attr("r", (d) => rScale(d.totalBedrooms))                
        .attr("fill", d => colors(d.totalBedrooms))           

    // Título
    svg2.append("text").attr("x", w / 2)
        .attr("y", margin.top)
        .attr("class", "titulo")
        .text("Relación Precio medio / Número de propiedades")
        .style("text-anchor", "middle");
        
    // Línea regresión
    line.attr("x2", xScale(maxX))
        .attr("y2", yScale(linRegLine(maxX))) ;            

    // Fórmula oculta
    formula=svg2.append("text")
        .text("y = " + linReg.b.toFixed(2) + " + " + linReg.m.toFixed(3) + "x")
        .attr("x", xScale(175))
        .attr("y",yScale( linRegLine(200) + 2))
        .attr("opacity",0);
    
    // Fórmula
    formula.attr("x", xScale(175))
        .attr("y", yScale(linRegLine(200) + 2))
        .attr("opacity", 1);
}

function calculaCoordenadas(propiedades){    
    let datosDispersion = [] 

    for (let i in propiedades) {                
        let name = propiedades[i].properties.name;
        let avgprice = propiedades[i].properties.avgprice;
        let bedrooms = propiedades[i].properties.avgbedrooms
        
        if (avgprice != undefined && bedrooms != undefined){
            let totalBedrooms = 0

            for (let j in bedrooms) {
                if (bedrooms[j].total != undefined) {
                    totalBedrooms += bedrooms[j].total
                }   
            }

            datosDispersion.push({
                name: name,
                avgprice: avgprice,
                totalBedrooms: totalBedrooms
            });
            
            coordenadas.push([totalBedrooms, avgprice]);
        }
    }

    return datosDispersion;
}