function BicubicSurface (nodes) {
    var self = this;

    var a00;
    var a01;
    var a02;
    var a03;

    var a10;
    var a11;
    var a12;
    var a13;

    var a20;
    var a21;
    var a22;
    var a23;

    var a30;
    var a31;
    var a32;
    var a33;

    self.Build = function (p) {
        if (false) {
            a00 = p[1][1];
            a01 = -.5*p[1][0] + .5*p[1][2];
            a02 = p[1][0] - 2.5*p[1][1] + 2*p[1][2] - .5*p[1][3];
            a03 = -.5*p[1][0] + 1.5*p[1][1] - 1.5*p[1][2] + .5*p[1][3];

            a10 = -.5*p[0][1] + .5*p[2][1];
            a11 = .25*p[0][0] - .25*p[0][2] - .25*p[2][0] + .25*p[2][2];
            a12 = -.5*p[0][0] + 1.25*p[0][1] - p[0][2] + .25*p[0][3] + .5*p[2][0] - 1.25*p[2][1] + p[2][2] - .25*p[2][3];
            a13 = .25*p[0][0] - .75*p[0][1] + .75*p[0][2] - .25*p[0][3] - .25*p[2][0] + .75*p[2][1] - .75*p[2][2] + .25*p[2][3];

            a20 = p[0][1] - 2.5*p[1][1] + 2*p[2][1] - .5*p[3][1];
            a21 = -.5*p[0][0] + .5*p[0][2] + 1.25*p[1][0] - 1.25*p[1][2] - p[2][0] + p[2][2] + .25*p[3][0] - .25*p[3][2];
            a22 = p[0][0] - 2.5*p[0][1] + 2*p[0][2] - .5*p[0][3] - 2.5*p[1][0] + 6.25*p[1][1] - 5*p[1][2] + 1.25*p[1][3] + 2*p[2][0] - 5*p[2][1] + 4*p[2][2] - p[2][3] - .5*p[3][0] + 1.25*p[3][1] - p[3][2] + .25*p[3][3];
            a23 = -.5*p[0][0] + 1.5*p[0][1] - 1.5*p[0][2] + .5*p[0][3] + 1.25*p[1][0] - 3.75*p[1][1] + 3.75*p[1][2] - 1.25*p[1][3] - p[2][0] + 3*p[2][1] - 3*p[2][2] + p[2][3] + .25*p[3][0] - .75*p[3][1] + .75*p[3][2] - .25*p[3][3];

            a30 = -.5*p[0][1] + 1.5*p[1][1] - 1.5*p[2][1] + .5*p[3][1];
            a31 = .25*p[0][0] - .25*p[0][2] - .75*p[1][0] + .75*p[1][2] + .75*p[2][0] - .75*p[2][2] - .25*p[3][0] + .25*p[3][2];
            a32 = -.5*p[0][0] + 1.25*p[0][1] - p[0][2] + .25*p[0][3] + 1.5*p[1][0] - 3.75*p[1][1] + 3*p[1][2] - .75*p[1][3] - 1.5*p[2][0] + 3.75*p[2][1] - 3*p[2][2] + .75*p[2][3] + .5*p[3][0] - 1.25*p[3][1] + p[3][2] - .25*p[3][3];
            a33 = .25*p[0][0] - .75*p[0][1] + .75*p[0][2] - .25*p[0][3] - .75*p[1][0] + 2.25*p[1][1] - 2.25*p[1][2] + .75*p[1][3] + .75*p[2][0] - 2.25*p[2][1] + 2.25*p[2][2] - .75*p[2][3] - .25*p[3][0] + .75*p[3][1] - .75*p[3][2] + .25*p[3][3];
        } else {
            var nodes_count = p.length;
            var segments_count = nodes_count - 1;

            console.groupCollapsed("Nodes received by CubicSpline builder");
            console.log("x values of received nodes");
            PrintMatrix(p, "x");

            console.log("y values of received nodes");
            PrintMatrix(p, "y");

            console.log("z values of received nodes");
            PrintMatrix(p, "z");
            console.groupEnd();

            for (var i = 0; i < nodes_count; i++) {
                for (var j = 0; j < p[i].length; j++) {
                    p[i][j] = {x: p[i][j].x, y: p[i][j].z};
                }

                self.splines[i] = new CubicSpline(p[i]);
            }
        }
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;

        self.splines = [];

        self.Build(self.nodes);
    }

    self.Interpolate = function (x, y) {
        if (false) {
            var x2 = x * x;
            var x3 = x2 * x;
            var y2 = y * y;
            var y3 = y2 * y;

            return (a00 + a01 * y + a02 * y2 + a03 * y3) +
                   (a10 + a11 * y + a12 * y2 + a13 * y3) * x +
                   (a20 + a21 * y + a22 * y2 + a23 * y3) * x2 +
                   (a30 + a31 * y + a32 * y2 + a33 * y3) * x3;
        } else {
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

            return result;
        }
    }
}
