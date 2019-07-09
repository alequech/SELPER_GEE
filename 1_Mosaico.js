var geometry = ee.FeatureCollection("users/aquevedo/jalisco"); // Geometria que se usara como mascara
var collection = ee.ImageCollection('COPERNICUS/S2') // collecion de imagenes a usar 
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10)) // Filtro de las imagenes solo se conservan las menores al 10% de nubes
  .filterDate('2019-01-1' ,'2019-04-30') //Seleccion imagenes en un rango de fechas 
  .filterBounds(geometry) // Seleccion de imagenes que coinciden con la geometria
  
print("coleccion de imagenes",collection) // Imprime en console los metadatos de las imagenes
  
var medianpixels = collection.median() // Esto genera la medina de todos los pixeles en la coleccion. 

var medianpixelsclipped = medianpixels.clip(geometry)// Corta las imagenes de acuerdo al aoi proporcionado 
                                                                  

// Ahora se centra el mapa usando la geometria y adiciona como una capa
Map.centerObject(geometry,9)
Map.addLayer(medianpixelsclipped, {bands: ['B8A', 'B11', 'B12'], min: 100, max: 4000, gamma: 1.5}, 'Sentinel_2 mosaic')

// Exporta la imagen al google drive.
Export.image.toDrive({
  image: medianpixelsclipped.select("B8A", "B11", "B12"),
  description: 'S2_Jalisco_feb',
  scale: 20,
  maxPixels: 1e9,
  region: geometry
});