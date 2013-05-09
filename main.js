var settings_panel = document.getElementById("settings");

var function_field = document.getElementById("function");

var x_lower_boundary_field = document.getElementById("x_lower_boundary");
var x_upper_boundary_field = document.getElementById("x_upper_boundary");
var y_lower_boundary_field = document.getElementById("y_lower_boundary");
var y_upper_boundary_field = document.getElementById("y_upper_boundary");

var x_node_count_field = document.getElementById("x_node_count");
var y_node_count_field = document.getElementById("y_node_count");

var meter = new FPSMeter(
    settings_panel,
    {
        theme: 'light',
        position: "relative",
        left: "0em",
        right: "0em",
        graph: 1,
        history: 20
    });

var f = function (x, y) { return x + y; }

var get_value = function (field) {
    var field_value = field.value;
    return field_value;
}

var get_function = function (field) {
    console.log("'get_function' called");

    var field_value = get_value(field);
    var str = 'function f(x, y) = ' + field_value;

    console.log("string given in the field: '" + field_value + "'");
    console.log("string given to the parser: '" + str + "'");

    var parser = math.parser();

    parser.eval(str);

    console.log("'get_function' work done");

    return parser.get("f");
}

var get_boundaries = function () {
    console.log("'get_boundaries' called");

    x_lower_boundary = get_value(x_lower_boundary_field).toNumber();
    x_upper_boundary = get_value(x_upper_boundary_field).toNumber();
    y_lower_boundary = get_value(y_lower_boundary_field).toNumber();
    y_upper_boundary = get_value(y_upper_boundary_field).toNumber();

    console.log("x:[" + x_lower_boundary + ", " + x_upper_boundary + "]");
    console.log("y:[" + y_lower_boundary + ", " + y_upper_boundary + "]");

    console.log("'get_boundaries' work done");
}

var get_nodes_count = function () {
    console.log("'get_nodes_count' called");

    x_node_count = get_value(x_node_count_field);
    y_node_count = get_value(y_node_count_field);

    console.log("x: " + x_node_count);
    console.log("y: " + y_node_count);

    console.log("'get_nodes_count' work done");
}

var get_nodes = function (lower_boundary, upper_boundary, regions_count) {
    console.log("'get_nodes' called");

    var nodes = [];

    for (var i = 0; i <= regions_count; i++) {
        var value = lower_boundary + ((upper_boundary - lower_boundary) / regions_count) * i;
        nodes[i] = value;
    };

    console.log(nodes);

    console.log("'get_nodes' work done");

    return nodes;
}

var get_values = function (x_nodes, y_nodes, fun) {
    console.log("'get_values' called");

    var z_values = [];

    for (var i = 0; i < y_nodes.length; i++) {

        z_values[i] = [];

        for (var j = 0; j < x_nodes.length; j++) {
            z_values[i][j] = fun(x_nodes[j], y_nodes[i]);
        }
    }

    console.log(z_values);

    console.log("'get_values' work done");

    return z_values;
}

var get_x_aligned_splines = function (x_nodes, y_nodes, z_values) {
    var vertices = []

    for (var i = 0; i < y_nodes.length; i++) {
        var ar = z_values[i];

        BuildSpline(x_nodes, ar, x_nodes.length);

        var pos = x_nodes[0];

        while (pos <= x_nodes[x_nodes.length - 1]) {
            var pX = pos,
                pY = y_nodes[i],
                pZ = Interpolate(pos),
                particle = new THREE.Vector3(pX, pY, pZ);

            vertices.push(particle);

            pos += 0.1;
        }
    };
    return vertices;
}

var get_y_aligned_splines = function (x_nodes, y_nodes, z_values) {
    var vertices = []

    for (var i = 0; i < x_nodes.length; i++) {
        var ar = [];

        for (var j = 0; j < y_nodes.length; j++) {
            ar[j] = z_values[j][i];
        };

        BuildSpline(y_nodes, ar, y_nodes.length);

        var pos = y_nodes[0];

        while (pos <= y_nodes[y_nodes.length - 1]) {
            var pX = x_nodes[i],
                pY = pos,
                pZ = Interpolate(pos),
                particle = new THREE.Vector3(pX, pY, pZ);

            vertices.push(particle);

            pos += 0.1;
        }
    };
    return vertices;
}

var get_particles = function (x_nodes, y_nodes, z_values) {
    var vertices = [];

    vertices.add(get_x_aligned_splines(x_nodes, y_nodes, z_values));
    vertices.add(get_y_aligned_splines(x_nodes, y_nodes, z_values));

    return vertices;
}

var A_change = function () {
    console.log("'A_change' event appeared");

    get_boundaries();
    get_nodes_count();

    console.log("'A_change' event handler work done");
    B_change();
}

var B_change = function () {
    console.log("'B_change' event appeared");

    f = get_function(function_field);

    XX = get_nodes(x_lower_boundary, x_upper_boundary, x_node_count);
    YY = get_nodes(y_lower_boundary, y_upper_boundary, y_node_count);
    ZZ = get_values(XX, YY, f);

    console.log("'B_change' event handler work done");
    C_change();
}

var C_change = function () {
    console.log("'C_change' event appeared");

    particles.vertices.length = 0;
    particles.vertices.add(get_particles(XX, YY, ZZ));

    console.log("'C_change' event handler work done");
}

x_lower_boundary_field.addEventListener("change", A_change);
x_upper_boundary_field.addEventListener("change", A_change);
y_lower_boundary_field.addEventListener("change", A_change);
y_upper_boundary_field.addEventListener("change", A_change);

x_node_count_field.addEventListener("change", A_change);
y_node_count_field.addEventListener("change", A_change);

function_field.addEventListener("change", B_change);

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
    down = true;
    sx = ev.clientX;
    sy = ev.clientY;
};

window.onmouseup = function () {
    down = false;
};

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
    meter.tick();
}

A_change();

render();
