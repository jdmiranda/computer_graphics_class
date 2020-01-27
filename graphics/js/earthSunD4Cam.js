/***********
 * earthSunD4Cam.js
 * Earth revolves with markers
 *
 * M. Laszlo
 * November 2019
 ***********/


let camera, scene, renderer;

let cameraControls;

let clock = new THREE.Clock();

let earth, revolvingEarth, orbitRad, earthRad, spiral;
let revolutionRps = 1.0 / 60;
let rotationRps = 10 * revolutionRps;

let subject = new Subject();


function createScene() {
    earthRad = 2;
    earth = createEarth(earthRad, rotationRps);
    orbitRad = 10;
    revolvingEarth = revolveEarth(earth, orbitRad, revolutionRps, 23.5);
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
    spiral = createSpiral(earth, orbitRad, earthRad, {color: 0x00ff00});
    earth.add(spiral);
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



function createEarth(radius=2, rps=0.1, earthTexture='../assets/earth_4k.jpg') {
    let geom = new THREE.SphereGeometry(radius, 48, 48);
    let texture = getTexture(earthTexture);
    let matArgs = {map: texture,  specular: 0xFF9999, shininess: 10};
    let mat = new THREE.MeshPhongMaterial(matArgs);
    let earth = new THREE.Mesh(geom, mat);
    // equator
    let eqargs = {color: 0xff0000};
    let eps = 0.0001;
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
    let geom = new THREE.CircleGeometry(radius, 96);
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
    this.tilt = 23.5;
    this.dpy = 10;
    this.earthDay = false;
    this.earthCam = false;
}

function updateModel() {
    let rps = (controls.dpy + 1) * revolutionRps;
    if (controls.earthDay) rps = 366.25 * revolutionRps;
    let tilt = controls.tilt;
    earth.rps = rps;
    revolvingEarth.rotation.z = degreesToRadians(tilt);
    earth.remove(spiral);
    spiral.geometry.dispose();
    let matArgs = {color: 0x00ff00};
    if (controls.dpy < 5)
        spiral = createSpiral(earth, orbitRad, earthRad, matArgs, 4000);
    else if (controls.earthDay)
        spiral = createSpiral(earth, orbitRad, earthRad, matArgs, 1000, 0.1);
    else
        spiral = createSpiral(earth, orbitRad, earthRad, matArgs, 1000, 0.01);
    earth.add(spiral);
}



function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'tilt', 0, 90).step(0.5).name('Inclination').onChange(updateModel);
    // days per year
    gui.add(controls, 'dpy', 0, 40).step(1).name('Days per year').onChange(updateModel);
    gui.add(controls, 'earthDay').name('365 days per year').onChange(updateModel);
    gui.add(controls, 'earthCam').onChange(switchCamera);
}

// should pass earth as argument too
function markEarth(earth, orbitRad, earthRad) {
    let earth_world_pos = earth.localToWorld(new THREE.Vector3(0, 0, 0));
    let s = 1 - (earthRad / orbitRad);
    let marker_world_pos = earth_world_pos.multiplyScalar(s);
    let marker_local_pos = earth.worldToLocal(marker_world_pos);
    return marker_local_pos;
}

function createSpiral2(earth, orbitRad, earthRad, matArgs={}, maxPoints=1000, eps=0.01) {
    let geom = new THREE.Geometry();
    let mat = new THREE.LineBasicMaterial(matArgs);
    let spiral = new THREE.LineLoop(geom, mat, THREE.LineStrip);
    let indx = 0;
    geom.verticesNeedUpdate = true;
    geom.elementsNeedUpdate = true;
    function updateSpiral(delta) {
        let p = markEarth(earth, orbitRad, earthRad + eps);
        if (geom.vertices.length < maxPoints) {
            geom.vertices.push(p);
            indx += 1;
        } else {
            indx %= maxPoints;
            geom.vertices[indx] = p;
            indx += 1;
        }
        geom.verticesNeedUpdate = true;
        geom.elementsNeedUpdate = true;
    }
    spiral.update = updateSpiral;
    subject.register(spiral);
    return spiral;
}

function createSpiral(earth, orbitRad, earthRad, matArgs={}, maxPoints=1000, eps=0.01) {
    let geom = new THREE.BufferGeometry();
    let positions = new Float32Array(maxPoints * 3);
    geom.attributes.position = new THREE.BufferAttribute(positions, 3);
//    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    let drawCount = 0;
    let mat = new THREE.LineBasicMaterial(matArgs);
    let spiral = new THREE.LineLoop(geom, mat, THREE.LineStrip);
    let indx = 0;
    function updateSpiral(delta) {
        let p = markEarth(earth, orbitRad, earthRad + eps);
        if (drawCount < maxPoints) {
            positions[indx++] = p.x;
            positions[indx++] = p.y;
            positions[indx++] = p.z;
            drawCount += 1;
            geom.setDrawRange(0, drawCount);
        } else {
            indx %= maxPoints * 3;
            positions[indx++] = p.x;
            positions[indx++] = p.y;
            positions[indx++] = p.z;
        }
        geom.attributes.position.needsUpdate = true;
    }
    spiral.update = updateSpiral;
    subject.register(spiral);
    return spiral;
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


