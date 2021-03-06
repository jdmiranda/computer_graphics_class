
let camera, scene, renderer, cameraControls, root, sphereRadius;
let clock = new THREE.Clock();

function createScene() {
    sphereRadius = 10;
    nbrBursts = 360;
    maxRays = 100;
    maxRad = 1;
    root = starburstsOnToroid(nbrBursts, sphereRadius, maxRays, maxRad);
    scene.add(root);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function starburstsOnToroid(nbrBursts, sphereRadius, maxRays, maxRad) {
    let root = new THREE.Object3D();
    for (let i = 0; i < nbrBursts; i++) {
        let mesh = starburst(maxRays, maxRad);
        let p = getPoint(sphereRadius, i);
        mesh.position.set(p.x, p.y, p.z);
        root.add(mesh);
    }
    return root;
}

function degreeToRadian(degree){
  return degree * (Math.PI / 180);
}

function getPoint(r, d){
  a = degreeToRadian(d);
  x = r * Math.cos(a);
  y = r * Math.sin(a);
  base = new THREE.Vector3(x,y,0);
  quarter = r/4;
  r = getRandomInt(0,360);
  a2 = degreeToRadian(r);
  y2 = quarter * Math.cos(a2);
  z = quarter * Math.sin(a2);
  return new THREE.Vector3(x, y+y2, z);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRandomPointOnToroid(){
  let root = new THREE.Object3D();
  for (let i = 0; i < nbrBursts; i++) {
      let mesh = starburstA(maxRays, maxRad);
      let p = getPoint(sphereRadius, i);
      mesh.position.set(p.x, p.y, p.z);
      root.add(mesh);
  }
  return root;
}

function starburst(maxRays, maxRad) {
    let rad = 1;
    let origin = new THREE.Vector3(0, 0, 0);
    let innerColor = getRandomColor(0.8, 0.1, 0.8);
    let black = new THREE.Color(0x000000);
    let geom = new THREE.Geometry();
    let nbrRays = getRandomInt(1, maxRays);
    for (let i = 0; i < nbrRays; i++) {
        let r = rad * getRandomFloat(0.1, maxRad);
        let dest = getRandomPointOnSphere(r);
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, black);
    }
    let args = {vertexColors: true, linewidth: 2};
    let mat = new THREE.LineBasicMaterial(args);
    return new THREE.Line(geom, mat, THREE.LineSegments);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

let controls = new function() {
    this.nbrBursts = 400;
    this.maxRays = 100;
    this.maxRad = 1;
    this.sphereRad = 10;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrBursts', 5, 2000).step(5).name('Nbr of bursts');
    gui.add(controls, 'maxRays', 5, 200).name('Max nbr of rays');
    gui.add(controls, 'maxRad', 1, 5).name('Max radius');
    gui.add(controls, 'sphereRad', 5, 20).name('Sphere radius');
    gui.add(controls, 'Go');
}

function update() {
    let nbrBursts = controls.nbrBursts;
    let maxRays = controls.maxRays;
    let maxRad = controls.maxRad;
    let sphereRad = controls.sphereRad;
    if (root)
        scene.remove(root);
    root = starburstsOnToroid(nbrBursts, sphereRad, maxRays, maxRad);
    scene.add(root);
}

function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}

init();
createScene();
initGui();
addToDOM();
animate();
