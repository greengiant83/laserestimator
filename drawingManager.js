class DrawingManager
{
  constructor(svgSelector)
  {
    var self = this;
    this.outerSvg = document.querySelector(svgSelector);
    this.innerSvg = null;
    this.itemsSet = null;
    this.bounds = { left: 0, top:0, right:0, bottom:0 };
    this.s = Snap(svgSelector);
    this.dpi = 96;
    this.hasDrawing = false;
    
    this.visualElementTypes = [
      "circle",
      "ellipse",
      "path",
      "polygon",
      "polyline",
      "rect",
    ];
    
    /*app.$watch("selectedMaterial.width", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial.height", function(plate) { self.updatePlate(); });
    app.$watch("selectedMaterial", function(plate) { self.updatePlate(); });*/
  }
  
  loadDrawing(url)
  {
    var self = this;
    return new Promise(function(resolve, reject)
    {                  
      Snap.load(url, function(e)
      {
        self.s.clear();
        self.s.append(e);
        self.hasDrawing = true;

        self.discoverDPI();
        self.findItems();
        self.updateLength();
        self.updateStyles();
        self.updateBounds();
        self.updateViewbox();
        
        resolve();
      });
    });
  }
  
  plateChanged()
  {
    var self = this;
    return new Promise(function(resolve, reject)
    {
      self.outerSvg.width.baseVal.value = app.drawingSize.width;
      self.outerSvg.height.baseVal.value = app.drawingSize.height;
      if(self.hasDrawing) self.updateViewbox();
      resolve();
    });
  }

  discoverDPI()
  {
    this.innerSvg = this.outerSvg.querySelector("svg");
    this.dpi = this.innerSvg.viewBox.baseVal.width / this.innerSvg.width.baseVal.valueInSpecifiedUnits;

    //Look through comments to identify source program
    for(var i=0;i<this.outerSvg.childNodes.length;i++)
    {
      var node = this.outerSvg.childNodes[i];
      if(node.nodeType === 8) //8 == Node.COMMENT_NODE
      {
        if(node.data.search(/illustrator/i) > -1)
        {
          this.dpi = 72; //Illustrator does not properly annotate the file with dimensions, but it is known that it exports units as 1/72 of an inch
          break;
        }
       }
    }     

    //Constants listed here: https://www.w3.org/TR/SVG/types.html
    switch(this.innerSvg.width.baseVal.unitType)
    {
      case SVGLength.SVG_LENGTHTYPE_CM:
        this.dpi *= 2.54;
        break;
      case SVGLength.SVG_LENGTHTYPE_MM:
        this.dpi *= 25.4; 
        break;
      case SVGLength.SVG_LENGTHTYPE_IN:
        this.dpi *= 1;
        break;
    }   
    console.log("DPI: ", this.dpi);
  }

  findItems()
  {
    var els = this.s.selectAll("*");
    this.itemsSet = new Snap.Set()

    els.forEach(i => {          
      this.visualElementTypes.forEach(t => {
        if(t == i.type) this.itemsSet.push(i);
      });
    });
  }

  updateLength() //Returns inches
  {
    var totalLength = 0;

    this.itemsSet.items.forEach((i, index) => {
      if(i.node.getTotalLength) totalLength += i.node.getTotalLength();
    });
    app.lengthInches = totalLength / this.dpi;
  }

  updateBounds()
  {
    this.itemsSet.items.forEach((i, index) => {
      var box = i.node.getBBox();
      var transform = i.node.getTransformToElement(this.innerSvg);
      box = this.boxToGlobal(box, transform);

      if(index == 0)
      {
        this.bounds.left = box.x;
        this.bounds.top = box.y;
        this.bounds.right = box.x + box.width;
        this.bounds.bottom = box.y + box.height;
      }
      else
      {
        var right = box.x + box.width;
        var bottom = box.y + box.height;
        if(box.x < this.bounds.left) this.bounds.left = box.x;
        if(box.y < this.bounds.top) this.bounds.top = box.y;
        if(right > this.bounds.right) this.bounds.right = right;
        if(bottom > this.bounds.bottom) this.bounds.bottom = bottom;
      }
    });
    app.drawingBounds.width = this.bounds.right - this.bounds.left;
    app.drawingBounds.height = this.bounds.bottom - this.bounds.top;
    console.log(this.bounds);
  }

  updateStyles()
  {
    app.groups = [];
    
    this.itemsSet.items.forEach(i => {
      var fill = i.attr("fill");
      var stroke = i.attr("stroke");
      var isRaster = (fill && fill != "none");
      var color = isRaster ? fill : stroke;
      
      var group = app.groups.find(g => g.isRaster == isRaster && g.color == color);
      if(!group)
      {
        group = {
          isVisible: true,
          isRaster: isRaster,
          isCut: !isRaster,
          mode: 0,
          color: color,
          items: []
        }
        app.groups.push(group);
      }
      
      group.items.push(i);
      
      /*i.attr({
        fill:"none",
        stroke: "black",
        strokeWidth: 0.01 * this.dpi //Inches
      });*/

      i.node.className.baseVal = "";
    });
  }

  updateViewbox()
  { 
    var width = app.selectedMaterial.width; //inches
    var height = app.selectedMaterial.height; //inches

    //Make sure outer svg viewport can see all of inner svg's viewport
    this.innerSvg.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_IN, width);
    this.innerSvg.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_IN, height);

    this.outerSvg.viewBox.baseVal.width = this.innerSvg.width.baseVal.value;
    this.outerSvg.viewBox.baseVal.height = this.innerSvg.height.baseVal.value;

    var cx = this.bounds.left + (this.bounds.right - this.bounds.left) / 2;
    var cy = this.bounds.top + (this.bounds.bottom - this.bounds.top) / 2;

    this.innerSvg.viewBox.baseVal.x = (cx - (width * this.dpi) / 2);
    this.innerSvg.viewBox.baseVal.y = (cy - (height * this.dpi) / 2);
    this.innerSvg.viewBox.baseVal.width = width * this.dpi;
    this.innerSvg.viewBox.baseVal.height = height * this.dpi;
  }
  
  boxToGlobal(box, transform)
  {
    var topLeft = this.pointToGlobal(box.x, box.y, transform);
    var bottomRight = this.pointToGlobal(box.x + box.width, box.y + box.height, transform);
    box.x = topLeft.x;
    box.y = topLeft.y;
    box.width = bottomRight.x - topLeft.x;
    box.height = bottomRight.y - topLeft.y;
    return box;
  }

  pointToGlobal(x, y, transform)
  {
    var pt = this.innerSvg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    var globalPt = pt.matrixTransform(transform);        
    return globalPt;        
  }
}