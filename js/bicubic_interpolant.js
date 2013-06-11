function BicubicInterpolant (nodes) {
    var self = this;

    self.Build = function (nodes) {
        console.group("Building of BicubicInterpolant");

        { // Вывод в консоль полученной матрицы вершин
            console.groupCollapsed("Received nodes");
            console.log("x values of received nodes:");
            PrintMatrix(nodes, "x");

            console.log("y values of received nodes:");
            PrintMatrix(nodes, "y");

            console.log("z values of received nodes:");
            PrintMatrix(nodes, "z");
            console.groupEnd();
        }

        var countY = nodes.length;
        var countX = nodes[0].length;

        var countY_extra = countY + 2;
        var countX_extra = countX + 2;

        var countY_surfaces = countY - 1;
        var countX_surfaces = countX - 1;

        console.log("Number of surfaces (y * x): " + countY_surfaces + " * " + countX_surfaces);

        var input = Extrapolate(nodes);

        { // Вывод в консоль экстраполированной матрицы вершин
            console.groupCollapsed("Extrapolated nodes");
            console.log("x values of extrapolated nodes:");
            PrintMatrix(input, "x");

            console.log("y values of extrapolated nodes:");
            PrintMatrix(input, "y");

            console.log("z values of extrapolated nodes:");
            PrintMatrix(input, "z");
            console.groupEnd();
        }

        self.surfaces = new Array(countY_surfaces);

        for (var i = 0; i < countY_surfaces; i++) {
            self.surfaces[i] = new Array(countX_surfaces);
        }

        for (var i = 1; i < countY; i++) {
            for (var j = 1; j < countX; j++) {
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
        var a = -10;
        var b =  10;
        var L = b - a;
        var l_x = L / countX_surfaces;
        var l_y = L / countY_surfaces;

        var y = -10;
        while (y <= 10) {
            var x = -10;
            while (x <= 10) {
                var x_index = math.floor((L - (b - x)) / l_x);
                var y_index = math.floor((L - (b - y)) / l_y);

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
