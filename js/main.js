var settings_panel = document.getElementById("settings");

var function_field = document.getElementById("function");

var random = document.getElementById("random");

var plot_type_radio_buttons = document.getElementsByName("plot");

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

var x_lower_boundary;
var x_upper_boundary;
var y_lower_boundary;
var y_upper_boundary;

var x_node_count;
var y_node_count;

var f = function (x, y) { return x + y; }

var random_functions = [
    "cos(x) * cos(y)",
    "re(asin( (i*x + y)^5 ))",
    "im(asin( (i*x + y)^5 ))",
    "re(asin( (i*x + y)^5 )) * im(asin( (i*x + y)^5 ))",
    "im( (x*y)^(1/4) ) + re( (x*y)^(1/3) )",
    "(5*x*y) / (x^2 + y^2)",
    "(x^2 + y^2) * exp(1 - x^2 - y^2)",
    "cos(x)/y",
    "cos(pi*0.1*x)*y"
];

var x_coordinates = [];
var y_coordinates = [];

var values = [];

var interpolant;

var get_value = function (field) {
    var field_value = field.value;
    return field_value;
}

var get_number = function (field) {
    var field_value_as_number = get_value(field).toNumber();
    return field_value_as_number;
}

var get_function = function (function_string) {
    console.group("'get_function' called");

    var str = 'function f(x, y) = ' + function_string;

    console.log("string itself: '" + function_string + "'");
    console.log("string passed to the parser: '" + str + "'");

    var parser = math.parser();
    parser.eval(str);
    var fun = parser.get('f');

    console.groupEnd();

    return fun;
}

var get_title = function (function_string) {
    console.group("'get_title' called");

    var title = function_string + ' | plateau';

    console.log("new title: '" + title + "'");

    console.groupEnd();

    return title;
}

var get_boundaries = function () {
    console.group("'get_boundaries' called");

    x_lower_boundary = get_number(x_lower_boundary_field);
    x_upper_boundary = get_number(x_upper_boundary_field);
    y_lower_boundary = get_number(y_lower_boundary_field);
    y_upper_boundary = get_number(y_upper_boundary_field);

    console.log("x:[" + x_lower_boundary + ", " + x_upper_boundary + "]");
    console.log("y:[" + y_lower_boundary + ", " + y_upper_boundary + "]");

    console.groupEnd();
}

var get_nodes_count = function () {
    console.group("'get_nodes_count' called");

    x_node_count = get_number(x_node_count_field);
    y_node_count = get_number(y_node_count_field);

    console.log("x: " + x_node_count);
    console.log("y: " + y_node_count);

    console.groupEnd();
}

var get_nodes = function (lower_boundary, upper_boundary, nodes_count) {
    console.group("'get_nodes' called");

    var nodes = [];

    var regions_count = nodes_count - 1;

    for (var i = 0; i <= regions_count; i++) {
        var value = lower_boundary + ((upper_boundary - lower_boundary) / regions_count) * i;
        nodes[i] = value;
    };

    console.log("nodes along axis:", nodes);

    console.groupEnd();

    return nodes;
}

var get_values = function (x_nodes, y_nodes, fun) {
    console.group("'get_values' called");

    var values = [];

    for (var i = 0; i < y_nodes.length; i++) {

        var y = y_nodes[i];

        values[i] = [];

        for (var j = 0; j < x_nodes.length; j++) {
            var x = x_nodes[j];

            var z = fun(x, y);

            var vector_less = {x: x, y: y, z: z};

            values[i][j] = vector_less;
        }
    }

    console.log("computed values matrix");
    PrintMatrix(values, "z");

    console.groupEnd();

    return values;
}

var A_change = function () {
    console.clear();
    console.groupCollapsed("'A_change' event appeared");

    get_boundaries();
    get_nodes_count();

    console.groupEnd();
    B_change();
}

