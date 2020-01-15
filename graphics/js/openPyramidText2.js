/***********
 * openPyramidText.js
 * M. Laszlo
 * February 2018
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var whiteMat = new THREE.MeshLambertMaterial({color: new THREE.Color(1,1,1)}); 
var myFont;

function createScene() {
    var color = new THREE.Color(0, 1, 0);
    var mat = new THREE.MeshLambertMaterial({color: color, side: THREE.DoubleSide});    
    var geom = createPyramid(10, 4);
    var pyramid = new THREE.Mesh(geom, mat);
    var basicMat = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, wireframeLinewidth: 2});
    var pyramidWiremesh = new THREE.Mesh(geom, basicMat);
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    var light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light, light2, ambientLight);
    scene.add(pyramid, pyramidWiremesh);
}

function createPyramid(n, len) {
    var len2 = len / 2;
    var rad = 6;
    var geom = new THREE.Geometry();
    // push n + 1 vertices
    //  first the apex...
    var vec = new THREE.Vector3(0, len, 0);
    geom.vertices.push(vec);
    createText("0", vec);
    //  and then the vertices of the base
    var textOffsetFactor = 1.05;
    var inc = 2 * Math.PI / n;
    for (var i = 0, a = 0; i < n; i++, a += inc) {
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        var vec = new THREE.Vector3(rad * cos, -len2, rad * sin);
        geom.vertices.push(vec);
        var textVec = new THREE.Vector3();
        textVec.setX(vec.x * textOffsetFactor);
        textVec.setY(vec.y);
        textVec.setZ(vec.z * textOffsetFactor);
        createText((i+1).toString(), textVec);
    }
    // push the n triangular faces
    for (var i = 1; i < n; i++) {
        var face = new THREE.Face3(i+1, i, 0);
        geom.faces.push(face);
    }
    var face = new THREE.Face3(1, n, 0);
    geom.faces.push(face);
    // set face normals and return the geometry
    geom.computeFaceNormals();
    return geom;
}

function createText(s, vec) {
    console.log(myFont);
    var textProps = {size: 0.5, height: 0.1, curveSegments: 2, font: myFont};
    var geom = new THREE.TextGeometry(s, textProps);
    geom.computeBoundingBox();
    geom.computeVertexNormals();
    var mesh = new THREE.Mesh(geom, whiteMat);
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
	camera.position.set(0, 0, 16);
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
        console.log(myFont)
        createScene();
    });
}

try {
	init();
    loadFontCreateScene();
	addToDOM();
    render();
	animate();
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}

