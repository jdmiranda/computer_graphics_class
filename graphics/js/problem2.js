
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let geo = createCylinder(8, 2, 2);
    let color = new THREE.Color(1, 1, 0);
    let mat = new THREE.MeshLambertMaterial({color: color, side: THREE.DoubleSide});
    mat.polygonOffset = true;
    mat.polygonOffsetUnits = 1;
    mat.polygonOffsetFactor = 1;
    let mesh = new THREE.Mesh(geo, mat);
    let basicMat = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, wireframeLinewidth: 2});
    let geoWireMesh = new THREE.Mesh(geo, basicMat);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(mesh);
    scene.add(geoWireMesh);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createCylinder(n, rad, len) {
  let len2 = len / 2;
  let geom = new THREE.Geometry();
  let inc = 2 * Math.PI / n;
  for (let i = 0, a = 0; i < n; i++, a += inc) {
      let cos = Math.cos(a);
      let sin = Math.sin(a);
      geom.vertices.push(new THREE.Vector3(rad * cos, -len2, rad * sin));
      geom.vertices.push(new THREE.Vector3(rad * cos, len2, rad * sin));
  }

  let vertCount = (n *2) - 2 ;
  for (let i = 0; i < vertCount; i++) {
    if ((i %2) ==0){
      let face = new THREE.Face3(i, i+2, 0);
      let face1 = new THREE.Face3(i, i+1, i+3);
      let face2 = new THREE.Face3(i, i+2, i+3);
      geom.faces.push(face,face1,face2);
    } else {
      let face4 = new THREE.Face3(i,i+2,1)
      geom.faces.push(face4);
    }
  }

   let face2 = new THREE.Face3(0,1,vertCount);
   let face3 = new THREE.Face3(1,vertCount,vertCount+1);
   geom.faces.push(face2,face3);

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
