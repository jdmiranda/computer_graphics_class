/***********
 * linearBandSphereC.js
 *
 * M. Laszlo
 * March 2020
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();
let bandSphere;

function createScene() {
    let bandArgs = {n: 40, minTheta: Math.PI/800, maxTheta: Math.PI/50, rad: 4, segments: 96, density: 10};
    let matArgs = {transparent: true, opacity: 0.8, color: getRandomColor()};
    bandArgs.material = new THREE.MeshLambertMaterial(matArgs);
    bandSphere = createBandedSphere(bandArgs);
    scene.add(bandSphere);

    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light2.position.set(0, 10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light); 
    scene.add(light2);
    scene.add(ambientLight);
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
    this.Go = updateMap;
    this.rpsA = 0.0;
    this.rpsB = 0.0;
    this.rpsZA = 0.0;
    this.rpsZB = 0.0;
    this.Reset = reset;
}

function initGui() {
    let gui = new dat.GUI();
    let mapFolder = gui.addFolder('Map');
    mapFolder.add(controls, 'basis1').listen();
    mapFolder.add(controls, 'basis2').listen();
    mapFolder.add(controls, 'basis3').listen();
    mapFolder.add(controls, 'Go');
    mapFolder.open();
    let animFolder = gui.addFolder('Animation');
    animFolder.add(controls, 'rpsA', -0.01, 0.01).step(0.001).listen().onChange(updateBands);
    animFolder.add(controls, 'rpsB', -0.001, 0.001).step(0.0002).listen().onChange(updateBands);
    animFolder.add(controls, 'rpsZA', -0.01, 0.01).step(0.001).listen().onChange(updateBands);
    animFolder.add(controls, 'rpsZB', -0.001, 0.001).step(0.0002).listen().onChange(updateBands);
    animFolder.add(controls, 'Reset');
    animFolder.open();
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
        update();
        renderer.render(scene, camera);
    });

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 10);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function updateMap() {
    let M = getMatrix([controls.basis1, controls.basis2, controls.basis3]);
    if (M.determinant() == 0.0) {
        // restore identity matrix if M is singular
        M = new THREE.Matrix4();
        controls.basis1 = '1,0,0';
        controls.basis2 = '0,1,0';
        controls.basis3 = '0,0,1';
    }
    bandSphere.matrix.copy(M);
    bandSphere.matrixAutoUpdate = false;
}


function reset() {
    controls.rpsA = controls.rpsB = 0.0;
    controls.rpsZA = controls.rpsZB = 0.0;
    if (bandSphere) {
        bandSphere.children.forEach(function (band) {
            band.geometry.dispose();
        });
        scene.remove(bandSphere);
        bansSphere = null;
    }
    let bandArgs = {n: 40, minTheta: Math.PI/800, maxTheta: Math.PI/50, rad: 4, segments: 96, density: 10};
    let matArgs = {transparent: true, opacity: 0.8, color: getRandomColor()};
    bandArgs.material = new THREE.MeshLambertMaterial(matArgs);
    bandSphere = createBandedSphere(bandArgs);
    updateMap();
    scene.add(bandSphere);
    updateBands();
}

function updateBands() {
    let rpsA = controls.rpsA;
    let rpsB = controls.rpsB;
    let rpsZA = controls.rpsZA;
    let rpsZB = controls.rpsZB;
    moveChildren(bandSphere, makeArithRotator(0, rpsA, rpsB), makeArithRotator(2, rpsZA, rpsZB, "rpsz"));
}

function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
}


// BAND GEOMETRY FUNCTIONS
function createSphericalBandGeometry(rad = 1, theta = Math.PI / 4, segments = 96, density = 10) {
    // density is number of points
    // generate points
    let h = 2 * theta / (density - 1);
    let points = [];
    for (let i = 0; i < density; i++) {
        let a = -theta + i * h;  // current angle
        let x = rad * Math.cos(a);
        let y = rad * Math.sin(a);
        let p = new THREE.Vector2(x, y);
        points.push(p);
    }
    return new THREE.LatheGeometry(points, segments);
}




function createBandedSphere({
    n = 100,
    minTheta = 0.0001,
    maxTheta = Math.PI / 4,
    ...rest
}) {
    let root = new THREE.Object3D();
    let epsilon = rest.rad * 0.1;
    let lowerRad = rest.rad - epsilon;
    let h = (2 * epsilon) / n;
    let material = rest.material;
    for (let i = 0; i < n; i++) {
        rest.rad = lowerRad + i * h;
        rest.theta = getRandomFloat(minTheta, maxTheta);
        let mat = material.clone();
        mat.color = getRandomColor();
        rest.material = mat;
        let band = createSphericalBand(rest);
        // let theta = Math.random() * 2 * Math.PI;
        // let phi = Math.acos(2 * Math.random() - 1);
        // band.rotation.x = theta;
        band.rotation.x = 0;
        // band.rotation.z = phi;
        band.rotation.z = 0;
        root.add(band);
    }
    return root;
}


function createSphericalBand({
    rad = 1,
    theta = Math.PI / 4,
    segments = 96,
    density = 100,
    material = new THREE.MeshBasicMaterial() 
}) {
    let geom = createSphericalBandGeometry(rad, theta, segments, density);
    let mat = material.clone();
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh(geom, mat);

}

function sequence(...fncs) {
    return function(delta) { fncs.forEach(g => g.call(this, delta)) };
}


function moveChildren(root, ...fncs) {
    let children = root.children;
    children.forEach(function (child, i, children) {
        let animFncs = fncs.map(g => g(child, i, children));
        child.update = sequence(...animFncs);
        subject.register(child);
    });
}

function makeArithRotator(indx, rpsA, rpsB, rps="rps") {
    let spin = makeSpin(indx, rps);
    return function(child, i) {
        child[rps] = rpsA + rpsB * i;
        return spin;
    }
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

