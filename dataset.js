let dataFileName = "https://raw.githubusercontent.com/Dynam1co/kc_practica_modernVisualization_d3/master/practica.json"

function loadData() {
    return d3.json(dataFileName)
}

function avgbedroomsToArrayByCartoID(data, cartoid){
    features = data["features"]
    for (var i=0; i<features.length; i++) {
          if( features[i]["properties"]["cartodb_id"] == cartoid) {
               return avgbedroomsToArrayByIndex(data, i)
          }
    } 
}

function avgbedroomsToArrayByName(data, name) {
    features = data["features"]
    for (var i=0; i<features.length; i++) {
          if( features[i]["properties"]["name"] == name) {
              return avgbedroomsToArrayByIndex(data, i)
          }
    }
}

function avgbedroomsToArrayByIndex(data, index) {
    var result = []
    data["features"][index]["properties"]["avgbedrooms"].forEach(element => {
          result.push([element["bedrooms"], element["total"]]) 
    })
    console.log(result)
    return result 
}