/***********
 * lightingA.js
 * M. Laszlo
 * May 2020
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let sun;
let matPhong;
let ambientLight, light;


function createScene() {    
    let color = new THREE.Color(controls.color);
    matPhong = new THREE.MeshPhongMaterial({color: color, shininess: 10});
    let geom = new THREE.TorusGeometry(10, 4, 24, 24);
    let mesh = new THREE.Mesh(geom, matPhong);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
    geom = new THREE.SphereGeometry(3.5, 16, 16);
    scene.add(new THREE.Mesh(geom, matPhong));
    let sunMat = new THREE.MeshBasicMaterial({color: 'yellow'});
    let sunGeom = new THREE.SphereGeometry(0.5, 12, 12);
    sun = new THREE.Mesh(sunGeom, sunMat);
    light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 0);
    sun.add(light);
    sun.translateY(10);
    ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(sun);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

var controls = new function() {
    this.transx = 0.0;
    this.transy = 10.0;
    this.transz = 0.0;
    this.ambient = 0.2;
    this.spot = 1.0;
    this.shininess = 10.0;
    this.color = '#3366ff';
    this.specular = '#ffffff';
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    sun.position.x = controls.transx;
    sun.position.y = controls.transy;
    sun.position.z = controls.transz;
    matPhong.color = new THREE.Color(controls.color);
    matPhong.specular = new THREE.Color(controls.specular);
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);
	camera.position.set(0, 40, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initGUI() {
    let gui = new dat.GUI();
    gui.add(controls, 'transx', -20.0, 20.0).step(0.5);
    gui.add(controls, 'transy', 0.0, 20.0).step(0.5);
    gui.add(controls, 'transz', -20.0, 20.0).step(0.5);
    gui.add(controls, 'ambient', 0.0, 1.0).name('ambient intensity').step(0.1).onChange(update);
    gui.add(controls, 'spot', 0.0, 1.0).name('spot intensity').step(0.1).onChange(update);
    gui.add(controls, 'shininess', 1, 120).step(1).onChange(update);
    gui.addColor(controls, 'color').name('diffuse color');
    gui.addColor(controls, 'specular').name('specular color');
}

function update() {
    ambientLight.intensity = controls.ambient;
    light.intensity = controls.spot;
    matPhong.shininess = controls.shininess;
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
initGUI();
addToDOM();
render();
animate();