var B_change = function () {
    console.groupCollapsed("'B_change' event");

    var function_string = get_value(function_field);
    f = get_function(function_string);
    document.title = get_title(function_string);

    x_coordinates = get_nodes(x_lower_boundary, x_upper_boundary, x_node_count);
    y_coordinates = get_nodes(y_lower_boundary, y_upper_boundary, y_node_count);

    values = get_values(x_coordinates, y_coordinates, f);

    console.groupEnd();
    C_change();
}

var C_change = function () {
    console.group("'C_change' event appeared");

    scene.remove(particleSystem);

    particles = new THREE.Geometry();
    particleSystem = new THREE.ParticleSystem(particles, material);

    particleSystem.rotation.set(axes.rotation.x, axes.rotation.y, axes.rotation.z);

    scene.add(particleSystem);

    console.log("created particles:", particles);

    var type;

    for (var i = 0; i < plot_type_radio_buttons.length; ++i) {
        if (plot_type_radio_buttons[i].checked) {
            type = plot_type_radio_buttons[i].value;
        }
    }

    console.log("chosen plot type:", type);

    switch (type) {
        default:
        case "cubic": {
            interpolant = new CubicInterpolant;
        }
        break;

        case "bicubic": {
            interpolant = new BicubicInterpolant;
        }
        break;
    }

    particles.vertices.add(interpolant.Build(values));

    console.groupEnd();
}

x_lower_boundary_field.addEventListener("change", A_change);
x_upper_boundary_field.addEventListener("change", A_change);
y_lower_boundary_field.addEventListener("change", A_change);
y_upper_boundary_field.addEventListener("change", A_change);

x_node_count_field.addEventListener("change", A_change);
y_node_count_field.addEventListener("change", A_change);

function_field.addEventListener("change", B_change);

random.addEventListener("click", function () {
    var index = Math.random() * random_functions.length | 0;

    console.log("index:", index);

    function_field.value = random_functions[index];

    B_change();
});

for (var i = 0; i < plot_type_radio_buttons.length; i++) {
    plot_type_radio_buttons[i].addEventListener("change", C_change);
}

var scene    = new THREE.Scene();
var camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();

{
    var renderer_container = document.getElementById("render");

    var height = document.documentElement.clientHeight;
    var width = document.documentElement.clientWidth;

    console.log(width + " x " + height);

    renderer.setSize(width, height);
    renderer_container.appendChild(renderer.domElement);
}

camera.position.z = 15;

var light = new THREE.SpotLight();
light.position.set(10, 10, 10);
scene.add(light);

var axes = new THREE.AxisHelper(10);
scene.add(axes);

// create the particle variables
var particles = new THREE.Geometry();
var material = new THREE.ParticleBasicMaterial({
    color: 0xFFAAAA,
    size: 0.1,
    transparent: true
});

// create the particle system
var particleSystem = new THREE.ParticleSystem(particles, material);

particleSystem.sortParticles = true;

// add it to the scene
scene.add(particleSystem);

var down = false;
var sx = 0, sy = 0;

renderer.domElement.onmousedown = function (ev) {
    down = true;

    sx = ev.clientX;
    sy = ev.clientY;
}

window.onmouseup = function (ev) {
    down = false;
}

window.onmousemove = function (ev) {
    camera_move(ev.clientX, ev.clientY);
}

renderer.domElement.addEventListener('touchstart', function (ev) {
    ev.preventDefault();

    down = true;

    sx = ev.touches[0].pageX;
    sy = ev.touches[0].pageY;
}, false);

document.addEventListener('touchmove', function (ev) {
    camera_move(ev.touches[0].pageX, ev.touches[0].pageY);
}, false);

document.addEventListener('touchend', function (ev) {
    ev.preventDefault();

    down = false;
}, false);

function camera_move (x, y) {
    if (down) {
        var dx = x - sx;
        var dy = y - sy;

        particleSystem.rotation.z += dx * 0.01;
        axes.rotation.z += dx * 0.01;

        var new_angle = axes.rotation.x + dy * 0.01;

        if (new_angle > 0) {
            new_angle = 0;
        }

        if (new_angle < -math.pi) {
            new_angle = -math.pi;
        }

        particleSystem.rotation.x = axes.rotation.x = new_angle;

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
