/***********
 * cornerConnected.js
 * based on posSnowflakeD.js
 * M. Laszlo
 * See Alt. Fractals
 * May 2020
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let fractal;
let len = 1;
let maxNbrLevels = 4;
let mat;
let tetraGeom, boxGeom, octGeom;
let randomMats = null;


function createScene() {
    let nbrLevels = controls.nbrLevels;
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide};
    mat = new THREE.MeshLambertMaterial(matArgs);
    tetraGeom = new THREE.TetrahedronGeometry(len);
    boxGeom = new THREE.BoxGeometry(len, len, len);
    octGeom = new THREE.OctahedronGeometry(len);
    icosGeom = new THREE.IcosahedronGeometry(len);
    fractal = makeCornerConnected(2, tetraGeom, mat, 0.5);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 0.2, 1000 );
    light2.position.set(10, 20, -20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(fractal);
}

function makeCornerConnected(level, geom, matOrMats, scale=0.5) {
    let mat = matOrMats instanceof THREE.MeshLambertMaterial ? matOrMats : matOrMats[level];
    let base = new THREE.Mesh(geom, mat);
    if (level > 0) {
        // for each vertex v, reflect geometry across v
        // in a scaled coordinate system
        let vertices = geom.vertices;     
        for (let v of vertices) {
            let newGeom = geom.clone();
            // add vertices to new geometry: v + scale * (v - w)
            newGeom.vertices.length = 0;
            for (let w of vertices) {
                let wp = v.clone();
                wp.sub(w);
                wp.multiplyScalar(scale);
                wp.add(v);
                newGeom.vertices.push(wp);
            }
            newGeom.computeFlatVertexNormals();
            let newFractal = makeCornerConnected(level-1, newGeom, matOrMats, scale);
            base.add(newFractal);
        }   
    }
    return base;
}




var controls = new function() {
    this.nbrLevels = 2;
    this.opacity = 1.0;
    this.color = '#3366ff';
    this.scale = 0.5;
    this.shape = 'Tetrahedron';
    this.randomColor = false;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, maxNbrLevels).step(1).onChange(update);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1).onChange(updateOpacity);
    gui.add(controls, 'scale', 0.1, 0.9).step(0.1).onChange(update);
    gui.addColor(controls, 'color');
    let objectTypes =  ['Tetrahedron', 'Box', 'Octahedron'];
    let typeItem = gui.add(controls, 'shape', objectTypes);
    typeItem.onChange(update);
    gui.add(controls, 'randomColor').onChange(updateColor);
}

function updateColor(flag) {
    if (flag) { // make new random colors
        let matArgs = {transparent: true, opacity: controls.opacity, side: THREE.DoubleSide};
        randomMats = [];
        for (let i = 0; i < maxNbrLevels+1; i++) {
            let mat = new THREE.MeshLambertMaterial(matArgs);
            mat.color = getRandomBrightColor();
            randomMats.push(mat);
        }
    }
    update();
}


function update() {
    if (fractal)
        scene.remove(fractal);
    let geom = null;
    switch (controls.shape) {
        case 'Tetrahedron':  geom = tetraGeom;
                        break;
        case 'Box':   geom = boxGeom;
                        break;
        case 'Octahedron': geom = octGeom;
                        break;
    }
    let matOrMats = controls.randomColor ? randomMats : mat;
    fractal = makeCornerConnected(controls.nbrLevels, geom, matOrMats, controls.scale);
    scene.add(fractal);
}

function updateOpacity() {
    let opacity = controls.opacity;
    mat.opacity = opacity;
    for (let m of randomMats)
        m.opacity = opacity;
}



function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    mat.color = new THREE.Color(controls.color);
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

    camera = new THREE.PerspectiveCamera(45, canvasRatio, 0.01, 1000);
    camera.position.set(0, 0, 6);
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


