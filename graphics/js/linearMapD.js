/***********
 * linearMapD.js
 *
 * M. Laszlo
 * March 2020
 ***********/


let camera, scene, renderer;
let cameraControls, grids;

function createScene() {
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light); 
    scene.add(ambientLight);
    grids = createGrids('1,0,0', '0,1,0', '0,0,1');
    scene.add(grids);
}


function createGrids(basis1, basis2, basis3) {
    let root = new THREE.Object3D();
    let axes = new makeAxes({axisLength: 1});
    root.add(axes);

    let originalGrid = createGrid();
    root.add(originalGrid);

    let transformedGridColor = 0xff0000;
    let transformedGrid = createGrid(6, 6, transformedGridColor, transformedGridColor);

    // get Matrix4 from 3 column vectors
    let M = getMatrix([basis1, basis2, basis3]);

    transformedGrid.matrix.copy(M);
    transformedGrid.matrixAutoUpdate = false;
    root.add(transformedGrid);

    // markers for transformed basis vectors
    const zip = (a1, a2) => a1.map((k, i) => [k, a2[i]]);
    const basisVectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const basisColors = [0xff0000, 0x00ff00, 0x0000ff];
    zip(basisVectors, basisColors).forEach(([v,c]) => {
        let geom = new THREE.SphereGeometry(0.1, 10, 10);
        let matargs = {color: c};
        let mat = new THREE.MeshLambertMaterial(matargs);
        let sphere = new THREE.Mesh(geom, mat);
        let vec = new THREE.Vector3(v[0], v[1], v[2]);
        vec.applyMatrix4(M);
        sphere.position.set(vec.x, vec.y, vec.z);
        root.add(sphere);
    });
    return root;
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

// columns = ['v,v,v', 'v,v,v', 'v,v,v']
function getMatrix(columns) {
    let cols = columns.map((col) => col.split(',').map((val) => parseFloat(val)));
    let m = new THREE.Matrix4();
    // set takes vals in row-major order
    m.set(cols[0][0], cols[1][0], cols[2][0], 0,
          cols[0][1], cols[1][1], cols[2][1], 0,
          cols[0][2], cols[1][2], cols[2][2], 0,
          0, 0, 0, 1);
    return m;
}


let controls = new function () {
    this.basis1 = '1,0,0';
    this.basis2 = '0,1,0';
    this.basis3 = '0,0,1';
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'basis1');
    gui.add(controls, 'basis2');
    gui.add(controls, 'basis3');
    gui.add(controls, 'Go');
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

function update() {
    scene.remove(grids);
    grids = createGrids(controls.basis1, controls.basis2, controls.basis3);
    scene.add(grids);
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

