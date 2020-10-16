
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let mat = new THREE.MeshLambertMaterial({color: 'blue'});
    let geom = new THREE.SphereGeometry(1,12,12);
    var mesh = new THREE.Mesh(geom, mat);
    let helix = createHelix(mesh, 49, 2, Math.PI/4, 0.5);
    mat.polygonOffset = true;
    mat.polygonOffsetUnits = 1;
    mat.polygonOffsetFactor = 1;
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createHelix(object, n, radius, angle, dist){
  rotation = angle;
  for (let i = 1; i <= n; i++) {
    console.log(rotation);
    x = radius * Math.cos(rotation);
    y = radius * Math.sin(rotation);
    thisDistance = (i * dist);
    var clone = object.clone();
    clone.position.set(x,y,-thisDistance);
    scene.add(clone);
    rotation += angle;
    twoPi = 2 * Math.PI;
    if (rotation > twoPi){
      rotation -= twoPi;
    }
  }
  return object;
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
