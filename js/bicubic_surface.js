function BicubicSurface (nodes) {
    var self = this;

    self.Build = function (p) {
        var y_nodes_count = p.length;
        var x_nodes_count = p[0].length;

        var y_segments_count = y_nodes_count - 1;
        var x_segments_count = x_nodes_count - 1;

        { // Вывод в консоль полученной матрицы вершин
            console.groupCollapsed("Nodes received by BicubicSurface builder");
            PrintCoordinates(p, ["x", "y", "z"]);
            console.groupEnd();
        }

        var cubic_nodes = self.cubic_nodes = [];

        for (var i = 0; i < y_nodes_count; i++) {
            cubic_nodes[i] = [];

            for (var j = 0; j < x_nodes_count; j++) {
                cubic_nodes[i][j] = {x: p[i][j].x, y: p[i][j].z};
            }
        }

        for (var i = 0; i < y_nodes_count; i++) {
            for (var j = 0; j < x_nodes_count; j++) {
                self.splines[i] = new CubicSpline(cubic_nodes[i]);
            }
        }
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;

        self.cubic_nodes = [];

        self.splines = [];

        self.Build(self.nodes);
    }

    self.Interpolate = function (x, y) {
        var ar = [];

        for (var i = 0; i < self.splines.length; i++) {
            var interpolation_result = self.splines[i].Interpolate(x);

            if (interpolation_result == NaN) {
                break;
            }

            var x_value = self.nodes[i][0].y;
            var y_value = interpolation_result;

            ar[i] = {x: x_value, y: y_value};
        }

        var spline = new CubicSpline(ar);
        var result = spline.Interpolate(y);

        if (false) {
            console.groupCollapsed("Interpolation at ["+y+","+x+"] node");
            PrintMatrix(ar);
            console.log("result:", result);
            console.groupEnd();
        }

        return result;
    }
}
