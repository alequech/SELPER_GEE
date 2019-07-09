//Script for NDVI comparison
//Author: Raul Nanclares
//Version: 0.1

var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-104.28957969787768, 22.860060573068193],
          [-104.77847129944018, 21.956120175928678],
          [-105.83865196350268, 20.392451637195936],
          [-104.97622520569018, 19.214104029410215],
          [-103.97122901373058, 19.027260163603792],
          [-103.39719336919933, 18.86359915892287],
          [-102.32053321294933, 19.51468336271407],
          [-102.55124610357433, 19.952938416488937],
          [-102.17221778326183, 20.246978217098743],
          [-101.78494971685558, 20.42982794220808],
          [-101.65311377935558, 21.05142153033342],
          [-101.40592139654308, 21.675535207883946],
          [-101.45261329107433, 21.856639477576426],
          [-101.60642188482433, 22.13168179438351],
          [-102.07122771864431, 22.100060846963142],
          [-102.37335174208181, 21.84280411433884],
          [-102.48321502333181, 21.809658076707905],
          [-102.74414031630056, 21.86574687021565],
          [-103.04351775770681, 21.888685939956783],
          [-102.94464080458181, 22.237412254356464],
          [-103.09844939833181, 22.455879172645474],
          [-103.62853973036306, 22.78546646780268],
          [-104.04602019911306, 22.912019752185415]]]),
    imageVisParam2 = {"opacity":1,"bands":["nd"],"min":-0.33444980643571337,"max":0.34810776753082096,"palette":["48eb13","fff700","ff0000"]};


var geometry = /* color: #d63000 */geometry;

var s2collection2018  = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2018-01-01','2018-04-30')
    .filterBounds(geometry)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
    .map(maskS2clouds);

var s2collection2019  = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2019-01-01','2019-04-30')
    .filterBounds(geometry)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
    .map(maskS2clouds);


    
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Return the masked and scaled data, without the QA bands.
  return image.updateMask(mask)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}
print(s2collection2018)

var bandNames = ['B8', 'B4']

var image1 = s2collection2018.median()
var image2 = s2collection2019.median()

var ndvi1 = image1.normalizedDifference(bandNames)
var ndvi2 = image2.normalizedDifference(bandNames)
var ndviDiff = ndvi1.subtract(ndvi2)

var ndwi = image2.normalizedDifference(['B3','B8'])

var composite = ee.Image(ndvi1).addBands(ndvi2).addBands(ndvi2);

Map.addLayer(image1, {min:0, max:5000, bands: ['B8','B4','B3']})
Map.addLayer(image2, {min:0, max:5000, bands: ['B8','B4','B3']})
Map.addLayer(ndvi1, {min:-1, max:1}, 'ndvi2018')
Map.addLayer(ndvi2, {min:-1, max:1}, 'ndvi2019')
Map.addLayer(ndwi, {min:-1, max:1}, 'NDWI')
Map.addLayer(ndviDiff, imageVisParam2, 'Diferencia NDVI 2018-2019')
Map.addLayer(composite, {min:-1, max:1}, 'Compuesto NDVI Multitemporal')
