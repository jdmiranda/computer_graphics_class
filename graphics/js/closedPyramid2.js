/***********
 * closedPyramid2.js
 * M. Laszlo
 * February 2018
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let pyramidGeom = createPyramid(18, 4, 4);
    let color = new THREE.Color(0, 1, 0);
    let mat = new THREE.MeshLambertMaterial({color: color, side: THREE.FrontSide});
    mat.polygonOffset = true;
    mat.polygonOffsetUnits = 1;
    mat.polygonOffsetFactor = 1;
    // try side: THREE.FrontSide and THREE.Backside
    let pyramid = new THREE.Mesh(pyramidGeom, mat);
    let basicMat = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, wireframeLinewidth: 2});
    let pyramidWiremesh = new THREE.Mesh(pyramidGeom, basicMat);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(pyramid);
    scene.add(pyramidWiremesh);
}

function createPyramid(n, rad, len) {
    let len2 = len / 2;
    let geom = new THREE.Geometry();
    // push n + 1 vertices
    //  first the apex...
    geom.vertices.push(new THREE.Vector3(0, len2, 0));
    //  and then the vertices of the base
    let inc = 2 * Math.PI / n;
    for (let i = 0, a = 0; i < n; i++, a += inc) {
        let cos = Math.cos(a);
        let sin = Math.sin(a);
        geom.vertices.push(new THREE.Vector3(rad * cos, -len2, rad * sin));
    }
    // push the n triangular faces...
    for (let i = 1; i < n; i++) {
        let face = new THREE.Face3(i+1, i, 0);
        geom.faces.push(face);
    }
    let face = new THREE.Face3(1, n, 0);
    geom.faces.push(face);
    // and then push the n-2 faces of the base
    for (let i = 2; i < n; i++) {
        let face = new THREE.Face3(i, i+1, 1);
        geom.faces.push(face);
    }
    // set face normals and return the geometry
    geom.computeFaceNormals();
    return geom;
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    let delta = clock.getDelta();
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

	camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 12);
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
    render();
	animate();
