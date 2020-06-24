/***********
 * slidingTilesSN.js
 * based on posSnowflakeAnimB.js
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


let spaceSize = new THREE.Vector2(8, 8);
let theObject;
let theObjectSize = 2;
let clippingPlanes;


function createScene() {

    let geom = new THREE.PlaneGeometry(theObjectSize, theObjectSize);
    let matArgs = {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let square = new THREE.Mesh(geom, mat);
    theObject = makeFourObjects(square, spaceSize);
    theObject.position.set(4, 4, 0);
    scene.add(theObject);

    scene.add(makeFloor(spaceSize));

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

function makeFloor(spaceSize) {
    let geom = new THREE.PlaneGeometry(spaceSize.x, spaceSize.y);
    let matArgs = {color: 0xc0c0c0};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let floor = new THREE.Mesh(geom, mat);
    floor.translateZ(-0.01);
    return floor;
}

let xLimit = spaceSize.x / 2 + theObjectSize;
let yLimit = spaceSize.y / 2 + theObjectSize;

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
    root.userData.halfplanes = new THREE.Vector2(1, 1);
    root.userData.pps = new THREE.Vector2(-0.2, -0.2);
    return root;
}

function moveSquare(delta) {
    let pps = this.pps;
    let dx = this.pps * delta;
    this.translateX(dx);
}

function moveFourObjects(delta) {
    let pps = this.userData.pps;
    let dx = pps.x * delta;
    let dy = pps.y * delta;
    this.translateX(dx);
    this.translateY(dy);
}

var controls = new function() {
    this.xps = -0.2;
    this.yps = -0.2;
    this.clip = true;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'xps', -1.0, 1.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'yps', -1.0, 1.0).step(0.01).onChange(updateVelocity);
    gui.add(controls, 'clip').onChange(updateClipping);
}

function updateClipping(flag) {
    if (flag) renderer.clippingPlanes = clippingPlanes;
    else renderer.clippingPlanes = [];
}

function updateVelocity() {
    let xps = controls.xps;
    let yps = controls.yps;
    theObject.userData.pps.set(xps, yps);
    // let halfplanes = theObject.userData.halfplanes;
    // if ((halfplanes.x == 1) && (xps > 0)) {
    //     theObject.translateX(-spaceSize.x);
    //     halfplanes.setX(-1);
    // } else if ((halfplanes.x == -1) && (xps < 0)) {
    //     theObject.translateX(spaceSize.x);
    //     halfplanes.setX(1);
    // }
    // if ((halfplanes.y == 1) && (yps > 0)) {
    //     theObject.translateY(-spaceSize.x);
    //     halfplanes.setY(-1);
    // } else if ((halfplanes.y == -1) && (yps < 0)) {
    //     theObject.translateY(spaceSize.x);
    //     halfplanes.setY(1);
    // }
}


function genRandomColors() {
    if (controls.randomColors)
        for (let mat of materials) 
            mat.color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
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
    camera.position.set(0, 0, 10);
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


