/***********
 * earthSunA.js
 * Earth rotates on its axis
 *
 * M. Laszlo
 * October 2019
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let earth;

let subject = new Subject();


function createScene() {
    earth = createEarth(2, 0.25);
    let orbitRad = 10;
    let rps = 1 / 60;
    let revolvingEarth = revolveEarth(earth, orbitRad, rps);
    let orbit = createCircle(orbitRad, {color: 0xFFFFFF});
    let light = new THREE.PointLight(0xFFFFFF, 1.0);
    light.position.set(0, 0, 0);
    let ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(revolvingEarth);
    scene.add(orbit);
    scene.add(createSun());
}

function revolveEarth(earth, orbit=10, rps=0.01, tilt=-23.44) {
    let root = new THREE.Object3D();
    root.add(earth);
    // tilt earth
    root.rotation.z = degreesToRadians(-23.5);
    // revolve earth
    root.angle = 0;
    root.rps = rps;
    root.update = makeUpdateRevolution(orbit);
    subject.register(root);
    return root;
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



function createEarth(radius=2, rps=0.1, earthTexture='../assets/earth_4k.jpg') {
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




function render() {
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
addToDOM();


