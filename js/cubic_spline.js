function CubicSpline (nodes) {
    var self = this;

    self.Build = function (nodes) {
        self.Initialize(nodes);

        var segments = self.segments;
        var nodes_count = self.nodes_count;
        var segments_count = self.segments_count;

        for (var i = 0; i < segments_count; i++) {
            var xa = nodes[i+1].x;
            var xb = nodes[i+2].x;

            var ya = nodes[i+1].y;
            var yb = nodes[i+2].y;

            var ya_ = (yb - nodes[i+0].y) / 2;
            var yb_ = (nodes[i+3].y - ya) / 2;

            var M = math.matrix([
                [math.pow(xa, 3), math.pow(xa, 2), xa, 1],
                [math.pow(xb, 3), math.pow(xb, 2), xb, 1],
                [3 * math.pow(xa, 2), 2 * xa, 1, 0],
                [3 * math.pow(xb, 2), 2 * xb, 1, 0]
            ]);

            var M_ = math.inv(M);

            var y = math.matrix([
                [ya],
                [yb],
                [ya_],
                [yb_]
            ]);

            var a = math.multiply(M_, y);

            segments[i] = new CubicSegment();

            segments[i].a3 = a._data[0][0];
            segments[i].a2 = a._data[1][0];
            segments[i].a1 = a._data[2][0];
            segments[i].a0 = a._data[3][0];

            segments[i].x_a = xa;
            segments[i].x_b = xb;
        }
    }

    self.Initialize = function (nodes) {
        self.nodes = nodes;

        var segments = self.segments = [];
        var nodes_count = self.nodes_count = nodes.length;
        var segments_count = self.segments_count = nodes_count - 3;
    }

    if (typeof nodes !== 'undefined')
    {
        self.Build(nodes);
    }

    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position) {
        var segments = self.segments;

        if (segments == null)
        {
            return double.NaN; // Если сплайны ещё не построены - возвращаем NaN
        }

        var n = segments.length;
        var s = new CubicSegment();

        if (position <= segments[0].x_a) // Если x меньше точки сетки x[0] - пользуемся первым эл-том массива
        {
            s = segments[0];
        }
        else if (position >= segments[n - 1].x_a) // Если x больше точки сетки x[n - 1] - пользуемся последним эл-том массива
        {
            s = segments[n - 1];
        }
        else // Иначе x лежит между граничными точками сетки - производим бинарный поиск нужного эл-та массива
        {
            var i = 0;
            var j = n - 1;
            while (i + 1 < j)
            {
                // Force to unsigned int32
                var k = (i + (j - i) / 2) >>> 0;
                if (position <= segments[k].x)
                {
                    j = k;
                }
                else
                {
                    i = k;
                }
            }
            s = segments[j];
        }

        var a0 = s.a0;
        var a1 = s.a1;
        var a2 = s.a2;
        var a3 = s.a3;
        var x = position;

        var result = a0 + a1*x + a2*x*x + a3*x*x*x;
        return result;
    }
}
