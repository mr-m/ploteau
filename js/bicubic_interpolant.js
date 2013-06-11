function BicubicInterpolant (nodes) {
    var self = this;

    self.Build = function (nodes) {
        console.group("Building of BicubicInterpolant");


        { // Вывод в консоль полученной матрицы вершин
            console.groupCollapsed("Nodes received by BicubicInterpolant constructor");
            PrintCoordinates(nodes, ["x", "y", "z"]);
            console.groupEnd();
        }

        var y_nodes_count = self.y_nodes_count = nodes.length;
        var x_nodes_count = self.x_nodes_count = nodes[0].length;

        var y_extra_count = self.y_extra_count = y_nodes_count + 2;
        var x_extra_count = self.x_extra_count = x_nodes_count + 2;

        var y_surfaces_count = self.y_surfaces_count = y_nodes_count - 1;
        var x_surfaces_count = self.x_surfaces_count = x_nodes_count - 1;

        console.log("Number of surfaces (y * x): " + y_surfaces_count + " * " + x_surfaces_count);

        var input = Extrapolate(nodes);

        { // Вывод в консоль экстраполированной матрицы вершин
            console.groupCollapsed("Extrapolated nodes");
            PrintCoordinates(input, ["x", "y", "z"]);
            console.groupEnd();
        }

        var surfaces = self.surfaces = [];

        for (var i = 0; i < y_surfaces_count; i++) {
            surfaces[i] = [];
        }

        for (var i = 1; i < self.y_nodes_count; i++) {
            for (var j = 1; j < self.x_nodes_count; j++) {
                var points = [[],[],[],[]];

                points[0][0] = input[i - 1][j - 1];
                points[1][0] = input[i    ][j - 1];
                points[2][0] = input[i + 1][j - 1];
                points[3][0] = input[i + 2][j - 1];

                points[0][1] = input[i - 1][j];
                points[1][1] = input[i    ][j];
                points[2][1] = input[i + 1][j];
                points[3][1] = input[i + 2][j];

                points[0][2] = input[i - 1][j + 1];
                points[1][2] = input[i    ][j + 1];
                points[2][2] = input[i + 1][j + 1];
                points[3][2] = input[i + 2][j + 1];

                points[0][3] = input[i - 1][j + 2];
                points[1][3] = input[i    ][j + 2];
                points[2][3] = input[i + 1][j + 2];
                points[3][3] = input[i + 2][j + 2];

                console.log("Building of ["+i+","+j+"] BicubicSurface");
                self.surfaces[i - 1][j - 1] = new BicubicSurface(points);
            }
        }

        var vertices = [];

        var x_a = self.x_a = nodes.flatten().sortBy("x", false)[0].x;
        var x_b = self.x_b = nodes.flatten().sortBy("x", true)[0].x;
        var x_L = self.x_L = x_b - x_a;
        var x_l = self.x_l = x_L / x_surfaces_count;

        var y_a = self.y_a = nodes.flatten().sortBy("y", false)[0].y;
        var y_b = self.y_b = nodes.flatten().sortBy("y", true)[0].y;
        var y_L = self.x_L = y_b - y_a;
        var y_l = self.x_l = y_L / y_surfaces_count;

        var x_index = math.floor((x_L - (x_b - x_a)) / x_l);
        var y_index = math.floor((y_L - (y_b - y_a)) / y_l);

        var x = x_a;
        var y = y_a;

        while (y <= 10) {
            x = x_a;

            while (x <= 10) {
                y_index = math.floor((y_L - (y_b - y)) / y_l);
                x_index = math.floor((x_L - (x_b - x)) / x_l);

                if (y_index >= self.y_nodes_count - 1) {
                    y_index = y_index - 1
                }
                if (x_index >= self.x_nodes_count - 1) {
                    x_index = x_index - 1
                }

                var z = self.surfaces[y_index][x_index].Interpolate(x, y);

                var particle = new THREE.Vector3(x, y, z);

                vertices.push(particle);

                x += 0.1;
            }
            y += 0.1;
        }

        console.groupEnd();

        return vertices;
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;

        self.surfaces = [];

        self.Build(self.nodes);
    }

    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position) {
        self.x_a = -10;
        self.x_b =  10;

        self.y_a = -10;
        self.y_b =  10;

        self.x_L = x_b - x_a;
        self.y_L = y_b - y_a;

        self.x_l = x_L / countX_surfaces;
        self.y_l = y_L / countY_surfaces;

        var x_index = math.floor((L - (b - x)) / l);
        var y_index = math.floor((L - (b - y)) / l);

        var z = surfaces[y_index][x_index].Interpolate(x, y) / 1024 / 2;
    }
}
