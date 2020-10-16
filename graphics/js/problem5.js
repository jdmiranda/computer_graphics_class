
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let floorLength = 100;
let floorWidth = 100;

function createScene() {
    nbrBoxes = 100;
    minSide = 5;
    maxSide = 20;
    minHeight = 5;
    maxHeight = 30;
    createFloor(floorLength * 2, floorWidth * 2);
    randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createFloor(x,z){
  var geometry = new THREE.PlaneGeometry(x,z);
  var material = new THREE.MeshBasicMaterial({color:'grey', side: THREE.DoubleSide});
  var plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI/2;
  scene.add(plane);
}

function randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight){
  for (var i = 0; i < nbrBoxes; i++){
    var width = getRndInteger(minSide, maxSide);
    var depth = getRndInteger(minSide, maxSide);
    var height = getRndInteger(minHeight, maxHeight);
    var xmin = -floorLength + (width/2);
    var xmax = floorLength - (width/2);
    var zmin = -floorWidth + (depth/2);
    var zmax = floorWidth - (depth/2);
    var baseX = getRndInteger(xmin, xmax);
    var baseZ = getRndInteger(zmin, zmax);
    var color = new THREE.Color();
    color.setHSL(Math.random(), Math.random(0.8, 0.95), Math.random(0.3, 0.7));
    var geometry = new THREE.BoxGeometry(width,height,depth);
    var material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
    material.opacity = 0.8;
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(baseX,height/2,baseZ);
    scene.add(cube);
  }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
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
	camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
	camera.position.set(0, 400, 12);
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
addToDOM();
render();
animate();
