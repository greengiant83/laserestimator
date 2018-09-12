var DOMURL = self.URL || self.webkitURL || self;

class SceneManager
{
  constructor (canvasSelector, sourceSvgSelector, plateObjectSelector)
  {
    var self = this;
    this.canvas = document.querySelector(canvasSelector);
    this.sourceSvg = document.querySelector(sourceSvgSelector);
    this.ctx = this.canvas.getContext("2d");
    this.plateObject = document.querySelector(plateObjectSelector);
    this.backgroundImage = null;
    this.drawingImage = null;
    this.roughnessImageDataUrl = null;
    
    /*app.$watch("selectedMaterial", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial.width", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial.height", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial.thickness", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial.color", function(plate) { self.updatePlate(); });*/
  }
  
  /*plateChanged()
  {
    var plate = app.selectedMaterial;
    var scalar = 0.0254;
    
    self.plateObject.setAttribute("scale", { x: plate.width * scalar, y: plate.height * scalar, z: plate.thickness * scalar });
    self.plateObject.setAttribute("color", plate.color);
    
    self.drawingChanged();
  }*/
  
  drawingChanged()
  {
    var self = this;
    
    this.canvas.width = this.sourceSvg.width.baseVal.value;
    this.canvas.height = this.sourceSvg.height.baseVal.value;
    
    self.updateImages().then(() => self.draw());
    
  }
  
  updateImages()
  {
    var self = this;
    return Promise.all([
      self.updateDrawingImage(),
      self.updateBackgroundImage()
    ]).then(() => self.updateRoughnessImage());
  }
  
  updateDrawingImage()
  {
    var self = this;
    return new Promise(function (resolve, reject)
    {
      var svgString = new XMLSerializer().serializeToString(self.sourceSvg);
      self.drawingImage = new Image();
      var svgData = new Blob([svgString], { type: "image/svg+xml;charset=utf-8"});
      var dataUrl = DOMURL.createObjectURL(svgData);
      
      self.drawingImage.onload = function()
      {
        DOMURL.revokeObjectURL(dataUrl);        
        resolve();
      }
      self.drawingImage.src = dataUrl;
    });
  }
  
  updateRoughnessImage()
  {
    var self = this;
    return new Promise(function(resolve, reject)
    {
      //invert for roughness map
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

      if(self.backgroundImage)
      {
        self.ctx.drawImage(self.backgroundImage, 0, 0);
        self.ctx.fillStyle = "black"; //Will be inverted in the next step
        self.ctx.globalAlpha = app.selectedMaterial.roughness;
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
        self.ctx.globalAlpha = 1;
      }
      else
      {
        var v = 255 - (app.selectedMaterial.roughness * 255); //Will be inverted in the next step
        self.ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
      }
      
      self.ctx.drawImage(self.drawingImage, 0, 0);
      var imageData = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);
      var pixels = imageData.data;

      for(var i=0;i<pixels.length;i+=4)
      {
        pixels[i+0] = 255 - pixels[i+0];
        pixels[i+1] = 255 - pixels[i+1];
        pixels[i+2] = 255 - pixels[i+2];
      }      
      self.ctx.putImageData(imageData, 0, 0);

      self.roughnessImageDataUrl = self.canvas.toDataURL("image/png"); //TODO: Make sure DOMURL.revokeObjectURL() gets called on this???
      document.querySelector("#debugImage").src = self.roughnessImageDataUrl;
      resolve();
    });
  }
  
  updateBackgroundImage()
  {
    var self = this;
    return new Promise(function (resolve, reject)
    {
      if(app.selectedMaterial.texture)
      {
        if(app.selectedMaterial.textureImage)
        {
          self.backgroundImage = app.selectedMaterial.textureImage;
          resolve();
        }
        else
        {
          self.backgroundImage = new Image();
          self.backgroundImage.crossOrigin = "Anonymous";
          self.backgroundImage.onload = (i => {
            app.selectedMaterial.textureImage = self.backgroundImage;
            resolve()
          });
          self.backgroundImage.src = app.selectedMaterial.texture;
        }
      }
      else 
      {
        self.backgroundImage = null;
        resolve();
      }
    });
  }
  
  draw()
  {
    var self = this;
    self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
    
    if(self.backgroundImage)
    {
      self.ctx.drawImage(self.backgroundImage, 0, 0);
    }
    else
    {
      self.ctx.fillStyle = app.selectedMaterial.color;
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
    }
    
    self.ctx.drawImage(self.drawingImage, 0, 0);
    
    var colorImageDataUrl = self.canvas.toDataURL("image/png"); //TODO: need to get this revoked
    var scalar = 0.0254; //Inches to meters conversion
    var plate = app.selectedMaterial;
    
    self.plateObject.setAttribute("plate", { colorMap: colorImageDataUrl, roughnessMap: self.roughnessImageDataUrl });
    self.plateObject.setAttribute("scale", { x: plate.width * scalar, y: plate.height * scalar, z: plate.thickness * scalar });
    
    
    
    
    //////////////////////
    
    //////////////////
    
    /*var svgString = new XMLSerializer().serializeToString(this.sourceSvg);
    var img = new Image();
    var svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    var self = this;

    
    
    img.onload = function()
    {
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      
      if(app.selectedMaterial.texture)
      {
        console.log("using texture");
        var textureImg = new Image();
        textureImg.crossOrigin = "Anonymous";
        textureImg.onload = function()
        {
          console.log("texture loaded");
          self.ctx.drawImage(textureImg, 0, 0);
          self.ctx.drawImage(img, 0, 0);
          self.copyCanvasToPlate();
        }
        textureImg.src = app.selectedMaterial.texture;
      }
      else
      {
        self.ctx.fillStyle = "white";
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
        self.ctx.drawImage(img, 0, 0);
        self.copyCanvasToPlate();
      }
    }
    img.src = url;*/
  }

  
  
  /*copyCanvasToPlate()
  {
    var self = this;
    var colorImg = self.canvas.toDataURL("image/png");
      
    //invert for roughness map
    var imageData = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);
    var data = imageData.data;

    for(var i=0;i<data.length;i+=4)
    {
      data[i+0] = 255 - data[i+0];
      data[i+1] = 255 - data[i+1];
      data[i+2] = 255 - data[i+2];
    }      
    self.ctx.putImageData(imageData, 0, 0);

    var roughnessImg = self.canvas.toDataURL("image/png");
    self.plateObject.setAttribute("plate", { color: app.selectedMaterial.color, colorMap: colorImg, roughnessMap: roughnessImg });

    DOMURL.revokeObjectURL(colorImg);
    DOMURL.revokeObjectURL(roughnessImg);
  }*/
}