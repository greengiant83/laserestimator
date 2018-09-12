var testPlate;
AFRAME.registerComponent("plate", {    
  schema: 
  {
    color: { type: "color" },
    colorMap: { type: "asset" },
    roughnessMap: { type: "asset" },
  },
  
  init: function()
  {
    var geo = new THREE.Geometry();  
    
    geo.vertices.push(
      new THREE.Vector3(0.5, 0.5, 0.5),
      new THREE.Vector3(0.5, -0.5, 0.5),
      new THREE.Vector3(-0.5, -0.5, 0.5),
      new THREE.Vector3(-0.5, 0.5, 0.5),
      
      new THREE.Vector3(0.5, 0.5, -0.5),
      new THREE.Vector3(0.5, -0.5, -0.5),
      new THREE.Vector3(-0.5, -0.5, -0.5),
      new THREE.Vector3(-0.5, 0.5, -0.5)
    );
    
    geo.faces.push(
      //Front
      new THREE.Face3(0, 2, 1, new THREE.Vector3(0, 0, 1)),
      new THREE.Face3(0, 3, 2, new THREE.Vector3(0, 0, 1)),
      
      //Back
      new THREE.Face3(4, 5, 6, new THREE.Vector3(0, 0, -1)),
      new THREE.Face3(4, 6, 7, new THREE.Vector3(0, 0, -1)),
      
      //Top
      new THREE.Face3(4, 3, 0, new THREE.Vector3(0, 1, 0)),
      new THREE.Face3(4, 7, 3, new THREE.Vector3(0, 1, 0)),
      
      //Bottom
      new THREE.Face3(1, 2, 5, new THREE.Vector3(0, -1, 0)),
      new THREE.Face3(2, 6, 5, new THREE.Vector3(0, -1, 0)),
      
      //Right
      new THREE.Face3(0, 1, 5, new THREE.Vector3(1, 0, 0)),
      new THREE.Face3(0, 5, 4, new THREE.Vector3(1, 0, 0)),
      
      //Left
      new THREE.Face3(3, 6, 2, new THREE.Vector3(-1, 0, 0)),
      new THREE.Face3(3, 7, 6, new THREE.Vector3(-1, 0, 0)),
    );   
    
    //Front
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 0)]);
    
    //Back
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, 1)]);
    
    //Top
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 1)]);
    
    //Bottom
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0)]);
    
    //Right
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(1, 0)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(1, 1)]);
    
    //Left
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, 0)]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 0)]);
    
    this.material = new THREE.MeshStandardMaterial();
    
    var mesh = new THREE.Mesh(geo, this.material);
    
    this.el.object3D.add(mesh);
    
    this.loader = new THREE.TextureLoader();
    
    var envMap = this.loader.load("https://cdn.glitch.com/c3f6036c-73d4-4d3a-98a7-7a92441d1c10%2FenvMap.png?1536589267784");
    envMap.mapping = THREE.SphericalReflectionMapping;
    this.material.envMap = envMap;
    this.material.roughness = 0;
    this.material.metalness = 0;
    
    testPlate = this;
  },
  
  update: function()
  {
    if(this.data.color)
    {
      this.material.color = new THREE.Color(this.data.color);
    }
    
    if(this.data.colorMap)
    {
      var texture = this.loader.load(this.data.colorMap);
      this.material.map  = texture;
      //this.material.bumpMap = texture;
      this.material.needsUpdate = true;
    }
    
    if(this.data.roughnessMap)
    {
      var texture = this.loader.load(this.data.roughnessMap);
      this.material.roughnessMap = texture;
      this.material.roughness = 2.5;
      this.material.needsUpdate = true;
      
      
    }
  }
});