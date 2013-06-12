function CubicInterpolant (nodes) {
    var self = this;

    self.BuildDimension = function (nodes, markup) {
        var floating = markup.floating || 'x';
        var fixed    = markup.fixed    || 'y';
        var value    = markup.value    || 'z';

        var vertices = [];

        var nodes_along = nodes.flatten().sortBy(floating).groupBy(fixed);

        for (var fixed_coordinate in nodes_along) {
            var current_nodes = nodes_along[fixed_coordinate];

            var nodes_coordinates_only = current_nodes.clone();

            for (var i = 0; i < nodes_coordinates_only.length; i++) {
                var el = nodes_coordinates_only[i];

                var new_el = {x: el[floating], y: el[value]};

                nodes_coordinates_only[i] = new_el;
            }

            self.splines[fixed][fixed_coordinate] = new CubicSpline(nodes_coordinates_only);

            var current_spline = self.splines[fixed][fixed_coordinate];

            var floating_position = current_nodes[0][floating];
            var fixed_position    = fixed_coordinate.toNumber();

            while (floating_position <= current_nodes[current_nodes.length - 1][floating]) {
                var pX = (fixed === 'x') ? fixed_position : floating_position,
                    pY = (fixed === 'y') ? fixed_position : floating_position,
                    pZ = current_spline.Interpolate(floating_position),
                    particle = new THREE.Vector3(pX, pY, pZ);

                vertices.push(particle);

                floating_position += 0.1;
            }
        }

        console.log("'get_vertices' work done");

        return vertices;
    }

    self.Build = function (nodes) {
        var vertices = [];

        var add1 = self.BuildDimension(nodes, {fixed: 'y', floating: 'x', value: 'z'});
        var add2 = self.BuildDimension(nodes, {fixed: 'x', floating: 'y', value: 'z'});

        vertices.add(add1);
        vertices.add(add2);

        return vertices;
    }

    self.splines = {x: [], y: []};

    self.nodes = [];

    if (typeof nodes !== 'undefined')
    {
        self.nodes = nodes;
        self.Build(self.nodes);
    }
}
