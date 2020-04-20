/***********
 * spongeA.js
 * M. Laszlo
 * Sierpinski sponge with GUI
 * October 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let cantor, mat, nbrLevels;
let offset = 5;



function createScene() {
    let matArgs = {color: 'blue', transparent: true, opacity: 1.0};
    mat = new THREE.MeshLambertMaterial(matArgs);
    nbrLevels = controls.nbrLevels;
    cantor = makeCantor(controls.nbrLevels, offset);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(cantor);
}

function makeCantor(nbrLevels, offset) {
    let len = 10;
    let root = new THREE.Object3D();
    let last = null;
    for (let i = 0; i < nbrLevels; i++) {
        let node = new THREE.Object3D();
        if (i == 0) {
            let geom = new THREE.CylinderGeometry(1, 1, len, 12);
            let cantor = new THREE.Mesh(geom, mat);
            cantor.rotation.z = 1.5708;
            node.add(cantor);
        } else {
            node.scale.x = 1/3;
            for (x of [-len, len]) {
                let cantor = last.clone();
                let z = offset;
                cantor.position.set(x, 0, z);
                node.add(cantor);
            }
        }
        last = node;
        root.add(node);
    }
    return root;
}






var controls = new function() {
    this.nbrLevels = 2;
    this.color = '#0000ff';
    this.opacity = 1.0;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 1, 8).step(1).onChange(update);
    gui.addColor(controls, 'color');
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1);
}

function update() {
    if (cantor)
        scene.remove(cantor);
    cantor = makeCantor(controls.nbrLevels, offset);
    scene.add(cantor);
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    mat.color = new THREE.Color(controls.color);
    mat.opacity = controls.opacity;
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
    renderer.setAnimationLoop(function () {
        render();
    });

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 10, -10);
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
initGui();
addToDOM();


