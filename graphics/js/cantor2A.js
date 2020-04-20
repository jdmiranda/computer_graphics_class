/***********
 * cantor2A.js
 * M. Laszlo
 * 2D Cantor set with GUI
 * April 2020
 ***********/

 // Need to keep camera centered on center point

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let cantor;
let len = 10;
let materials;



function createScene() {
    nbrLevels = controls.nbrLevels;
    cantor = stackedCantor(controls.nbrLevels, len, controls.offset, controls.opacity);
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

function stackedCantor(levels, len=10, offset=1, opacity=1.0) {
    materials = [];
    root = new THREE.Object3D();
    for (let i = 0; i < levels; i++) {
        let color = new THREE.Color().setHSL(i/levels, 1, 0.5);
        let matArgs = {color: color, transparent: true, opacity: opacity};
        let mat = new THREE.MeshLambertMaterial(matArgs);
        materials.push(mat);
        let cantor = makeCantor(i, mat, len);
        cantor.position.y = i * offset;
        root.add(cantor);
    }
    return root;
}

function makeCantor(levels, mat, len=10) {
    if (levels == 0) {
        let geom = new THREE.BoxGeometry(len, 1, len);
        return new THREE.Mesh(geom, mat);
    }
    else {
        let cantor = makeCantor(levels-1, mat, len);
        let root = new THREE.Object3D();
        root.scale.set(1/3, 1, 1/3);
        for (x of [-len, len]) {
            for (z of [-len, len]) {
                let clone = cantor.clone();
                clone.position.set(x, 0, z);
                root.add(clone);
            }
        }
        return root;
    }
}




var controls = new function() {
    this.nbrLevels = 2;
    this.offset = 1.5;
    this.opacity = 1.0;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 1, 8).step(1).onChange(update);
    gui.add(controls, 'offset', 1, 2).step(0.1).onChange(updateOffset);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1).onChange(updateOpacity);
}

function update() {
    if (cantor)
        scene.remove(cantor);
    cantor = stackedCantor(controls.nbrLevels, len, controls.offset, controls.opacity);
    scene.add(cantor);
    updateCamera();
}

function updateOpacity() {
    let opacity = controls.opacity;
    for (let mat of materials) {
        mat.opacity = opacity;
    }
}

function updateCamera() {
    let n = controls.nbrLevels;
    let offset = controls.offset;
    camera.position.set(0, 2 * n * offset, 2 * n * offset);
    camera.lookAt(new THREE.Vector3(0, n/2 * offset, 0));
    camera.updateProjectionMatrix();
    cameraControls.target.set(0, n/2 * offset, 0);
    cameraControls.update();
}

function updateOffset() {
    let offset = controls.offset;
    let i = 0;
    for (let c of cantor.children) {
        c.position.y = i * offset;
        i += 1;
    }
    updateCamera();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    // mat.opacity = controls.opacity;
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
    let n = controls.nbrLevels;
    let offset = controls.offset;
//    camera.far = n * 1000; // Infinity; 
    camera.position.set(0, 2 * n * offset, 2 * n * offset);
    camera.lookAt(new THREE.Vector3(0, n/2 * offset, 0));
    camera.updateProjectionMatrix();

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, n/2 * offset, 0);
    cameraControls.update();



	// camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	// camera.position.set(0, 10, -10);
	// camera.lookAt(new THREE.Vector3(0, 0, 0));
	// cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
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


