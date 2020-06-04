/***********
 * transparencyA.js
 * M. Laszlo
 * May 2020
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let sun;
let ambientLight, light;
let frontSidedMats, doubleSidedMats;
let meshes;
let opaque = -1; // -1 if none is opaque



function createScene() {    
    createMaterials();
    meshes = createMeshes(2, 2);

    let sunMat = new THREE.MeshBasicMaterial({color: 'yellow'});
    let sunGeom = new THREE.SphereGeometry(0.2, 12, 12);
    sun = new THREE.Mesh(sunGeom, sunMat);
    light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 0);
    sun.add(light);
    sun.translateZ(8);
    sun.translateY(2);
    ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(sun);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createMaterials() {
    let colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF,
                  0x00FFFF, 0x333333, 0xFFFFFF];
    let matArgs = {transparent: true, opacity: 1.0};
    matArgs['side'] = THREE.FrontSide;
    frontSidedMats = colors.map(function (c) {
                                    matArgs['color'] = c;
                                    return new THREE.MeshLambertMaterial(matArgs); 
                                });
    matArgs['side'] = THREE.DoubleSide;
    doubleSidedMats = colors.map(function (c) {
                                    matArgs['color'] = c;
                                    return new THREE.MeshLambertMaterial(matArgs); 
                                });

}

function createMeshes(len, offset) {
    let meshes = [];
    let geom = new THREE.BoxGeometry(len, len, len);
    let i = 0;
    for (let x of [-offset, offset]) {
        for (let y of [-offset, offset]) {
            for (let z of [-offset, offset]) {
                let mesh = new THREE.Mesh(geom, frontSidedMats[i]);
                mesh.position.set(x, y, z);
                scene.add(mesh);
                meshes.push(mesh);
                i++;
            }
        }
    }
    return meshes;
}

var controls = new function() {
    this.transx = 0.0;
    this.transy = 2.0;
    this.transz = 8.0;
    this.ambient = 0.2;
    this.spot = 1.0;
    this.opacity = 1.0;
    this.material = 'FrontSide';
    this.opaque = false;
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
	camera.position.set(0, 0, 14);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initGUI() {
    let gui = new dat.GUI();
    gui.add(controls, 'transx', -20.0, 20.0).step(0.5);
    gui.add(controls, 'transy', 0.0, 20.0).step(0.5);
    gui.add(controls, 'transz', -20.0, 20.0).step(0.5);
    gui.add(controls, 'ambient', 0.0, 1.0).name('ambient intensity').step(0.1).onChange(updateLight);
    gui.add(controls, 'spot', 0.0, 1.0).name('spot intensity').step(0.1).onChange(updateLight);
    gui.add(controls, 'opacity', 0.0, 1.0).onChange(update);
    let matTypes = ['FrontSide', 'DoubleSide'];
    gui.add(controls, 'material', matTypes).onChange(update);
    gui.add(controls, 'opaque').onChange(function (flag) {
        if (flag) opaque = getRandomInt(0, 8);
        else opaque = -1;
        console.log(opaque)
        update();
    });
}

function updateLight() {
    ambientLight.intensity = controls.ambient;
    light.intensity = controls.spot;
}

function update() {
    let mats = null;
    switch (controls.material) {
        case 'FrontSide': mats = frontSidedMats;
                          break;
        case 'DoubleSide': mats = doubleSidedMats;
                          break;
    }
    for (let i = 0; i < 8; i++) {
        let mesh = meshes[i];
        mesh.material = mats[i];
        mesh.material.opacity = controls.opacity;
        mesh.material.transparent = true;
        mesh.material.needsUpdate = true;
    }
    if (opaque >= 0) meshes[opaque].material.transparent = false;
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

