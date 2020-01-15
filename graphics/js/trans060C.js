/***********
 * trans060C.js
 * Setting an Object3D's position, rotation, and scale properties
 *   transforms it in object coordinates thus: T.R.S(object).
 * In the 'object-based interpretation', we create the object centered 
 *   and aligned in object space, then scale it, then rotate it, and 
 *   then translate 
 * In the 'system-based interpretation', we translate, then rotate,
 *   then scale the higher-level coordinate system, and then create
 *   the object centered and aligned in this system.
 *
 *
 * M. Laszlo
 * February 2018
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
// manipulated by gui:
var redBox, redParent;

function createScene() {
    // geometry
    var geom = new THREE.CubeGeometry(1, 1, 1);
    var redMat = new THREE.MeshLambertMaterial( {color: 'red', transparent: true, opacity: 0.8})
    redBox = new THREE.Mesh(geom, redMat);
    redParent = new THREE.Object3D();
    redParent.add(redBox);

    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light); 
    scene.add(ambientLight);
    scene.add(redParent);
    // add axes to parent coordinate system
    // Coordinates.drawAllAxes({axisLength:2, axisRadius:0.05, scene:redParent});
    var axes = new THREE.AxesHelper(10);
    scene.add(axes);
    var axesC = new makeAxes({axisLength: 1});
    redParent.add(axesC);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}

var controls = new function() {
    this.Reset = function () {
        this.xtransP = this.ytransP = this.zrotP = 0.0;
        this.xscaleP = this.yscaleP = 1.0;
        this.xtransC = this.ytransC = this.zrotC = 0.0;
        this.xscaleC = this.yscaleC = 1.0;
    }
    this.Reset();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    redParent.position.x = controls.xtransP;
    redParent.position.y = controls.ytransP;
    redParent.rotation.z = controls.zrotP;
    redParent.scale.x = controls.xscaleP;
    redParent.scale.y = controls.yscaleP;
    redBox.position.x = controls.xtransC;
    redBox.position.y = controls.ytransC;
    redBox.rotation.z = controls.zrotC;
    redBox.scale.x = controls.xscaleC;
    redBox.scale.y = controls.yscaleC;
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

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

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
addToDOM();
render();
animate();

