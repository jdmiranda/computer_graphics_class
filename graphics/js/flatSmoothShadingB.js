/***********
 * flatSmoothShadingB.js
 * M. Laszlo
 * April 2020
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let sun;
let matLambert, matPhong, mesh, geom, sphereMesh, sphereGeom;


function createScene() {
    matPhong = new THREE.MeshPhongMaterial({color: 0x0000FF, shininess: 80});
    matPhongSphere = new THREE.MeshPhongMaterial({color: 0xFF0000, shininess: 80});
    matLambert = new THREE.MeshLambertMaterial({color: 0x0000FF});
    matLambertSphere = new THREE.MeshLambertMaterial({color: 0xFF0000});
    matLambert.flatShading = true;
    matLambertSphere.flatShading = true;
    //  mesh
    geom = new THREE.TorusGeometry(10, 4, 24, 24);
    mesh = new THREE.Mesh(geom, matLambert);
    mesh.rotation.x = Math.PI / 2;
    sphereGeom = new THREE.SphereGeometry(3.5, 16, 16);
    sphereMesh = new THREE.Mesh(sphereGeom, matLambertSphere);
    updateShading(controls.shading);


    var sunMat = new THREE.MeshBasicMaterial({color: 'yellow'});
    var sunGeom = new THREE.SphereGeometry(0.5, 12, 12);
    sun = new THREE.Mesh(sunGeom, sunMat);
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 0);
    sun.add(light);
    sun.translateY(10);
    var ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(sun);
    scene.add(ambientLight);
    scene.add(mesh);
    scene.add(sphereMesh);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

var controls = new function() {
    this.transx = 0.0;
    this.transy = 10.0;
    this.transz = 0.0;
    this.shading = 'flat';
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    sun.position.x = controls.transx;
    sun.position.y = controls.transy;
    sun.position.z = controls.transz;
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);
	camera.position.set(0, 40, 0);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    var gui = new dat.GUI();
    gui.add(controls, 'transx', -20.0, 20.0).step(0.5);
    gui.add(controls, 'transy', 0.0, 20.0).step(0.5);
    gui.add(controls, 'transz', -20.0, 20.0).step(0.5);
    var shadingTypes =  ['flat', 'smooth', 'Phong'];
    var shadetype = gui.add(controls, 'shading', shadingTypes);
    shadetype.onChange(updateShading);
}

function updateShading(shadingType) {
    switch (shadingType) {
        case 'flat':
            matLambert.flatShading = true;
            matLambertSphere.flatShading = true;
            matLambert.needsUpdate = true;
            matLambertSphere.needsUpdate = true;
            geom.computeFlatVertexNormals();
            sphereGeom.computeFlatVertexNormals();
            mesh.material = matLambert;
            sphereMesh.material = matLambertSphere;             
            break;
        case 'smooth':        
            matLambert.flatShading = false;
            matLambertSphere.flatShading = false;
            matLambert.needsUpdate = true;
            matLambertSphere.needsUpdate = true;
            mesh.material = matLambert; 
            sphereMesh.material = matLambertSphere;
            geom.computeVertexNormals();
            sphereGeom.computeVertexNormals();
            break;
        case 'Phong':
            matPhong.needsUpdate = true;            
            mesh.material = matPhong;
            sphereMesh.material = matPhongSphere;
            break;
    }
}


function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
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

