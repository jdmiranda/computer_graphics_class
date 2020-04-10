/***********
 * docec.js
 * A dodecahedron with Hamiltonian circuit
 * M. Laszlo
 * September 2019
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var myFont;
var whiteMat = new THREE.MeshLambertMaterial({color: new THREE.Color(1,1,1)}); 

function createScene() {
    var dodec = makeDodec();
    var light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    var light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    var ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(dodec);
}


function makeDodec() {
    var geom = new THREE.DodecahedronGeometry(10);
    var args = {color: "blue"};
    var mat = new THREE.MeshLambertMaterial(args);
    var mesh = new THREE.Mesh(geom, mat);
    var edges_geom = new THREE.EdgesGeometry(geom);
    var args = {color: "white", linewidth: 4};
    var edges_mat = new THREE.LineBasicMaterial(args);
    var edges = new THREE.LineSegments(edges_geom, edges_mat);
    var v = geom.vertices;


    // var h_geom = new THREE.Geometry();
    // for (i of indices)
    //     h_geom.vertices.push(v[i]);
    // args = {color: "red", linewidth: 6};
    // var h_edges_mat = new THREE.LineBasicMaterial(args);
    // var h_edges = new THREE.LineSegments(h_geom, h_edges_mat);
    var root = new THREE.Object3D();
    root.add(mesh, edges);

    var textOffsetFactor = 1.2;
    for (var i = 0; i < 20; i++) {
        var textVec = new THREE.Vector3();
        var vec = v[i];
        textVec.setX(vec.x * textOffsetFactor);
        textVec.setY(vec.y);
        textVec.setZ(vec.z * textOffsetFactor);
        createText(i.toString(), textVec);
    }

    return root;
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

    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
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

init();
loadFontCreateScene();
// createScene();
addToDOM();
render();
animate();

