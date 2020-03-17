/***********
 * linearAlgA.js
 *
 * M. Laszlo
 * March 2020
 ***********/


let camera, scene, renderer;
let cameraControls, grid;

function createScene() {
    let axes = new makeAxes({axisLength: 1});
    scene.add(axes);
    grid = createGrid(10, 10);
    scene.add(grid);

    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light); 
    scene.add(ambientLight);
}


function createGrid(size=6, divisions=6, centerColor=0x9900ee, color=0x999999) {
    let orgGridRoot = new THREE.Object3D();
    let gridX = new THREE.GridHelper(size, divisions, centerColor, color);
    gridX.rotation.z = Math.PI / 2;
    let gridY = new THREE.GridHelper(size, divisions, centerColor, color);
    gridY.rotation.x = Math.PI / 2;
    let gridZ = new THREE.GridHelper(size, divisions, centerColor, color);
    orgGridRoot.add(gridX);
    orgGridRoot.add(gridY);
    orgGridRoot.add(gridZ);
    return orgGridRoot;
}


let controls = new function () {
    this.point = '1,1,1';
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'point');
    gui.add(controls, 'Go');
}

function update() {
    let ps = controls.point;
    let point = ps.split(',').map(val => parseFloat(val));
    point = new THREE.Vector3(...point);
    let args = {color: getRandomColor(0.5, 0.2, 0.6)};
    let sphere = createSphere(point, args);
        console.log(sphere)
    scene.add(sphere);
}

function createSphere(p, args={}) {
    let mat = new THREE.MeshLambertMaterial(args);
    let geom = new THREE.SphereGeometry(0.1);
    let sphere = new THREE.Mesh(geom, mat);
    sphere.position.set(p.x, p.y, p.z);
    return sphere;
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
    renderer.setAnimationLoop( () => {
        renderer.render(scene, camera);
    });

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 10);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}



function initGUI() {
    var gui = new dat.GUI();
    var parentFolder = gui.addFolder('Parent');
    parentFolder.add(controls, 'xtransP', -20.0, 20.0).listen();
    parentFolder.add(controls, 'ytransP', -20.0, 20.0).listen();
    parentFolder.add(controls, 'zrotP', 0.0, 2.0 * Math.PI).listen();
    parentFolder.add(controls, 'xscaleP', 0.1, 4.0).listen();
    parentFolder.add(controls, 'yscaleP', 0.1, 4.0).listen();
    parentFolder.open();
    var childFolder = gui.addFolder('Child');
    childFolder.add(controls, 'xtransC', -20.0, 20.0).listen();
    childFolder.add(controls, 'ytransC', -20.0, 20.0).listen();
    childFolder.add(controls, 'zrotC', 0.0, 2.0 * Math.PI).listen();
    childFolder.add(controls, 'xscaleC', 0.1, 4.0).listen();
    childFolder.add(controls, 'yscaleC', 0.1, 4.0).listen();
    childFolder.open();
    gui.add(controls, 'Reset');
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
initGui();
addToDOM();

