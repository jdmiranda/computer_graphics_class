
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let party;
let torus,torus2, torus3, torus4, torus5;


function createScene() {
    party = startTheParty(3);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(party);
}


function degreeToRadian(degree){
  return degree * (Math.PI / 180);
}

function startTheParty(t){
  let root = new THREE.Object3D();
  let s = createSphere(1, 32, 32);
  root.add(s);
  for (let i = 0; i < t; i++){
    let ring = createTorus(i+1);
    root.add(ring);
  }
  return root;
}

function createSphere(radius, width, height){
  var geometry = new THREE.SphereGeometry(radius, width, height);
  var color = getRandomColor(0.8, 0.1, 0.8);
  var material = new THREE.MeshLambertMaterial( {color: color} );
  return new THREE.Mesh( geometry, material );
}

function createTorus(radius){
  let color =  getRandomColor(0.8, 0.1, 0.8);
  tube = .5;
  radialSegments = 16;
  tubularSegments = 50;
  var geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
  var material = new THREE.MeshLambertMaterial({color:color});
  var torus = new THREE.Mesh(geometry, material);
  return torus;
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function animateGeometry(){
  for (let i = 1; i < party.children.length; i++){
    let child = party.children[i];
    rotateGeometry(i * .01, child)
  }
}

function rotateGeometry(speed, child){
  child.rotation.x -= speed;
  child.rotation.y -= speed;
  child.rotation.z -= speed ;
}

function render() {
  let delta = clock.getDelta();
  cameraControls.update(delta);
  animateGeometry();
	renderer.render(scene, camera);
}

var controls = new function() {
    this.nbrLevels = 2;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 8).step(1).onChange(update);
}

function update() {
  if (party){
    scene.remove(party);
  }
  let n = controls.nbrLevels;
  party = startTheParty(n);
  scene.add(party);
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
	camera.position.set(0, 0, 20);
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
render();
animate();
