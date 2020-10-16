
let camera, scene, renderer,tetra,cameraControls,verts,rad;
let clock = new THREE.Clock();
const scale = 1/2;
const mat = new THREE.MeshLambertMaterial( {color: 'red'} );

function createScene() {
    tetra = sierp(2);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(tetra);
}

function sierp(level){
  if (level == 0){
    let geometry = new THREE.TetrahedronGeometry(1);
    let mesh = new THREE.Mesh(geometry, mat);
    return mesh;
  }
  else {
    let t = sierp(level-1);
    let root = new THREE.Object3D();
    root.scale.set(scale, scale, scale);
    for (let i = 0; i < 4; i++){
      if (t.type == "Mesh"){
        verts = t.geometry.vertices
      }
        let v = verts[i];
        let clone = t.clone();
        clone.position.set(v.x,v.y,v.z);
        root.add(clone);
      }
    return root;
  }
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

var controls = new function() {
    this.nbrLevels = 2;
    this.radius = 1;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 8).step(1).onChange(update);
}

function update() {
  if (tetra){
    scene.remove(tetra);
  }
  let n = controls.nbrLevels;
  tetra = sierp(n);
  scene.add(tetra);
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
	camera.position.set(0, 0, 5);
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
initGui();
addToDOM();
render();
animate();
