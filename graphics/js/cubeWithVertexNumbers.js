/***********
 * cubeWithVertexNumbers.js
 * A cube with numbers assigned to vertexes
 * M. Laszlo
 * February 2018
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var whiteMat = new THREE.MeshLambertMaterial({color: new THREE.Color(1,1,1)}); 

var myFont;


function createScene() {
    var geom = new THREE.CubeGeometry(2, 2, 2);
    var mat = new THREE.MeshLambertMaterial({color: 0xFF0000, transparent: true, opacity: 0.8});
    var mesh = new THREE.Mesh(geom, mat);

    // vertex numbers
    var coords = [-1.1, 1.1];
    var indx = 0;
    for (var x = 0; x < 2; x++)
        for (var y = 0; y < 2; y++)
            for (var z = 0; z < 2; z++) {
                var vec = new THREE.Vector3(coords[x], coords[y], coords[z]);
                createText(indx.toString(), vec);
                indx++;
            }
    scene.add(mesh);
    addLights();

    var axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function addLights() {
    var pointLight1 = new THREE.PointLight(0xFFFFFF, 1, 0, 1000);
    pointLight1.position.set(0, 20, 20);
    var pointLight2 = new THREE.PointLight(0xFFFFFF, 1, 0, 1000);
    pointLight2.position.set(0, 20, -20);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(pointLight1);
    scene.add(pointLight2);
    scene.add(ambientLight);
}



function createText(s, vec) {
    var textProps = {size: 0.5, height: 0.1, curveSegments: 2, font: myFont};
    var textGeom = new THREE.TextGeometry(s, textProps);
    textGeom.computeBoundingBox();
    textGeom.computeVertexNormals();
    var mesh = new THREE.Mesh(textGeom, whiteMat);
    mesh.position.copy(vec);    
    scene.add(mesh);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
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

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 10);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}



function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function loadFontCreateScene() {
    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        myFont = font;
        createScene();
    });
}


init();
loadFontCreateScene();
addToDOM();
render();
animate();

