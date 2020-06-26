/***********
 * threeTorusReplBN.js
 * based on threeTorusAN.js
 * M. Laszlo
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';



// https://en.wikipedia.org/wiki/Torus#n-dimensional_torus
// https://en.wikipedia.org/wiki/3-manifold#3-torus

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();


let spaceSize = new THREE.Vector3(40, 40, 40);
let theObject;
let theObjectDiameter = 3.47;  // sqrt(12) diagonal of 2x2x2 cube
let cube; // , circle, manatee;
let nbrRepls = 10;
let walls;


function createScene() {

    let geom = new THREE.BoxGeometry(theObjectDiameter, theObjectDiameter, theObjectDiameter);
    let matArgs = {color: 0x77ceeb, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    cube = new THREE.Mesh(geom, mat);

    theObject = makeReplObjects(cube, spaceSize);
//    theObject.position.set(spaceSize.x/2, spaceSize.y/2, spaceSize.z/2);
    scene.add(theObject);

    walls = makeWalls(spaceSize);
    scene.add(walls);

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 0.2, 1000 );
    light2.position.set(10, 20, -20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function makeWalls(spaceSize) {
    let geom = new THREE.BoxGeometry(spaceSize.x, spaceSize.y, spaceSize.z);
    let matArgs = {color: 0xc0c0c0, transparent: true, opacity: 0.3, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let walls = new THREE.Mesh(geom, mat);
    return walls;
}

let xLimit = (spaceSize.x + theObjectDiameter) / 2;
let yLimit = (spaceSize.y + theObjectDiameter) / 2;
let zLimit = (spaceSize.z + theObjectDiameter) / 2;

function centerOnFloor() {
    let worldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (worldPos.x < -xLimit) theObject.translateX(spaceSize.x);
    else if (worldPos.x > xLimit) theObject.translateX(-spaceSize.x);
    if (worldPos.y < -yLimit) theObject.translateY(spaceSize.y);
    else if (worldPos.y > yLimit) theObject.translateY(-spaceSize.y);
    if (worldPos.z < -zLimit) theObject.translateZ(spaceSize.z);
    else if (worldPos.z > zLimit) theObject.translateZ(-spaceSize.z);
}


// NEED TO FIX THIS
// ALSO ADD FOG
// AND ADD MULTICOLORED BOX AND SPHERE (BEACHBALL) AND TEAPOT
// try centering the space by translating theObject
let lastWorldPos = new THREE.Vector3(0, 0, 0);

function centerObject() {
    let cameraWorldPos = camera.getWorldPosition(new THREE.Vector3());
    // v = cameraWorldPos - lastWorldPos;
    let v = cameraWorldPos.clone();
    v = v.sub(lastWorldPos);
// console.log(cameraWorldPos, v)
    if (v.x < -xLimit) theObject.translateX(-spaceSize.x);
    else if (v.x > xLimit) theObject.translateX(spaceSize.x);
    if (v.y < -yLimit) theObject.translateY(-spaceSize.y);
    else if (v.y > yLimit) theObject.translateY(spaceSize.y);
    if (v.z < -zLimit) theObject.translateZ(-spaceSize.z);
    else if (v.z > zLimit) theObject.translateZ(spaceSize.z);
    let newWorldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (!newWorldPos.equals(lastWorldPos))
        lastWorldPos = newWorldPos;
}

// when we call firstPersonControls.lookAt(x,y,z) it updates
// camera's target. So we need to determine the point we look at
// when translation gets performed. Maybe it's really the 
// control that we're centering: centerOnControl()
function centerOnCamera() {
    let cameraWorldPos = camera.position;
    let cameraLookingDirection = camera.getWorldDirection(new THREE.Vector3());
    // target is sum of these
    let target = cameraWorldPos.clone();
    target.add(cameraLookingDirection);
    // camera.position is in world space already
    // let worldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (cameraWorldPos.x < -xLimit) 
        target.setComponent(0, target.x + spaceSize.x);
    else if (cameraWorldPos.x > xLimit)
        target.setComponent(0, target.x - spaceSize.x);
    else if (cameraWorldPos.y < -yLimit)
        target.setComponent(1, target.y + spaceSize.y);
    else if (cameraWorldPos.y > yLimit)
        target.setComponent(1, target.y - spaceSize.y);
    if (cameraWorldPos.z < -zLimit) 
        target.setComponent(2, target.z + spaceSize.z);
    else if (cameraWorldPos.z > zLimit)
        target.setComponent(2, target.z - spaceSize.z);
    cameraControls.lookAt(target);
}

// center replicates at origin
function makeReplObjects(object, spaceSize, nbrRepls=11) {
    if (nbrRepls % 2 === 0) nbrRepls += 1;
    let root = new THREE.Object3D();
    let maxXYXs = ((nbrRepls-1) / 2);
    for (let x of MyUtils.linspace(-maxXYXs * spaceSize.x, maxXYXs * spaceSize.x, nbrRepls)) {
        for (let y of MyUtils.linspace(-maxXYXs * spaceSize.y, maxXYXs * spaceSize.y, nbrRepls)) {
            for (let z of MyUtils.linspace(-maxXYXs * spaceSize.z, maxXYXs * spaceSize.z, nbrRepls)) {
                let obj = object.clone();
                obj.position.set(x, y, z);
                root.add(obj); 
            }
        }
    }
    subject.register(root);
    root.update = moveReplObjects;
    root.userData.pps = new THREE.Vector3(controls.xps, controls.yps, controls.zps);
    return root;
}


function moveReplObjects(delta) {
    let pps = this.userData.pps;
    let dx = pps.x * delta;
    let dy = pps.y * delta;
    let dz = pps.z * delta;
    this.translateX(dx);
    this.translateY(dy);
    this.translateZ(dz);
}

var controls = new function() {
    // this.type = 'square';
    this.xps = 0;
    this.yps = 0;
    this.zps = 0;
    this.box = true;
}

function initGui() {
    var gui = new dat.GUI();
    // let objectTypes =  ['square', 'circle', 'manatee'];
    // gui.add(controls, 'type', objectTypes).onChange(updateObject);
    gui.add(controls, 'xps', -2.0, 2.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'yps', -2.0, 2.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'zps', -2.0, 2.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'box').name('walls').onChange(updateWalls);
}

function updateObject(objectType) {
    if (theObject)
        scene.remove(theObject);
    switch (objectType) {
        case 'circle':  theObject = makeFourObjects(circle, spaceSize);
                        break;
        case 'square':  theObject = makeFourObjects(square, spaceSize);
                        break;
        case 'manatee':  theObject = makeFourObjects(manatee, spaceSize);
                        break;
    }
    scene.add(theObject);
}

function updateWalls(flag) {
    scene.remove(walls);
    if (flag) scene.add(walls);
}

function updateVelocity() {
    let xps = controls.xps;
    let yps = controls.yps;
    let zps = controls.zps;
    theObject.userData.pps.set(xps, yps, zps);
}


function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.setAnimationLoop(function () {
        let delta = clock.getDelta();
        subject.notify(delta);
        cameraControls.update(delta);
//        centerOnCamera();
        centerObject();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 14);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new FirstPersonControls(camera, renderer.domElement);
    cameraControls.lookSpeed = 0.02;
    cameraControls.movementSpeed = 3;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


