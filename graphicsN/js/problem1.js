/***********
 Write the function regularPolygonGeometry(n,innerColor, outerColor)that returns
 a mesh representing an n-sided regular polygon. The polygon should be centered
 at the origin, lie in the xy-plane, and have radius 2 (the distance from the
 origin to each of the polygon's n vertices). Use your function in a three.js
 program that produces an 8-sided (or 12-or 16-or whatever-sided) polygon.
 Colors should interpolate from the polygon's center (innerColor) to its
 perimeter (outerColor).
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';


let camera, scene, renderer;
let cameraControls;

let TAU = Math.PI * 2;



function createScene() {
    let red = new THREE.Color(1, 0, 0);
    let blue = new THREE.Color(0, 0, 1);
    let polygon = regularPolygonGeometry(8, red,blue);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
    scene.add(polygon);
}

function degreeToRadian(degree){
  return degree * (Math.PI / 180)
}

function regularPolygonGeometry(n, innerColor, outerColor) {
  let radius = 2;
  let circle_degrees = 360;
  let angle = circle_degrees/n;
  let points = getPoints(n,radius, angle);
  let center = new THREE.Vector3(0,0,0);
  let pointB = new THREE.Vector3(radius,0,0);
  let geom = new THREE.Geometry();
  geom.vertices.push(center);
  geom.vertices.push(pointB);
  for (var i = 0; i < n; i++){
    var j,k;
    geom.vertices.push(points[i]);
    if (i == 0 ){
      j = 1;
      k = 2;
    } else if (i == n-1) {
      j = 1;
      k = i +1;
    } else {
      j = i + 1;
      k = i + 2;
    }

    var face = new THREE.Face3(0,j,k);
    geom.faces.push(face);
    face.vertexColors.push(innerColor, outerColor, outerColor);
  }

  let args = {vertexColors: THREE.VertexColors, side: THREE.DoubleSide};
  let mat = new THREE.MeshBasicMaterial(args);
  let mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

function getPoints(n,r,a){
  let point = [n]
  /*
    We only have to generate n-1 vertices because we already know that each
    triangle will have a center point of (0,0) and that the first triangle will
    have a second vertice starting at (radius, 0).
  */
  for (var i = 0; i < n; i++ ){
    let theta = a * (i+1);
    point[i] = getPoint(r, degreeToRadian(theta));
  }
  return point;
}

function getPoint(r, a){
  let x = r * Math.cos(a);
  let y = r * Math.sin(a);
  return new THREE.Vector3(x,y,0);
}

function init() {

	scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.setAnimationLoop(function () {
        cameraControls.update();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 30);
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
