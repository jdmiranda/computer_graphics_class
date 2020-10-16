
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let torus,torus2, torus3, torus4, torus5;


function createScene() {


    let tetra = sierp(5 );
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
    scene.add(tetra);
}

const createPyramid = (x, y, z, b, h) => {
    //const geometry = new THREE.ConeBufferGeometry(b, h, 4, 1);
    let geometry = new THREE.TetrahedronGeometry(1);
    const material = new THREE.MeshLambertMaterial( {color: 'red'} );
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.shouldBeDeletedOnStateChange = true;
    return mesh;
};

const sierpinsky = (scene, x, y, z, b, h, it, lvl = 0) => {
    if (it === lvl) {
        scene.add(createPyramid(x, y, z, b, h));
    }
    else {
        const nb = b / 2;
        const nh = h / 2;

        const childs = [
            [ 0, nh / 2 , 0 ],
            [ -nb, -nh / 2, 0 ],
            [ 0, -nh / 2, nb ],
            [ nb, -nh / 2, 0 ],
            [ 0, -nh / 2, -nb ],
        ];

        childs.forEach((point) => {
            sierpinsky(scene, x + point[0], y + point[1], z + point[2], nb, nh, it, lvl + 1);
        });
    }
};

const createT = () => {
  var one = new THREE.Vector3(0,1,0);
  var two = new THREE.Vector3(1,0,0);
  var three = new THREE.Vector3(-1,0,0);
  var four = new THREE.Vector3(0,0,1);

var geometry = new THREE.Geometry();
geometry.vertices.push(one);
geometry.vertices.push(two);
geometry.vertices.push(three);
geometry.vertices.push(four);

var face_one = new THREE.Face3(0, 1, 2);
var face_two = new THREE.Face3(0, 1, 3);
var face_three = new THREE.Face3(0, 2, 3);
var face_four = new THREE.Face3(1, 2, 3);

geometry.faces.push(face_one);
geometry.faces.push(face_two);
geometry.faces.push(face_three);
geometry.faces.push(face_four);

let args = {vertexColors: THREE.VertexColors, side: THREE.DoubleSide};
let mat = new THREE.MeshBasicMaterial(args);
let mesh = new THREE.Mesh(geometry, mat);

return mesh;
}

const createTetra = (x, y, z, r) => {
    //const geometry = new THREE.ConeBufferGeometry(b, h, 4, 1);
    let geometry = new THREE.TetrahedronGeometry(r);
    const material = new THREE.MeshLambertMaterial( {color: 'red'} );
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.shouldBeDeletedOnStateChange = true;
    return mesh;
};

let verts;

function sierp(level){
  if (level == 0){
    let geometry = new THREE.TetrahedronGeometry(1);
    var material = new THREE.MeshLambertMaterial( {color: 'red'} );
    let mesh = new THREE.Mesh(geometry, material);
    let root = new THREE.Object3D();
    root.add(mesh);
    return mesh;
  }
  else {
    let t = sierp(level-1);
    var count = 0;
    let root = new THREE.Object3D();
    var scale = 1/2;
    root.scale.set(scale, scale, scale);
    for (let i = 0; i < 4; i++){
      if (t.type == "Mesh"){
        verts = t.geometry.vertices
      }
        //let v = t.geometry.vertices[i];
        let v = verts[i];
        //let p = t.worldToLocal(v);
        let clone = t.clone();
        clone.position.set(v.x,v.y,v.z);
        root.add(clone);
      }
    return root;
  }
}

function addClone(root, scene, i){
  if (scene.type == "Mesh"){
    console.log('inside mesh ' + i)
    console.log("root position is")
    console.log(root.position)
    console.log("scene vertices are ")
    console.log(scene.vertices)
    let v = scene.geometry.vertices[i];
    let p = scene.localToWorld(v);
    let clone = scene.clone();
    clone.position.set(p.x ,p.y,p.z);
    console.log(clone.position)
    root.add(clone);
    return root;
  }
  if (scene.type == "Object3D"){
    for (let j = 0; j < scene.children.length; j++){
      for (let k = 0; k < 4; k++){
        console.log("scene: " )
        console.log(scene)
        addClone(root, scene.children[j], k);
      }
    }
  }
  return root;
}

function makeCantor(retainF, level, mat, len=10) {
    if (level == 0) {
        let geom = new THREE.BoxGeometry(len, 0.4, len);
        return new THREE.Mesh(geom, mat);
    }
    else {
        let cantor = makeCantor(retainF, level-1, mat, len);
        let root = new THREE.Object3D();
        root.scale.set(1/3, 1, 1/3);
        for (x of [-len, 0, len]) {
            for (z of [-len, 0, len]) {
                if (retainF(x, z, len)) {
                    let clone = cantor.clone();
                    clone.position.set(x, 0, z);
                    root.add(clone);
                }
            }
        }
        return root;
    }
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
