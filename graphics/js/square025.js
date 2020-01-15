/***********
 * square025.js
 * A quasi-square with lighting
 * M. Laszlo
 * September 2019
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();


function createScene() {
    var triangle = makeSquare();
    var axes = new THREE.AxesHelper(10);
    addLights();
    scene.add(triangle);
    scene.add(axes);
}

function addLights() {
    var pointLight1 = new THREE.PointLight(0xFFFFFF, 1, 0, 1000);
    pointLight1.position.set(0, 20, 20);
    var pointLight2 = new THREE.PointLight(0xFFFFFF, 1, 0, 1000);
    pointLight2.position.set(0, 20, -20);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(pointLight1);
    scene.add(pointLight2);
    scene.add(ambientLight);
}


function makeSquare() {
    var geom = new THREE.Geometry();
    var a = new THREE.Vector3(0, 0, 0);
    var b = new THREE.Vector3(8, 0, 0);
    var c = new THREE.Vector3(0, 8, 0);
    var d = new THREE.Vector3(8, 8, 4);
    geom.vertices.push(a, b, c, d);
    var face1 = new THREE.Face3(0, 1, 2);
    var face2 = new THREE.Face3(1, 2, 3);
    geom.faces.push(face1, face2);
    geom.computeFaceNormals();
    var color = getRandomColor(0.9, 0.1, 0.5)
    var args = {color: color, flatShading: true, side: THREE.DoubleSide};
    var mat = new THREE.MeshLambertMaterial(args);
    var mesh = new THREE.Mesh(geom, mat);
    return mesh;
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 30);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
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

