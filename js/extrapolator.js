function Extrapolate (nodes) {
    console.group("extrapolation started");

    var watch_coordinate = "z";

    console.log("values of received nodes:");
    PrintMatrix(nodes, watch_coordinate);

    var countY = nodes.length;
    var countX = nodes[0].length;

    var countY_extra = countY + 2;
    var countX_extra = countX + 2;

    console.log("initial nodes (y * x): " + countY + " * " + countX);
    console.log("extrapolated nodes (y * x): " + countY_extra + " * " + countX_extra);

    var input = new Array(countY_extra);

    for (var i = 0; i < countY_extra; i++) {
        input[i] = new Array(countX_extra);
    }

    console.log("empty matrix of extrapolated nodes");
    PrintMatrix(input, watch_coordinate);

    for (var i = 0; i < countY; i++) {
        for (var j = 0; j < countX; j++) {
            // Copying elements
            input[i + 1][j + 1] = nodes[i][j];

            // Initializing not yet existing elements

            if (i == 0) {
                input[i][j + 1] = {x: 0, y: 0, z: 0};
            }

            if (i == (countY - 1)) {
                input[countY + 1][j + 1] = {x: 0, y: 0, z: 0};
            }

            if (j == 0) {
                input[i + 1][j] = {x: 0, y: 0, z: 0};
            }

            if (j == (countX - 1)) {
                input[i + 1][countX + 1] = {x: 0, y: 0, z: 0};
            }
        }
    }

    console.log("partially zero-filled matrix of extrapolated nodes");
    PrintMatrix(input, watch_coordinate);

    // Initializing elements at corners
    input[         0][         0] = {x: 0, y: 0, z: 0};
    input[         0][countX + 1] = {x: 0, y: 0, z: 0};
    input[countY + 1][         0] = {x: 0, y: 0, z: 0};
    input[countY + 1][countX + 1] = {x: 0, y: 0, z: 0};

    console.log("fully zero-filled matrix of extrapolated nodes");
    PrintMatrix(input, watch_coordinate);

    for (var i = 0; i < countY_extra; i++) {
        for (var j = 0; j < countX_extra; j++) {
            var v1;
            var v2;
            var vector;
            var boundary = false;

            // Extrapolating to the top
            // Extrapolating along the -Y axis
            if (i == 0) {
                v1 = input[i + 1][j];
                v2 = input[i + 2][j];

                boundary = true;
            }

            // Extrapolating to the left
            // Extrapolating along the -X axis
            if (j == 0) {
                v1 = input[i][j + 1];
                v2 = input[i][j + 2];

                boundary = true;
            }

            // Extrapolating to the right
            // Extrapolating along the X axis
            if (j == (countX_extra - 1)) {
                v1 = input[i][j - 1];
                v2 = input[i][j - 2];

                boundary = true;
            }

            // Extrapolating to the bottom
            // Extrapolating along the Y axis
            if (i == (countY_extra - 1)) {
                v1 = input[i - 1][j];
                v2 = input[i - 2][j];

                boundary = true;
            }

            if (boundary) {
                var vector = {x: 0, y: 0, z: 0};

                vector.x = v1.x + v1.x - v2.x;
                vector.y = v1.y + v1.y - v2.y;
                vector.z = v1.z + v1.z - v2.z;

                input[i][j] = vector;

                boundary = false;
            }
        }
    }

    console.log("coordinate filled matrix of extrapolated nodes");
    PrintMatrix(input, watch_coordinate);

    // Upper-left corner should be handled separately
    // Because it can't get it's right values in the for-loop above
    input[0][0].x = input[0][1].x + input[0][1].x - input[0][2].x;
    input[0][0].y = input[0][1].y + input[0][1].y - input[0][2].y;

    {
        var v1  = input[0][1];
        var v10 = input[0][2];
        var v2  = input[1][0];
        var v20 = input[2][0];

        var z = ((v1.z + v1.z - v10.z) + (v2.z + v2.z - v20.z)) / 2;

        input[0][0].z = z;
    }

    {
        var v1  = input[0][countX_extra - 2];
        var v10 = input[0][countX_extra - 3];
        var v2  = input[1][countX_extra - 1];
        var v20 = input[2][countX_extra - 1];

        var z = ((v1.z + v1.z - v10.z) + (v2.z + v2.z - v20.z)) / 2;

        input[0][countX_extra - 1].z = z;
    }

    {
        var v1  = input[countY_extra - 2][0];
        var v10 = input[countY_extra - 3][0];
        var v2  = input[countY_extra - 1][1];
        var v20 = input[countY_extra - 1][2];

        var z = ((v1.z + v1.z - v10.z) + (v2.z + v2.z - v20.z)) / 2;

        input[countY_extra - 1][0].z = z;
    }

    {
        var v1  = input[countY_extra - 2][countX_extra - 1];
        var v10 = input[countY_extra - 3][countX_extra - 1];
        var v2  = input[countY_extra - 1][countX_extra - 2];
        var v20 = input[countY_extra - 1][countX_extra - 3];

        var z = ((v1.z + v1.z - v10.z) + (v2.z + v2.z - v20.z)) / 2;

        input[countY_extra - 1][countX_extra - 1].z = z;
    }

    console.log("values of output nodes:");
    PrintMatrix(input, watch_coordinate);

    console.groupEnd();

    return input;
}
