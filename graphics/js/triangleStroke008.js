/***********
 * triangleStroke008.js
 * A simple triangle stroke with vertex colors 
 * M. Laszlo
 * September 2019
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();


function createScene() {
    var triangle = makeTriangle();
    var axes = new THREE.AxesHelper(10);
    scene.add(triangle);
    scene.add(axes);
}


function makeTriangle() {
    var geom = new THREE.Geometry();
    var a = new THREE.Vector3(0, 0, 0);
    var b = new THREE.Vector3(4, 0, 0);
    var c = new THREE.Vector3(0, 8, 0);
    geom.vertices.push(a, b, c, a)
    var red = new THREE.Color(1, 0, 0);
    var green = new THREE.Color(0, 1, 0);
    var blue = new THREE.Color(0, 0, 1);
    geom.colors.push(red, green, blue, red);
    var args = {vertexColors: true, linewidth: 4};
    var mat = new THREE.LineBasicMaterial(args);
    var line = new THREE.Line(geom, mat, THREE.LineStrip);
    return line;
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
	camera.position.set(0, 0, 40);
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

