
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let torus,torus2, torus3, torus4, torus5;


function createScene() {
    torus = createTorus(1, 'purple');
    torus2 = createTorus(2,'orange');
    torus3 = createTorus(3,'green');
    torus4 = createTorus(4,'white');
    torus5 = createTorus(5,'red');
    createSphere(1, 32, 32);
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
    scene.add(torus);
    scene.add(torus2);
    scene.add(torus3);
    scene.add(torus4);
    scene.add(torus5);
}


function degreeToRadian(degree){
  return degree * (Math.PI / 180);
}

function createSphere(radius, width, height){
  var geometry = new THREE.SphereGeometry(radius, width, height);
  var material = new THREE.MeshLambertMaterial( {color: 'red'} );
  var sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );
}

function createTorus(radius, color){
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
  var speed = .03;
  rotateGeometry(speed, torus);
  rotateGeometry(-speed, torus2);
  rotateGeometry(speed, torus3);
  rotateGeometry(-speed, torus4);
  rotateGeometry(speed, torus5);
}

function rotateGeometry(speed, geometry){
  geometry.rotation.x -= speed * geometry.material.color.r ;
  geometry.rotation.y -= speed * geometry.material.color.g ;
  geometry.rotation.z -= speed * geometry.material.color.b ;
}

function render() {
  let delta = clock.getDelta();
  cameraControls.update(delta);
  animateGeometry();
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
addToDOM();
render();
animate();
