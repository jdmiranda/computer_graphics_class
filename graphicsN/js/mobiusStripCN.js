/***********
 * mobiusStripCN.js
 * M. Laszlo
 * July 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();

let radius = 12;
let mobiusHeight = 6;
let heightSegments = 16;
let nbrSegments = 600;
let mobius;
let nbrTwists = 2;
let ball;
let ballRPS = 0.1;
let ballRadius = 0.5;

function createScene() {
    updateMobius();
    ball = makeBall(ballRadius);
    ball.update = rollBall;
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(20, 0, 0);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(-10, -20, 20);
    let light3 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light3.position.set(-10, 20, -20);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(ambientLight);

    // let axes = new THREE.AxesHelper(10);
    // scene.add(axes);
}

const zAxis = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);


function makeMobiusStripGeometry(radius, ntwists, height, radialSegs, heightSegs) {
    // parametric equation of mobius with ntwists
    // cylinder: ntwists==0;  mobius: ntwists==1
    // we perform pi*ntwists in total
    const halfHeight = height / 2;
    const totalTwists = Math.PI * ntwists;

    function f(u, v, res) {
        let zTheta = totalTwists * u;
        let yTheta = 2 * Math.PI * u;
        let y = -halfHeight + v * height;
        res.set(0, y, 0);
        res.applyAxisAngle(zAxis, zTheta);
        res.applyAxisAngle(yAxis, -yTheta);
        let sinTheta = Math.sin(yTheta);
        let cosTheta = Math.cos(yTheta);
        res.add(new THREE.Vector3(radius * cosTheta, 0, radius * sinTheta));
    }
    let geom = new THREE.ParametricGeometry(f, radialSegs, heightSegs);
    return geom;
}

function makeBall(radius=0.5) {
    let geom = new THREE.SphereGeometry(radius, 24, 24);
    let matArgs = {color: 0xff0000};
    let mat = new THREE.MeshPhongMaterial(matArgs);
    let ball = new THREE.Mesh(geom, mat);
    let root = new THREE.Object3D();
    let root2 = new THREE.Object3D();
    root.add(root2);
    root2.add(ball);
    return root;
}



let controls = new function() {
    this.nbrTwists = 1;
    this.nbrSegments = 40;
    this.color1 = '#1562c9';
    this.color2 = '#ffffff';
    this.ball = false;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrTwists', 0, 18).step(1).onChange(updateMobius);
    gui.addColor(controls, 'color1').onChange(updateColor);
    gui.addColor(controls, 'color2').onChange(updateColor);
    gui.add(controls, 'ball').onChange(updateBall).listen();
}

function updateColor() {
    if (mobius) {
        let colors = [new THREE.Color(controls.color1), new THREE.Color(controls.color2)];
        for (let i = 0; i < 2; i++) {
            let mat = mobius.children[i].material;
            mat.color = colors[i];
        }
    }
}

function updateBall() {
    if (controls.ball) {
        sign = 1;
        subject.register(ball);
        scene.add(ball);
    } else {
        scene.remove(ball);
        subject.unregister(ball);
    }
}

let sign = 1;

function rollBall(delta) {
    let nbrTwists = controls.nbrTwists;
    let parent = this;
    let child = parent.children[0];
    let ball = child.children[0];
    parent.rotation.y += MyUtils.rpsToRadians(ballRPS, delta);
    if ((nbrTwists % 2 == 1) && (parent.rotation.y > 2 * Math.PI)) {
        // flip side
        sign *= -1;
    }
    parent.rotation.y %= 2 * Math.PI;
    child.position.x = radius;
    // on centerline of strip; next we offset to one side
    // local x-axis points away from strip center
    let totalTwists = Math.PI * nbrTwists;
    let u = parent.rotation.y / (2 * Math.PI);
    let zTheta = totalTwists * u;
    child.rotation.z = -zTheta;
    ball.position.x = sign * ballRadius;
}




function updateMobius() {
    let nbrTwists = controls.nbrTwists;
    let color1 = controls.color1;
    let color2 = controls.color2;
    scene.remove(mobius);
    let geom = makeMobiusStripGeometry(radius, nbrTwists, mobiusHeight, nbrSegments, heightSegments);
    let matArgs1 = {side: THREE.FrontSide, shininess:50, color: color1};
    let mat1 = new THREE.MeshPhongMaterial(matArgs1);
    let mesh1 = new THREE.Mesh(geom, mat1);
    let matArgs2 = {side: THREE.BackSide, shininess: 50, color: color2};
    let mat2 = new THREE.MeshPhongMaterial(matArgs2);
    let mesh2 = new THREE.Mesh(geom, mat2);
    mobius = new THREE.Object3D();
    mobius.add(mesh1, mesh2);
    scene.add(mobius);
    controls.ball = false;
    updateBall();
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
        cameraControls.update();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 36);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
                cameraControls.enableDamping = true; 
                cameraControls.dampingFactor = 0.04;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


