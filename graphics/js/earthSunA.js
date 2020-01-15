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
    earth = createEarth(3, 0.2);
    let light = new THREE.PointLight(0xFFFFFF, 1.0);
    light.position.set(10, 0, 0);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(ambientLight);
    scene.add(earth);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);

}


// HAD BEEN '../assets/earth_4k.jpg'
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
    // behavior
    earth.rps = rps;
    earth.update = spinY;
    subject.register(earth);
    return earth;
}

function createCircle(radius, matargs={}) {
    let mat = new THREE.LineBasicMaterial(matargs);
    let geom = new THREE.CircleGeometry(radius, 48);
    geom.vertices.shift();  // get rid of center vertex
    let circle = new THREE.LineLoop(geom, mat);
    circle.rotation.x = Math.PI / 2;
    return circle;
}


let spinY = makeSpin(1);



function createLine(len = 5, color = 0xff0000) {
    var geom = new THREE.Geometry();
    var a = new THREE.Vector3(0, -len/2, 0);
    var b = new THREE.Vector3(0, len/2, 0);
    geom.vertices.push(a, b);
    var args = {color: color, linewidth: 4};
    var mat = new THREE.LineBasicMaterial(args);
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


