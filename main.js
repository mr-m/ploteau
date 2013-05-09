// Setting the FPS-counter

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

setInterval( function () {

    stats.begin();

    // your code goes here

    stats.end();

}, 1000 / 60 );




// create a parser
var parser = math.parser();

var function_field = document.getElementById("function");

var f = function (x, y) { return x + y; }

var get_function = function () {
    console.log("'get_function' called");

    var field_value = function_field.value;
    var str = 'function f(x, y) = ' + field_value;

    console.log("string given in the field: '" + field_value + "'");
    console.log("string given to the parser: '" + str + "'");

    parser.eval(str);

    f = parser.get("f");

    console.log("'get_function' work done");
}

function_field.addEventListener("change", function () {
    console.log("'function_field.onchange' event appeared");
    get_function();
    get_values(XX, YY, f);
    console.log("'function_field.onchange' event handler work done");
});

get_function();

var get_boundaries = function () {

}


XX = [-5,-4,-3,-2,-1, 0, 1, 2, 3, 4, 5];
YY = [-5,-4,-3,-2,-1, 0, 1, 2, 3, 4, 5];
ZZ = [];


var get_values = function (x_nodes, y_nodes, fun) {

    var z_values = [];

    for (var i = 0; i < y_nodes.length; i++) {

        z_values[i] = [];

        for (var j = 0; j < x_nodes.length; j++) {
            z_values[i][j] = fun(x_nodes[j], y_nodes[i]);
        }
    }

    return z_values;
}

ZZ = get_values(XX, YY, f)

// Структура, описывающая сплайн на каждом сегменте сетки
splines = [];

var scene    = new THREE.Scene();
var camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("render").appendChild(renderer.domElement);

camera.position.z = 15;

var light = new THREE.SpotLight();
light.position.set(10, 10, 10);
scene.add(light);

var axes = new THREE.AxisHelper(10);
scene.add(axes);

// create the particle variables
var particles = new THREE.Geometry(),
    pMaterial =
        new THREE.ParticleBasicMaterial({
            color: 0xFFAAAA,
            size: 0.1,
            transparent: true
        });



for (var i = 0; i < XX.length; i++) {
    BuildSpline(YY, ZZ[i], YY.length);
    var pos = YY[0];
    // now create the individual particles
    while (pos <= YY[YY.length - 1]) {
        // create a particle with random
        // position values, -250 -> 250
        var pX = XX[i],
            pY = pos,
            pZ = Interpolate(pos),
            particle = new THREE.Vector3(pX, pY, pZ);

        // add it to the geometry
        particles.vertices.push(particle);

        pos += 0.1;
    }
};

for (var i = 0; i < YY.length; i++) {

    var ar = [];

    for (var j = 0; j < XX.length; j++) {
        ar[j] = ZZ[j][i];
    };

    BuildSpline(XX, ar, XX.length);
    var pos = YY[0];
    // now create the individual particles
    while (pos <= YY[YY.length - 1]) {
        // create a particle with random
        // position values, -250 -> 250
        var pX = pos,
            pY = YY[i],
            pZ = Interpolate(pos),
            particle = new THREE.Vector3(pX, pY, pZ);

        // add it to the geometry
        particles.vertices.push(particle);

        pos += 0.1;
    }
};

// create the particle system
var particleSystem =
    new THREE.ParticleSystem(
        particles,
        pMaterial
    );

particleSystem.sortParticles = true;

// add it to the scene
scene.add(particleSystem);


var down = false;
var sx = 0, sy = 0;
window.onmousedown = function (ev) {
    down = true; sx = ev.clientX; sy = ev.clientY;
};
window.onmouseup = function () { down = false; };
window.onmousemove = function (ev) {
    if (down) {
        var dx = ev.clientX - sx;
        var dy = ev.clientY - sy;

        particleSystem.rotation.z += dx * 0.01;
        particleSystem.rotation.x += dy * 0.01;

        axes.rotation.z += dx * 0.01;
        axes.rotation.x += dy * 0.01;

        sx += dx;
        sy += dy;
    }
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
