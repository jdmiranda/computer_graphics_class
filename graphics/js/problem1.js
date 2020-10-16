let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let polygon;

function createScene() {
  let inner = new THREE.Color(1, 0, 0);
  let outer = new THREE.Color(0, 0, 1);
    polygon = regularPolygonGeometry(8, inner, outer);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
    scene.add(polygon);
}

function degreeToRadian(degree){
  return degree * (Math.PI / 180)
}

function regularPolygonGeometry(n, innerColor, outerColor) {
  let radius = 2;
  let circle_degrees = 360;
  let angle = circle_degrees/n;
  let points = getPoints(n,radius, angle);
  let center = new THREE.Vector3(0,0,0);
  let pointB = new THREE.Vector3(radius,0,0);
  let geom = new THREE.Geometry();
  geom.vertices.push(center);
  geom.vertices.push(pointB);
  for (var i = 0; i < n; i++){
    var j,k;
    geom.vertices.push(points[i]);
    if (i == 0 ){
      j = 1;
      k = 2;
    } else if (i == n-1) {
      j = 1;
      k = i +1;
    } else {
      j = i + 1;
      k = i + 2;
    }

    var face = new THREE.Face3(0,j,k);
    geom.faces.push(face);
    face.vertexColors.push(innerColor, outerColor, outerColor);
  }

  let args = {vertexColors: THREE.VertexColors, side: THREE.DoubleSide};
  let mat = new THREE.MeshBasicMaterial(args);
  let mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

function getPoints(n,r,a){
  let point = [n]
  for (var i = 0; i < n; i++ ){
    let theta = a * (i+1);
    point[i] = getPoint(r, degreeToRadian(theta));
  }
  return point;
}

function getPoint(r, a){
  let x = r * Math.cos(a);
  let y = r * Math.sin(a);
  return new THREE.Vector3(x,y,0);
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
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
	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1.0);
    renderer.setAnimationLoop(function () {
        render();
    });
	camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 12);
  let n = controls.nbrLevels;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.update();
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 3, 360).step(1).onChange(update);
    gui.addColor(controls, 'inner').onChange(update);
    gui.addColor(controls, 'outer').onChange(update);
}

function update() {
  if (polygon){
    scene.remove(polygon);
  }

  let i = new THREE.Color(controls.inner);
  let o = new THREE.Color(controls.outer);
  polygon = regularPolygonGeometry(controls.nbrLevels, i, o);
  scene.add(polygon);
  updateCamera();
}

function updateCamera() {
    let n = controls.nbrLevels;
    let offset = controls.offset;
    camera.position.set(0, 12, 20);
    camera.lookAt(new THREE.Vector3(0, n/2 * offset, 0));
    camera.updateProjectionMatrix();
    cameraControls.update();
}

var controls = new function() {
    this.nbrLevels = 8;
    this.inner = '#ff0000';
    this.outer = '#ff0000'
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
