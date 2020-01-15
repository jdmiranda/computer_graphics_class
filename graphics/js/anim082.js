/***********
 * anim072.js
 * Rotating box
 * Box rotates around a circle of radius 5 in the xy-plane
 *   while rotating on its own axis.
 *
 * M. Laszlo
 * April 2014
 ***********/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var box, boxGroup;
var innerCurAngle = outerCurAngle = 0;	
var innerAngleStep = 2*Math.PI;  	// rotation per second 
var outerAngleStep = Math.PI/8;  	// revolution per second


function createScene() {
    var mat = new THREE.MeshLambertMaterial({color: 'blue'});
    var geom = new THREE.CubeGeometry(3, 1, 1);
    box = new THREE.Mesh(geom, mat);
    box.translateX(5);
    boxGroup = new THREE.Object3D();
    boxGroup.add(box);

	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(light);
	scene.add(ambientLight);
	scene.add(boxGroup);

    var circleMat = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.4});
    circleMat.side = THREE.DoubleSide;
    var circleGeom = new THREE.CircleGeometry(5, 48);
    scene.add(new THREE.Mesh(circleGeom, circleMat));
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
	var delta = clock.getDelta();
    // update inner rotation angle
	innerCurAngle += (innerAngleStep * delta);
    if (innerCurAngle >= 2*Math.PI)
        innerCurAngle -= 2*Math.PI;
	box.rotation.z = innerCurAngle;
    // update outer revolution angle
	outerCurAngle += (outerAngleStep * delta);
    if (outerCurAngle >= 2*Math.PI)
        outerCurAngle -= 2*Math.PI;
	boxGroup.rotation.z = outerCurAngle;

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
	renderer.setClearColor(0x0, 1.0);

	camera = new THREE.PerspectiveCamera(40, canvasWidth/canvasHeight, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function showGrids() {
    Coordinates.drawAllAxes({axisLength:11, axisRadius:0.05});
} 


function addToDOM() {
    	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}


try {
	init();
    showGrids();
	createScene();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
