/***********
 * smoothShadingA.js
 * M. Laszlo
 * May 2020
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let sun;
let matLambert, mesh, geom;
let face1, face2;
let normalLines;
let lineMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 4});
let corners = [
    new THREE.Vector3(-10, 0, -10),
    new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(10, 0, 10),
    new THREE.Vector3(-10, 0, 10)
];

function createScene() {
    matLambert = new THREE.MeshLambertMaterial({color: 0x0000FF, side: THREE.DoubleSide});
    geom = makeSquareGeom();
    mesh = new THREE.Mesh(geom, matLambert);
    updateNormals();

    // light
    let sunMat = new THREE.MeshBasicMaterial({color: 'yellow'});
    let sunGeom = new THREE.SphereGeometry(0.5, 12, 12);
    sun = new THREE.Mesh(sunGeom, sunMat);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 0);
    sun.add(light);
    sun.translateY(10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(sun);
    scene.add(ambientLight);
    scene.add(mesh);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function makeSquareGeom() {
    let geom = new THREE.Geometry();
    for (c of corners) {
        geom.vertices.push(c);
    }
    face1 = new THREE.Face3(0, 2, 1);
    face2 = new THREE.Face3(0, 3, 2);
    geom.faces.push(face1, face2);
    return geom;
}


function updateNormals() {
    let rad = controls.normalAngle * (Math.PI / 180);
    let xz = (Math.sqrt(2) / 2) * Math.sin(rad);
    let y = Math.cos(rad);
    let normals = [];
    normals.push(new THREE.Vector3(-xz, y, -xz).normalize());
    normals.push(new THREE.Vector3(xz, y, -xz).normalize());
    normals.push(new THREE.Vector3(xz, y, xz).normalize());
    normals.push(new THREE.Vector3(-xz, y, xz).normalize());
    if (controls.shading !== 'flat') {
        face1.vertexNormals.length = 0;  // clear array
        face1.vertexNormals.push(normals[0], normals[2], normals[1]);
        face2.vertexNormals.length = 0;
        face2.vertexNormals.push(normals[0], normals[3], normals[2]);
        geom.elementsNeedUpdate = true;
        mesh.material.needsUpdate = true;
    }
    addNormalsToScene(normals);
}

function updateShading(shadingType) {
    switch (shadingType) {
        case 'flat':
            matLambert.flatShading = true;
            mesh.material = matLambert;
            geom.computeFlatVertexNormals();
            break;
        case 'Lambert':        
            matLambert.flatShading = false;
            mesh.material = matLambert; 
            updateNormals();
            break;
    }
    geom.elementsNeedUpdate = true;
    mesh.material.needsUpdate = true;
}


function addNormalsToScene(normals) {
    if (normalLines)
        scene.remove(normalLines);
    let scale = 5.0;
    let geom = new THREE.Geometry();
    for (let i = 0; i < 4; i++) {
        geom.vertices.push(corners[i]);
        let n = new THREE.Vector3().copy(normals[i]);
        geom.vertices.push(n.multiplyScalar(scale).add(corners[i]));
    }
    normalLines = new THREE.LineSegments(geom, lineMat);
    scene.add(normalLines);
}

let controls = new function() {
    this.transx = 0.0;
    this.transy = 10.0;
    this.transz = 0.0;
    this.normalAngle = 0;
    this.shading = 'Lambert';
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    let delta = clock.getDelta();
    sun.position.x = controls.transx;
    sun.position.y = controls.transy;
    sun.position.z = controls.transz;
    cameraControls.update(delta);
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
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 40, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    let gui = new dat.GUI();
    gui.add(controls, 'transx', -20.0, 20.0).step(0.5);
    gui.add(controls, 'transy', 0.0, 20.0).step(0.5);
    gui.add(controls, 'transz', -20.0, 20.0).step(0.5);
    let normalAngleControl = gui.add(controls, 'normalAngle', -90, 90).step(1);
    normalAngleControl.onChange(updateNormals);    
    let shadingTypes =  ['flat', 'Lambert'];
    let shadetype = gui.add(controls, 'shading', shadingTypes);
    shadetype.onChange(updateShading);
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
render();
animate();

