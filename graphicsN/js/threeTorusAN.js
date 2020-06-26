/***********
 * threeTorusAN.js
 * based on slidingTilesTN.js
 * M. Laszlo
 * See Alt. Fractals
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';


// https://en.wikipedia.org/wiki/Torus#n-dimensional_torus
// https://en.wikipedia.org/wiki/3-manifold#3-torus

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();


let spaceSize = new THREE.Vector3(20, 20, 20);
let theObject;
let theObjectDiameter = 3.47;  // sqrt(12) diagonal of 2x2x2 cube
let cube, sphere;
let clippingPlanes;


function createScene() {
    cube = makeCube(theObjectDiameter, theObjectDiameter, theObjectDiameter);
    sphere = makeSphere(theObjectDiameter/2, 30, 30);

    theObject = makeEightObjects(cube, spaceSize);
    theObject.position.set(spaceSize.x/2, spaceSize.y/2, spaceSize.z/2);
    scene.add(theObject);

    scene.add(makeWalls(spaceSize));

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(-10, -20, -20);
    let light3 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light3.position.set(20, -20, 20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function makeWalls(spaceSize) {
    let geom = new THREE.BoxGeometry(spaceSize.x, spaceSize.y, spaceSize.z);
    let matArgs = {color: 0xc0c0c0, transparent: true, opacity: 0.3, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let walls = new THREE.Mesh(geom, mat);
    // walls should be inside clipping planes
    let oneMinEps = 1.0 - 0.001;
    walls.scale.set(oneMinEps, oneMinEps, oneMinEps);
    return walls;
}

function makeCube(sizex, sizey, sizez) {
    let geom = new THREE.BoxGeometry(sizex, sizey, sizez);
    let mats = [];
    for (let i = 0; i < 6; i++) {
        let color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
        mats.push(new THREE.MeshLambertMaterial({color: color}));
    }
    return new THREE.Mesh(geom, mats);
}


function makeSphere(rad, hsegs, vsegs) {
    //  (vseg-2) horizontal segments of rectangles, so hseg*(vseg-2)*2 triangles, plus
    //  2*hseg triangles top and bottom (attaching to north and south poles)
    // total: 2*hseg(vseg-1) triangles
    let geom = new THREE.SphereGeometry(rad, hsegs, vsegs);
    let faces = geom.faces;
    let nbrFaces2 = faces.length / 2;
    for (let i = 0; i < 2; i++) {
        let color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
        for (let j = 0; j < nbrFaces2; j++) {
            faces[j + i * nbrFaces2].color = color;
        }
    }
    let mat = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors})
    return new THREE.Mesh(geom, mat);
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

// center replicates at origin
function makeEightObjects(object, spaceSize) {
    let root = new THREE.Object3D();
    for (let x of [-spaceSize.x/2, spaceSize.x/2]) {
        for (let y of [-spaceSize.y/2, spaceSize.y/2]) {
            for (let z of [-spaceSize.z/2, spaceSize.z/2]) {
                let obj = object.clone();
                obj.position.set(x, y, z);
                root.add(obj);
            }
        }
    }
    subject.register(root);
    root.update = moveEightObjects;
    root.userData.pps = new THREE.Vector3(controls.xps, controls.yps, controls.zps);
    return root;
}


function moveEightObjects(delta) {
    let pps = this.userData.pps;
    let dx = pps.x * delta;
    let dy = pps.y * delta;
    let dz = pps.z * delta;
    this.translateX(dx);
    this.translateY(dy);
    this.translateZ(dz);
}

var controls = new function() {
    this.type = 'cube';
    this.xps = 1.4;
    this.yps = 0.6;
    this.zps = 0.0;
    this.clip = true;
}

function initGui() {
    var gui = new dat.GUI();
    let objectTypes =  ['cube', 'sphere'];
    gui.add(controls, 'type', objectTypes).onChange(updateObject);
    gui.add(controls, 'xps', -2.0, 2.0).step(0.1).onChange(updateVelocity);
    gui.add(controls, 'yps', -2.0, 2.0).step(0.1).onChange(updateVelocity);
    gui.add(controls, 'zps', -2.0, 2.0).step(0.1).onChange(updateVelocity);
    gui.add(controls, 'clip').onChange(updateClipping);
}

function updateObject(objectType) {
    let position = new THREE.Vector3();
    if (theObject) {
        position.copy(theObject.position);
        scene.remove(theObject);
    }
    switch (objectType) {
        case 'cube':  theObject = makeEightObjects(cube, spaceSize);
                        break;
        case 'sphere':  theObject = makeEightObjects(sphere, spaceSize);
                        break;
        case 'manatee':  theObject = makeEightObjects(manatee, spaceSize);
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
    let zps = controls.zps;
    theObject.userData.pps.set(xps, yps, zps);
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
    camera.position.set(0, 0, 36);
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
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), spaceSize.z / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), spaceSize.z / 2));
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

