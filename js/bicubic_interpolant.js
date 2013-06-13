function BicubicInterpolant (nodes) {
    var self = this;

    self.Initialize = function (nodes) {
        console.groupCollapsed("Initialization of BicubicInterpolant");

        self.nodes = nodes;

        var y_nodes_count = self.y_nodes_count = nodes.length;
        var x_nodes_count = self.x_nodes_count = nodes[0].length;

        var y_extra_count = self.y_extra_count = y_nodes_count + 2;
        var x_extra_count = self.x_extra_count = x_nodes_count + 2;

        var y_surfaces_count = self.y_surfaces_count = y_nodes_count - 1;
        var x_surfaces_count = self.x_surfaces_count = x_nodes_count - 1;

        console.log("Number of surfaces (y * x): " + y_surfaces_count + " * " + x_surfaces_count);

        var x_a = self.x_a = nodes.flatten().sortBy("x", false)[0].x;
        var x_b = self.x_b = nodes.flatten().sortBy("x", true)[0].x;
        var x_L = self.x_L = x_b - x_a;
        var x_l = self.x_l = x_L / x_surfaces_count;

        var y_a = self.y_a = nodes.flatten().sortBy("y", false)[0].y;
        var y_b = self.y_b = nodes.flatten().sortBy("y", true)[0].y;
        var y_L = self.x_L = y_b - y_a;
        var y_l = self.x_l = y_L / y_surfaces_count;

        console.log("x_a:", x_a);
        console.log("x_b:", x_b);
        console.log("x_surfaces_count:", x_surfaces_count);

        console.log("y_a:", y_a);
        console.log("y_b:", y_b);
        console.log("y_surfaces_count:", y_surfaces_count);

        var surfaces = self.surfaces = [];

        for (var i = 0; i < y_surfaces_count; i++) {
            surfaces[i] = [];
        }

        console.groupEnd();
    }

    self.Build = function (nodes) {
        console.group("Building of BicubicInterpolant");

        self.Initialize(nodes);

        { // Вывод в консоль полученной матрицы вершин
            console.groupCollapsed("Nodes received by BicubicInterpolant constructor");
            PrintCoordinates(nodes, ["x", "y", "z"]);
            console.groupEnd();
        }

        var input = Extrapolate(nodes);

        { // Вывод в консоль экстраполированной матрицы вершин
            console.groupCollapsed("Extrapolated nodes");
            PrintCoordinates(input, ["x", "y", "z"]);
            console.groupEnd();
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

        var x_a = self.x_a;
        var x_b = self.x_b;
        var x_L = self.x_L;
        var x_l = self.x_l;

        var y_a = self.y_a;
        var y_b = self.y_b;
        var y_L = self.x_L;
        var y_l = self.x_l;

        var x_index = math.floor((x_L - (x_b - x_a)) / x_l);
        var y_index = math.floor((y_L - (y_b - y_a)) / y_l);

        var x_index_last = x_index;
        var y_index_last = y_index;

        var x = x_a;
        var y = y_a;

        var x_last = x;
        var y_last = y;

        while (y <= y_b) {
            x = x_a;

            while (x <= x_b) {
                y_index = math.floor((y_L - (y_b - y)) / y_l);
                x_index = math.floor((x_L - (x_b - x)) / x_l);

                if (y_index >= self.y_nodes_count - 1) {
                    y_index = y_index - 1;
                }
                if (x_index >= self.x_nodes_count - 1) {
                    x_index = x_index - 1;
                }

                if (false) {
                    if (y_index != y_index_last) {
                        console.groupCollapsed("Index connected to Y value changed");
                        console.log("Coordinate:", y_last, "→", y);
                        console.log("Index:", y_index_last, "→", y_index);
                        console.groupEnd();
                    }
                    if (x_index != x_index_last) {
                        console.groupCollapsed("Index connected to X value changed");
                        console.log("Coordinate:", x_last, "→", x);
                        console.log("Index:", x_index_last, "→", x_index);
                        console.groupEnd();
                    }
                }

                var surface = self.surfaces[y_index][x_index];

                var z = surface.Interpolate(x, y);

                var particle = {x: x, y: y, z: z};

                vertices.push(particle);

                x_index_last = x_index;
                y_index_last = y_index;

                x_last = x;
                y_last = y;

                x += 0.2;
            }
            y += 0.2;
        }

        console.groupEnd();

        return vertices;
    }

    if (typeof nodes !== 'undefined') {
        self.Build(nodes);
    }
}
