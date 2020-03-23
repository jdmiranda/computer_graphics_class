/***********
 * linearMapProgrammedA.js
 *
 * M. Laszlo
 * March 2020
 ***********/


let camera, scene, renderer;
let cameraControls, grids, currentGrid;

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
    // root.children[0] == axis markers
    // root.children[1] == originalGrid
    // root.children[2] == box, root.children[1][1] == transformedGrid
    let root = new THREE.Object3D();
    let axes = new makeAxes({axisLength: 1});
    root.add(axes);

    let originalGrid = createGrid();
    root.add(originalGrid);

    let transformedGridColor = 0xff0000;
    let transformedGrid = createGrid(6, 6, transformedGridColor, transformedGridColor);
    currentGrid = transformedGrid;

    // get Matrix4 from 3 column vectors
    let M = getMatrix([basis1, basis2, basis3]);
    let transformedObject3D = new THREE.Object3D();
    transformedObject3D.matrix.copy(M);
    transformedObject3D.matrixAutoUpdate = false;

    // determinant box
    let boxMatargs = {transparent: true, color: 0x1562c9, opacity: 0.8};
    let boxMat = new THREE.MeshLambertMaterial(boxMatargs);
    let boxGeom = new THREE.BoxGeometry(1, 1, 1);
    let box = new THREE.Mesh(boxGeom, boxMat);
    box.position.set(0.5, 0.5, 0.5);

    transformedObject3D.add(box);
    transformedObject3D.add(transformedGrid);
    root.add(transformedObject3D);

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
    this.mapTypes = 'identity';
    this.grid = true;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'basis1').listen();
    gui.add(controls, 'basis2').listen();
    gui.add(controls, 'basis3').listen();
    let mapTypes = ['identity','scale','reflection','rotation90','rotation45','shear','rotationA90','rotationA45','rotationA180','reflectionA', 'shearA45','shearB45'];
    gui.add(controls, 'mapTypes', mapTypes).onChange(updateMap);
    gui.add(controls, 'grid').name('show grid').onChange(toggleGrid);
    gui.add(controls, 'Go');
}

// https://www.wolframalpha.com/examples/mathematics/geometry/geometric-transformations/
function updateMap(mapType) {
    const maps = {
        'identity': ['1,0,0','0,1,0','0,0,1'],
        'scale': ['2,0,0','0,3,0','0,0,1'],
        'reflection': ['-1,0,0','0,1,0','0,0,1'],
        'rotation90': ['0,1,0','-1,0,0','0,0,1'],
        'rotation45': ['0.707,0.707,0','-0.707,0.707,0','0,0,1'],
        'shear': ['1,0,0','1,1,0','0,0,1'],
        'rotationA45': ['0.805,0.506,-0.311','-0.311,0.805,0.506','0.506,-0.311,0.805'],
        'rotationA90': ['0.333,0.911,0.-0.244','-0.244,0.333,0.911','0.911,-0.244,0.333'],
        // this correct
        'rotationA180': ['-0.333,0.667,0.667','0.667,-0.333,0.667','0.667,0.667,-0.333'],
        // reflect across x+y+z = 0
        'reflectionA': ['0.333,-0.667,-0.667','-0.667,0.333,-0.667','-0.667,-0.667,0.333'],
        // shear 45 degrees xy-plane
        'shearA45': ['1,0,0','0,1,0','0.448,0.894,1'],
        // shear 45 degrees x+y+z=0 plane
        'shearB45': ['0.592,0,0.408','-0.408,1,0.408','-0.408,0,1.408']
    };
    let map = maps[mapType];
    controls.basis1 = map[0];
    controls.basis2 = map[1];
    controls.basis3 = map[2];
    console.log(controls.basis3)
    update();
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

function toggleGrid(val) {
    let obj = grids.children[2];
    if (val) { // show grid
        if (!obj.children.includes(currentGrid))
            obj.add(currentGrid);
    } else { // hide grid
        if (obj.children.includes(currentGrid))
            obj.remove(currentGrid);
    }
}

function update() {
    scene.remove(grids);
    grids = createGrids(controls.basis1, controls.basis2, controls.basis3);
    scene.add(grids);
    toggleGrid(controls.grid);
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

