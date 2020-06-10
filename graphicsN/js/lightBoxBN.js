/***********
 * lightBoxBN.js
 * based on bandsB.js
 * M. Laszlo
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();

let mat;
let maxNbrPoles = 80;
let nbrPoles = 0;
let initNbrPoles = 4;
let roomSides = 40, roomHeight = 6;
let poles = new THREE.Object3D();


function createScene() {
    let matArgs = {side: THREE.DoubleSide};
    mat = new THREE.MeshPhongMaterial(matArgs);

    scene.add(createRoom(roomSides+10, roomHeight));
    for (let i = 0; i < initNbrPoles; i++) {
        let pole = createRandomCurvedPole(roomHeight/2);
        addPole(pole);
    }
    // we shall change lights later
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(poles);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createRoom(sides, height) {
    let room = new THREE.Object3D();
    room.translateZ(height / 2);
    room.rotateX(Math.PI / 2);
    let planeGeom = new THREE.PlaneGeometry(sides, sides);
    let plane1 = new THREE.Mesh(planeGeom, mat);
    plane1.translateZ(height / 2);
    let plane2 = new THREE.Mesh(planeGeom, mat);
    plane2.translateZ(-height / 2);
    room.add(plane1, plane2);
    return room;
}


function addPole(obj) {
    if (poles.children.length < maxNbrPoles) {
        poles.add(obj);
        ++nbrPoles;
    }
}


function removePole(obj) {
    if (nbrPoles > 0) {
        let indx = MyUtils.getRandomInt(0, nbrPoles-1);
        let pole = poles.children[indx];
        poles.remove(pole);
        pole.geometry.dispose();
        --nbrPoles;
    }
}

function createPole() {
    let cylGeom = new THREE.CylinderGeometry(1, 1, roomHeight);
    let pole = new THREE.Mesh(cylGeom, mat);
    let x = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    let z = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    pole.position.set(x, 0, z);
    return pole;
}

// Three points on quadratic curve f:Y->X in xy-plane are 
// (x0,0), (x1,y1), (x1,-y1) where x0 > 0 and x1 > x0. 
// Construct a lathe on n samples on [-y1,y1] around the
// axis x = X where X < x0 (for a concave pillar)
// or X > x1 for a convex pillar
// Function has form
// x = ay^2 + x0, solved by a = (x1 - x0) / (y1)^2
function createCurvedPoleGeometry(x0, x1, y1, X, n=100) {
    let a = (x1 - x0) / (y1 * y1);
    let f;
    if (X < x0)
        f = (y) => a * y * y + x0 - X;
    else
        f = (y) => -(a * y * y + x0 - X);
    let ys = linspace(-y1, y1, n);
    let xs = ys.map(f);
    let vecs = [];
    for (let i = 0; i < ys.length; i++)
        vecs.push(new THREE.Vector2(xs[i], ys[i]));
    return new THREE.LatheGeometry(vecs);
}


function createCurvedPole(x0, x1, y1, X, n=100) {
    let geom = createCurvedPoleGeometry(x0, x1, y1, X, n);
    let pole = new THREE.Mesh(geom, mat);
    let x = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    let z = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    pole.position.set(x, 0, z);
    return pole;
}

function createRandomCurvedPole(y1) {
    let x0 = MyUtils.getRandomFloat(0.1, 0.48);
    let x1 = MyUtils.getRandomFloat(0.52, 0.9);
    let X = MyUtils.getRandomInt(0, 1);
    return createCurvedPole(x0, x1, y1, X);
}


function linspace(a, b, n) {
    if (b <= a) throw "b must be greater than a";
    if (n < 2) throw "n must be greater than 1"
    let res = [];
    let inc = (b - a) / (n - 1);
    for (let i = 0; i < n+1; i++)
        res.push(a + i * inc);
    return res;
}



var controls = new function() {
    this.nbrPoles = initNbrPoles;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrPoles', 1, maxNbrPoles).step(1).onChange(updatePoles);
}

function updatePoles() {
    let n = controls.nbrPoles;
    let delta = Math.abs(nbrPoles - n);
    if (n < nbrPoles) { 
        for (let i = 0; i < delta; i++) {
            removePole();
        }
    } else if (n > nbrPoles) {
        for (let i = 0; i < delta; i++) {
            let pole = createRandomCurvedPole(roomHeight/2);
            addPole(pole);
        }
    }
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
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, roomSides/2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new FirstPersonControls(camera, renderer.domElement);
    // cameraControls.lookSpeed = 0.4;
    cameraControls.movementSpeed = 4;
    cameraControls.noFly = true;
    cameraControls.lookVertical = true;
    cameraControls.constrainVertical = true;
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


