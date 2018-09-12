//Testing
var plate = { width: 19, height: 11, thickness: 1/8 };
var library = new MaterialLibrary();

var app = new Vue({
  el: "#app",
  data: {
    items: library.materials,
    selectedMaterial: null,
    hasDrawing: false,
    lengthInches: 0,
    drawingSize: { width: 0, height: 0 }, //used by SVG and canvasSurfaces
    groups: [],
    drawingBounds: { width: 0, height: 0 }, //dimensions of bounding box of actual drawing
    testVal: 1
  },
  
  computed: {
    lengthMm: function() 
    {
      return this.lengthInches * 25.4;
    },
    
    testLabel: function()
    {
      var labels = [
        "Light Etch",
        "Deep Etch",
        "Cut"
      ]
      return labels[this.testVal]
    }
  },
  
  methods: {
    selectMaterial: function(item)
    {
      app.selectedMaterial = item;
    },
    
    round: function(value, decimals)
    {
      //TODO: Might want to rethink this approach. Apparently any change to the model causes a reevaluation
      if(!decimals) decimals = 0;
      
      var scale = Math.pow(10, decimals);
      value = Math.round(value * scale) / scale;
      return value;
    },
    
    getModeLabel
  }
});

var drawingManager = new DrawingManager("#outerSvg");
var sceneManager = new SceneManager("#canvasSurface", "#outerSvg", "#plateObject");

var unwatchItems = app.$watch("items", function(val)
{
  if(app.items.length > 0) app.selectedMaterial = app.items[0];
  unwatchItems();
});

app.$watch("selectedMaterial", updatePlate);
/*app.$watch("selectedMaterial.width", updatePlate);
app.$watch("selectedMaterial.height", updatePlate);
app.$watch("selectedMaterial.thickness", updatePlate);*/

function updatePlate()
{
  var plate = app.selectedMaterial;
  app.drawingSize = {
    width: Math.round(plate.width / 10) * 1024,
    height: Math.round(plate.height / 10) * 1024
  };
  
  drawingManager.plateChanged().then(() => sceneManager.drawingChanged());
}

//TODO: need to watch out for Text nodes and warn user
function fileSelected(files)
{
  if(!files || files.length < 1) return;
  
  var reader = new FileReader();
  reader.onload = function(data)
  {
    var dataUrl = data.target.result;
    drawingManager.loadDrawing(dataUrl).then(function()
    {
      sceneManager.drawingChanged();
      app.hasDrawing = true;
    });
  };
  reader.readAsDataURL(files[0]);
  //reader.readAsText(files[0]);
}