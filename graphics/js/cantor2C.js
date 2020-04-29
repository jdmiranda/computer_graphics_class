/***********
 * cantor2C.js
 * M. Laszlo
 * 2D Cantor / Sierpinski carpet with GUI
 * April 2020
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let cantor;
let len = 16;
let mat;



function createScene() {
    let nbrLevels = controls.nbrLevels;
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity};
    mat = new THREE.MeshLambertMaterial(matArgs);
    cantor = makeCantor(retainCantor, nbrLevels, mat, len);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(makeFloor());
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(cantor);
}

function makeFloor() {
    let color = new THREE.Color(0x333333);
    let matArgs = {color: color, transparent: true, opacity: 0.8};
    let mat = new THREE.MeshBasicMaterial(matArgs);
    let geom = new THREE.BoxGeometry(40, 1, 40);
    let floor = new THREE.Mesh(geom, mat);
    floor.position.y = -1.5;
    return floor;
}



function makeCantor(retainF, levels, mat, len=10) {
    if (levels == 0) {
        let geom = new THREE.BoxGeometry(len, 1, len);
        return new THREE.Mesh(geom, mat);
    }
    else {
        let cantor = makeCantor(retainF, levels-1, mat, len);
        let root = new THREE.Object3D();
        root.scale.set(1/3, 1, 1/3);
        for (x of [-len, 0, len]) {
            for (z of [-len, 0, len]) {
                if (retainF(x, z, len)) {
                    let clone = cantor.clone();
                    clone.position.set(x, 0, z);
                    root.add(clone);
                }
            }
        }
        return root;
    }
}

// cantor
function retainCantor(x, z, len) {
    return (Math.abs(x) + Math.abs(z)) > len;
}

// sierpinski carpet
function retainSierpinskiCarpet(x, z, len) {
    return (Math.abs(x) + Math.abs(z)) > 0;
}


var controls = new function() {
    this.nbrLevels = 2;
    this.opacity = 1.0;
    this.color = '#3366ff';
    this.type = '2D Cantor';
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 5).step(1).onChange(update);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1);
    gui.addColor(controls, 'color');
    let objectTypes = ['2D Cantor', 'Sierpinski carpet'];
    gui.add(controls, 'type', objectTypes).onChange(update);
}

function update() {
    if (cantor)
        scene.remove(cantor);
    let f = controls.type === 'Sierpinski carpet' ? retainSierpinskiCarpet : retainCantor;
    cantor = makeCantor(f, controls.nbrLevels, mat, len);    
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
    camera.position.set(0, 24, 30);
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


