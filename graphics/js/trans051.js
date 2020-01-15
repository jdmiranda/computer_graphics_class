/***********
 * trans060.js
 * Setting an Object3D's position, rotation, and scale properties
 *   transforms it in object coordinates thus: T.R.S(object).
 * In the 'object-based interpretation', we create the object centered 
 *   and aligned in object space, then scale it, then rotate it, and 
 *   then translate 
 * In the 'system-based interpretation', we translate, then rotate,
 *   then scale the higher-level coordinate system, and then create
 *   the object centered and aligned in this system.
 *
 * Transformation: T.R(box) in two ways
 * Object-based interpretation:
 *   In object coordinates, create box, then rotate it and then translate it
 * System-based intepretation:
 *   Translate WCS, then rotate WCS, then create box
 *
 * Note that the blueBoxinherits its coordinate system from its parent,
 *   blueParent. This is a simple scene graph.
 *
 * M. Laszlo
 * September 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let geom = new THREE.CubeGeometry(1, 1, 1);
    let args =  {color: 'red', transparent: true, opacity: 0.8};
    let redMat = new THREE.MeshLambertMaterial(args);
//    let blueMat = new THREE.MeshLambertMaterial( {color: 'blue', transparent: true, opacity: 0.8})
    let thirtyDegs = Math.PI / 6;
    
    // red box
    let redBox = new THREE.Mesh(geom, redMat);
    redBox.position.x = 4;
    redBox.rotation.z = thirtyDegs;
    redBox.scale.x = 3;

    let geom2 = new THREE.CubeGeometry(1, 1, 1);
    args.color = 'blue';
    let blueMat = new THREE.MeshLambertMaterial(args);
    let blueBox = new THREE.Mesh(geom2, blueMat);
    let parent = new THREE.Object3D();
    parent.position.x = 8;
    blueBox.rotation.z = thirtyDegs;
    blueBox.scale.x = 3;
    parent.add(blueBox);
    scene.add(parent);


    // blue box
    // let blueParent = new THREE.Object3D();
    // blueParent.position.x = 8;
    // let blueBox = new THREE.Mesh(geom, blueMat);
    // blueParent.add(blueBox);
    // blueBox.rotation.z = thirtyDegs;

    // light
    //   args: color, intensity, range (0 if limitless)
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(redBox);
    // scene.add(blueParent);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
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

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
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

