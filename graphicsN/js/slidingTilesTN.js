/***********
 * slidingTilesTN.js
 * M. Laszlo
 * See Alt. Fractals
 * May 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();


let spaceSize = new THREE.Vector2(10, 10);
let theObject;
let theObjectDiameter = 2.84;  // 2 * sqrt(2)
let square, circle, manatee;
let clippingPlanes;


function createScene() {

    let geom = new THREE.PlaneGeometry(theObjectDiameter, theObjectDiameter);
    let matArgs = {color: 0xff0000, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    square = new THREE.Mesh(geom, mat);
    matArgs.color = new THREE.Color(0x27aeab);
    mat = new THREE.MeshLambertMaterial(matArgs);
    geom = new THREE.CircleGeometry(theObjectDiameter / 2, 30);
    circle = new THREE.Mesh(geom, mat);
    let filename = './assets/manatee.png';
    let texture = new THREE.TextureLoader().load(filename);
    matArgs = {map: texture};
    mat = new THREE.MeshLambertMaterial(matArgs);
    manatee = new THREE.Mesh(square.geometry, mat);

    theObject = makeFourObjects(square, spaceSize);
    theObject.position.set(4, 4, 0);
    scene.add(theObject);

    scene.add(makeFloor(spaceSize));

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function makeFloor(spaceSize) {
    let geom = new THREE.PlaneGeometry(spaceSize.x, spaceSize.y);
    let matArgs = {color: 0xc0c0c0};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let floor = new THREE.Mesh(geom, mat);
    floor.translateZ(-0.01);
    return floor;
}

let xLimit = (spaceSize.x + theObjectDiameter) / 2;
let yLimit = (spaceSize.y + theObjectDiameter) / 2;

function centerOnFloor() {
    let worldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (worldPos.x < -xLimit) theObject.translateX(spaceSize.x);
    else if (worldPos.x > xLimit) theObject.translateX(-spaceSize.x);
    if (worldPos.y < -yLimit) theObject.translateY(spaceSize.y);
    else if (worldPos.y > yLimit) theObject.translateY(-spaceSize.y);
}

// put four objects at origin
function makeFourObjects(object, spaceSize) {
    let root = new THREE.Object3D();
    for (let x of [-spaceSize.x/2, spaceSize.x/2]) {
        for (let y of [-spaceSize.y/2, spaceSize.y/2]) {
            let obj = object.clone();
            obj.position.set(x, y, 0);
            root.add(obj);
        }
    }
    subject.register(root);
    root.update = moveFourObjects;
    root.userData.pps = new THREE.Vector2(controls.xps, controls.yps);
    return root;
}


function moveFourObjects(delta) {
    let pps = this.userData.pps;
    let dx = pps.x * delta;
    let dy = pps.y * delta;
    this.translateX(dx);
    this.translateY(dy);
}

var controls = new function() {
    this.type = 'square';
    this.xps = -0.2;
    this.yps = -0.2;
    this.clip = true;
}

function initGui() {
    var gui = new dat.GUI();
    let objectTypes =  ['square', 'circle', 'manatee'];
    gui.add(controls, 'type', objectTypes).onChange(updateObject);
    gui.add(controls, 'xps', -2.0, 2.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'yps', -2.0, 2.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'clip').onChange(updateClipping);
}

function updateObject(objectType) {
    let position = new THREE.Vector3();
    if (theObject) {
        position.copy(theObject.position);
        scene.remove(theObject);
    }
    switch (objectType) {
        case 'circle':  theObject = makeFourObjects(circle, spaceSize);
                        break;
        case 'square':  theObject = makeFourObjects(square, spaceSize);
                        break;
        case 'manatee':  theObject = makeFourObjects(manatee, spaceSize);
                        break;
    }
    theObject.position.copy(position);
    scene.add(theObject);
}


function updateClipping(flag) {
    if (flag) renderer.clippingPlanes = clippingPlanes;
    else renderer.clippingPlanes = [];
}

function updateVelocity() {
    let xps = controls.xps;
    let yps = controls.yps;
    theObject.userData.pps.set(xps, yps);
}


function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    // clipping
    clippingPlanes = getClippingPlanes();
    renderer.clippingPlanes = clippingPlanes;
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.setAnimationLoop(function () {
        let delta = clock.getDelta();
        subject.notify(delta);
        cameraControls.update();
        centerOnFloor();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 14);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
                cameraControls.enableDamping = true; 
                cameraControls.dampingFactor = 0.08;
}

function getClippingPlanes() {
    let clippingPlanes = [];
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), spaceSize.x / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), spaceSize.x / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), spaceSize.y / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), spaceSize.y / 2));
    return clippingPlanes;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


