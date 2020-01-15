/***********
 * latheC.js
 * M. Laszlo
 * November 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();


let maxNbrBands = 80;
let nbrBands = 0;
let initNbrBands = 4;
let shellRadius = 4;
let shellWidth = 1;
let segments = 96;
let minAngle = 0.004;
let maxAngle = 0.2;
let bands = new THREE.Object3D();


function createScene() {
    initializeShells();
    for (let i = 0; i < initNbrBands; i++) {
        addBand();
    }
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(bands);
}

// SHELLS
// initialize the shell data structure:
// Add a shell property to the bands placed into the scene. To delete, remove
// a random band from the scene, then add its shell number to the freeShell set. (Can we do this?)
// To add, remove a random shell number from freeShell set, create a new band, give it a shell property,
// and add it to the scene.

let freeShells;
let shellToRadius;

function initializeShells() {
    freeShells = new Set([...Array(maxNbrBands).keys()]);
    shellToRadius = makeShellToRadius(maxNbrBands, shellRadius, shellWidth);
}


function addBand() {
    if (freeShells.size > 0) {
        let shell = getRandomKey(freeShells);
        freeShells.delete(shell);
        let angle = getRandomFloat(minAngle, controls.angle);
        let band = createBand(shellToRadius(shell), angle, segments);
        band.shell = shell;
        bands.add(band);
        nbrBands += 1;
    }
}

function removeBand() {
    if (bands.children.length > 0) {
        let bandIndx = getRandomKey(bands.children);
        let band = bands.children[bandIndx];
        freeShells.add(band.shell);
        bands.remove(band);
        band.geometry.dispose();
        nbrBands -= 1;
    }
}


// returns a function that maps id to radius
// n is number of shells
// radius is of central shell
// width is thickness of shell body
function makeShellToRadius(n, radius, width) {
    let minRadius = radius - width / 2;
    let inc = width / (n - 1);
    return function(i) {
        return minRadius + i * inc;
    }
}

function getRandomKey(col) {
    let size = col.length ? col.length : col.size;
    let indx = Math.floor(Math.random() * size);
    let cntr = 0;
    for (let key of col.keys()) {
        if (cntr++ === indx) {
            return key;
        }
    }
}


function createBand(rad, angle, segments) {
    let geom = createSphericalBandGeometry(rad, angle, segments);
    let matArgs = {transparent: true, opacity: controls.opacity, color: getRandomColor(), side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let band = new THREE.Mesh(geom, mat);
    // rotate band
    let theta = Math.random() * 2 * Math.PI;
    let phi = Math.acos(2 * Math.random() - 1);
    band.rotation.x = theta;
    band.rotation.z = phi;
    return band;
}


function createSphericalBandGeometry(rad = 1, angle = Math.PI / 4, segments = 12, density = 20) {
    let h = 2 * angle / (density - 1);
    let points = [];
    for (let i = 0; i < density; i++) {
        let a = -angle + i * h;  // current angle
        let x = rad * Math.cos(a);
        let y = rad * Math.sin(a);
        let p = new THREE.Vector2(x, y);
        points.push(p);
    }
    return new THREE.LatheGeometry(points, segments);
}



var controls = new function() {
    this.nbrBands = initNbrBands;
    this.opacity = 0.8;
    this.angle = 0.08;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrBands', 1, maxNbrBands).step(1).onChange(updateBands);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1).name('opacity').onChange(updateOpacity);
    gui.add(controls, 'angle', minAngle, maxAngle);
}

function updateBands() {
    let n = controls.nbrBands;
    let delta = Math.abs(nbrBands - n);
    if (n < nbrBands) { // remove bands
        for (let i = 0; i < delta; i++) {
            removeBand();
        }
    } else if (n > nbrBands) { // add bands
        for (let i = 0; i < delta; i++) {
            addBand();
        }
    }
}


function updateOpacity() {
    let opacity = controls.opacity;
    bands.children.forEach (function (c) {
        let mat = c.material;
        mat.opacity = opacity;
    });
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
    camera.position.set(0, 1, 14);
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


