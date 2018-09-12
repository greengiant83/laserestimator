class Material
{
  constructor()
  {
    this.name = "";
    this.width = null;
    this.height = null;
    this.thickness = null;
    this.color = "";
  }
}

class MaterialLibrary
{
  constructor()
  {
    var self = this;
    var config = {
      apiKey: "AIzaSyBWZhcn910DaD0Do1XhZGiWGk68zHFzAh8",
      authDomain: "material-library.firebaseapp.com",
      databaseURL: "https://material-library.firebaseio.com",
      projectId: "material-library",
      storageBucket: "material-library.appspot.com",
      messagingSenderId: "1074400192295"
    };
    firebase.initializeApp(config);

    this.db = firebase.database();
    this.materialsRef = this.db.ref("materials");

    this.materials = [];

    this.materialsRef.on("child_added", function(snap)
    {
      var material = new Material();
      self.materials.push(material);
      snap.ref.on("value", function(snap)
      {
        var data = snap.val();
          
        material.key = snap.key;
        material.name =  data.name;
        material.width =  data.width;
        material.height =  data.height;
        material.thickness =  data.thickness;
        material.color =  data.color;
        material.texture = data.texture;
        material.roughness = data.roughness;
      });
    });

    this.materialsRef.on("child_removed", function(snap)
    {
      var index = null;
      for(var i=0;i<self.materials.length;i++)
      {
        if(self.materials[i].key == snap.key)
        {
          index = i;
          break;
        }
      }
      if(index != null) self.materials.splice(index, 1);
    });
  }

  addMaterial(newMaterial)
  {
    var ref = this.materialsRef.push();
    ref.set({
      name: newMaterial.name,
      width: newMaterial.width*1,
      height: newMaterial.height*1,
      thickness: newMaterial.thickness*1,
      color: newMaterial.color,
      texture: newMaterial.texture,
      roughness: newMaterial.roughness*1
    });
  }

  removeMaterial(key)
  {
    this.materialsRef.child(key).remove();
  }
}