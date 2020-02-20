/***********
 * Experiments with tweens
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let redBox, axes, secondRedBox, secondMat;

function createScene() {
    let geom = new THREE.CubeGeometry(1, 1, 1);
    let args =  {color: 'red', transparent: true, opacity: 0.8};
    let mat = new THREE.MeshLambertMaterial(args);
    args.opacity = 0.0;
    secondMat = new THREE.MeshLambertMaterial(args);
    let thirtyDegs = Math.PI / 6;
    
    // red box
    redBox = new THREE.Mesh(geom, mat);
    secondRedBox = new THREE.Mesh(geom, secondMat);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(redBox);
    axes = makeAxes({axisLength: 1});
    axes.add(secondRedBox);

    scene.add(new THREE.AxesHelper(10));
}



function animate() {
	window.requestAnimationFrame(animate);
    TWEEN.update();
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


function Controls() {
    this.ObjectView = makeUpdate(redBox);
    this.SystemView = makeUpdate(axes);
}

function makeUpdate(obj) {
    return function () {
        scene.remove(redBox);
        scene.remove(axes);
        scene.add(obj);
        runTween(obj);
    }
}

function initGui() {
    controls = new Controls();
    var gui = new dat.GUI();
    gui.add(controls, 'ObjectView');
    gui.add(controls, 'SystemView');
}

function runTween(obj) {
    obj.scale.set(1, 1, 1);
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0, 0);
    secondMat.opacity = 0.0;
    let scale_tween = new TWEEN.Tween(obj.scale)
        .to({x: 3}, 1000);
    let translate_tween = new TWEEN.Tween(obj.position)
        .to({x: 4}, 1000);
    let rotation_tween = new TWEEN.Tween(obj.rotation)
        .to({z: Math.PI / 6});
    let visibility_tween = new TWEEN.Tween(secondMat)
        .to({opacity: 1.0}, 1000);
    // scale_tween.chain(translate_tween);
    // translate_tween.chain(rotation_tween);
    if (obj === axes) {
        translate_tween.chain(rotation_tween);
        rotation_tween.chain(scale_tween);
        scale_tween.chain(visibility_tween);
        translate_tween.start();
    } else {
        scale_tween.chain(rotation_tween);
        rotation_tween.chain(translate_tween);
        scale_tween.start();
    }
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
// initTween(axes);
addToDOM();
render();
animate();

