let dataFileName = "https://raw.githubusercontent.com/Dynam1co/kc_practica_modernVisualization_d3/master/practica.json"

function loadData() {
    return d3.json(dataFileName)
}