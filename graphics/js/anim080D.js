/***********
 * anim080D.js
 * Rotating box
 * Box rotates around the z-axis.
 *
 * M. Laszlo
 * September 2019
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


function createScene() {
    box = makeRotatingBox();
	let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    let axes = new THREE.AxesHelper(10);
	scene.add(light);
	scene.add(ambientLight);
	scene.add(box);    
    scene.add(axes);
}

function makeRotatingBox() {
    let geom = new THREE.CubeGeometry(4, 1, 1);
    let mat = new THREE.MeshLambertMaterial({color: 'blue'});
    let box = new THREE.Mesh(geom, mat);
    box.rps = 0.2;
    return box;
}


function update2() {
	let delta = clock.getDelta();
	curAngle += rpsToRadians(box.rps, delta); // (angleStep * delta);
    curAngle %= 2 * Math.PI;
	box.rotation.z = curAngle;
//	cameraControls.update(delta);
}

function update() {
    let delta = clock.getDelta();
    let deltaRadians = rpsToRadians(box.rps, delta);
    box.rotation.z += deltaRadians;
    box.rotation.z %= 2 * Math.PI;
//    cameraControls.update(delta);
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
	renderer.setClearColor(0x0, 1.0);
    renderer.setAnimationLoop(function () {
        update();
        renderer.render(scene, camera);
    });

	camera = new THREE.PerspectiveCamera(40, canvasWidth/canvasHeight, 1, 1000);
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


