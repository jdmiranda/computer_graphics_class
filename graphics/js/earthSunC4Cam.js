/***********
 * earthSunC4Cam.js
 * Earth revolves with markers
 *
 * M. Laszlo
 * November 2019
 ***********/


let camera, scene, renderer;
let cameraControls;
let useEarthCam;
let clock = new THREE.Clock();

let earth, revolvingEarth, orbitRad, earthRad;

let subject = new Subject();


function createScene() {
    earthRad = 2;
    earth = createEarth(earthRad, 0.25);
    orbitRad = 10;
    let rps = 0.02;
    revolvingEarth = revolveEarth(earth, orbitRad, rps);
    let orbit = createCircle(orbitRad, {color: 0xFFFFFF});
    let light = new THREE.PointLight(0xFFFFFF, 1.0);
    light.position.set(0, 0, 0);
    let ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(revolvingEarth);
    scene.add(orbit);
    scene.add(createSun());
    scene.add(createTether());
}

function revolveEarth(earth, orbit=10, rps=0.01, tilt=-23.5) {
    let root = new THREE.Object3D();
    root.add(earth);
    // tilt earth
    root.rotation.z = degreesToRadians(tilt);
    // revolve earth
    root.angle = 0;
    root.rps = rps;
    root.update = makeUpdateRevolution(orbit);
    subject.register(root);
    return root;
}

function createTether() {
    let geom = new THREE.Geometry();
    let a = new THREE.Vector3(0, 0, 0);
    let b = new THREE.Vector3(orbitRad, 0, 0);
    geom.vertices.push(a, b);
    args = {color: 0xff0000};
    let mat = new THREE.LineBasicMaterial(args);
    let line = new THREE.Line(geom, mat, THREE.LineStrip);
    line.update = function () {
        line.rotation.y = revolvingEarth.angle - Math.PI/2;
    }
    subject.register(line);
    return line;
}

// we put updateRevolution in scope of orbit since orbit is fixed.
// but keep rps a property of this since rps may change
function makeUpdateRevolution(orbit) {
    function updateRevolution(delta) {
        angle = this.angle;
        let deltaRadians = rpsToRadians(this.rps, delta);
        angle = this.angle + deltaRadians;
        angle %= 2 * Math.PI;
        this.angle = angle;
        this.position.z = orbit * Math.cos(angle);
        this.position.x = orbit * Math.sin(angle);
        }
    return updateRevolution;
}


// FOR GITHUB:
// USE 'assets/earth_4k.jpg'
// Otherwise: '../assets/earth_4k.jpg'
function createEarth(radius=2, rps=0.1, earthTexture='assets/earth_4k.jpg') {
    let geom = new THREE.SphereGeometry(radius, 48, 48);
    let texture = getTexture(earthTexture);
    let matArgs = {map: texture,  specular: 0xFF9999, shininess: 10};
    let mat = new THREE.MeshPhongMaterial(matArgs);
    let earth = new THREE.Mesh(geom, mat);
    // equator
    let eqargs = {color: 0xff0000};
    let eps = 0.001;
    let equator = createCircle(radius + eps, eqargs);
    earth.add(equator);
    // rotation line
    let lineArgs = {color: 0xff0000, linewidth: 4};
    earth.add(createLine(5, lineArgs));
    // behavior
    earth.rps = rps;
    earth.update = makeSpin(1);
    subject.register(earth);
    return earth;
}

function createSun(radius = 1, orbit = 10) {
    let geom = new THREE.SphereGeometry(radius, 48, 48);
    let args = {color: 0xfdb813, transparent: true, opacity: 0.8};
    let mat = new THREE.MeshBasicMaterial(args);
    let sun = new THREE.Mesh(geom, mat);
    return sun;
}

function createCircle(radius, matargs={}) {
    let mat = new THREE.LineBasicMaterial(matargs);
    let geom = new THREE.CircleGeometry(radius, 48);
    geom.vertices.shift();  // get rid of center vertex
    let circle = new THREE.LineLoop(geom, mat);
    circle.rotation.x = Math.PI / 2;
    return circle;
}

function createLine(len=5, matArgs={}) {
    let geom = new THREE.Geometry();
    let a = new THREE.Vector3(0, -len/2, 0);
    let b = new THREE.Vector3(0, len/2, 0);
    geom.vertices.push(a, b);
    let mat = new THREE.LineBasicMaterial(matArgs);
    return new THREE.Line(geom, mat, THREE.LineStrip);
}



function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
}


function getTexture(src) {
    let texture = new THREE.TextureLoader().load(src);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

let controls = new function() {
    let mat  = new THREE.LineBasicMaterial({ color: 0xffffff });
    this.earthCam = false;
    this.Go = function () {
        let p = markEarth(earth, orbitRad, earthRad);
        let args = {color: getRandomColor(0.5, 0.2, 0.6)};
        earth.add(createSphere(p, args));
    }
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'earthCam').onChange(switchCamera);
    gui.add(controls, 'Go');
}

function markEarth(earth, orbitRad, earthRad) {
    let earth_world_pos = earth.localToWorld(new THREE.Vector3(0, 0, 0));
    let s = 1 - (earthRad / orbitRad);
    let marker_world_pos = earth_world_pos.multiplyScalar(s);
    let marker_local_pos = earth.worldToLocal(marker_world_pos);
    return marker_local_pos;
}

function createSphere(p, args={}) {
    let mat = new THREE.MeshBasicMaterial(args);
    let geom = new THREE.SphereGeometry(0.1);
    let sphere = new THREE.Mesh(geom, mat);
    sphere.position.set(p.x, p.y, p.z);
    return sphere;
}


function render() {
    if (useEarthCam) {
        let earth_world_pos = earth.localToWorld(new THREE.Vector3(0, 0, 0));
        camera.lookAt(earth_world_pos);
        cameraControls.target = earth_world_pos;
    }
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
    renderer.setClearColor(0x0, 1.0);
    renderer.setAnimationLoop( () => {
        update();
        render();
    });

    camera = new THREE.PerspectiveCamera(40, canvasWidth/canvasHeight, 1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    switchCamera(false);
}

function switchCamera(earthCam=true) {
    if (earthCam) {
        useEarthCam = true;
        camera.position.set(0, 0, 0);
    } else {
        useEarthCam = false;
        camera.position.set(0, 0, 20);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        cameraControls.target = new THREE.Vector3(0, 0, 0);
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
addToDOM();


