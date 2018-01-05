/**
         * Creates a soft box mesh.
		 * A softbox is for use with the softbody physics of Ammo.js as it increases the number of vertices per side.
         * The parameter `size` sets the size (float) of each box side (default 1).
         * You can set some different box dimensions by using the parameters `width`, `height` and `depth` (all by default have the same value than `size`).
         * You can set different colors and different images to each box side by using the parameters `faceColors` (an array of 6 Color3 elements) and `faceUV` (an array of 6 Vector4 elements).
         * Please read this tutorial : http://doc.babylonjs.com/tutorials/CreateBox_Per_Face_Textures_And_Colors
         * You can also set the mesh side orientation with the values : BABYLON.Mesh.FRONTSIDE (default), BABYLON.Mesh.BACKSIDE or BABYLON.Mesh.DOUBLESIDE
         * If you create a double-sided mesh, you can choose what parts of the texture image to crop and stick respectively on the front and the back sides with the parameters `frontUVs` and `backUVs` (Vector4).
         * Detail here : http://doc.babylonjs.com/tutorials/02._Discover_Basic_Elements#side-orientation
         * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created.
         */
		 
		 /* Creates the VertexData of the Box.
         */
        VertexDataCreateSoftBox = function (options) {
            var normalsSource = [
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(-1, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, -1, 0)
            ];
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
			var faceUV = options.faceUV || new Array(6);
            var faceColors = options.faceColors;
            var width = options.width || options.size || 1;
            var height = options.height || options.size || 1;
            var depth = options.depth || options.size || 1;
			var lineDensity = options.lineDensity || 1;
			var dimensions = [
				[width, depth],
				[depth, height],
				null,
				[height, width]
			];
			var dimsIndex = 0;
            var sideOrientation = (options.sideOrientation === 0) ? 0 : options.sideOrientation || BABYLON.Mesh.DEFAULTSIDE;
            var colors = [];
            // default face colors and UV if undefined
            for (var f = 0; f < 6; f++) {
                if (faceUV[f] === undefined) {
                    faceUV[f] = new BABYLON.Vector4(0, 0, 1, 1);
                }
                if (faceColors && faceColors[f] === undefined) {
                    faceColors[f] = new BABYLON.Color4(1, 1, 1, 1);
                }
            }
            var scaleVector = new BABYLON.Vector3(width / 2, height / 2, depth / 2);
            // Create each face in turn.
            for (var index = 0; index < normalsSource.length; index++) {				
				var posLen = positions.length / 3;				
                var normal = normalsSource[index];
                // Get two vectors perpendicular to the face normal and to each other.
                var side1 = new BABYLON.Vector3(normal.y, normal.z, normal.x);
                var side2 = BABYLON.Vector3.Cross(normal, side1);
				dimsIndex = -4 * side2.x - 2 * side2.y - side2.z - 1;				
				var side1Length = dimensions[dimsIndex][0];
				var side2Length = dimensions[dimsIndex][1];
				var stepsSide1 = Math.round(side1Length * lineDensity);
				var stepsSide2 = Math.round(side2Length * lineDensity);
				var side1Sum = side1.x + side1.y + side1.z;
				var side2Sum = side2.x + side2.y + side2.z;				
				var startVertex = normal.subtract(side1).subtract(side2).multiply(scaleVector);
				
				for (row = 0; row <= stepsSide1; row++) {
					for (col = 0; col <= stepsSide2; col++) { 
						var position = startVertex.add(side1.scale(row * side1Length / stepsSide1)).add(side2.scale(col * side2Length / stepsSide2))						
						positions.push(position.x, position.y, position.z);
						normals.push(normal.x, normal.y, normal.z);
						uvs.push(faceUV[index].x + (faceUV[index].z - faceUV[index].x) * row / stepsSide1);
						uvs.push(faceUV[index].y + (faceUV[index].w - faceUV[index].y) * col  / stepsSide2);						
						if (faceColors) {
							colors.push(faceColors[index].r, faceColors[index].g, faceColors[index].b, faceColors[index].a);
						}
					}					
				}
				
				for (row = 0; row < stepsSide1; row++) {
					for (col = 0; col < stepsSide2; col++) {

						indices.push(col + row * (stepsSide2 + 1) + posLen);
						indices.push(col + 1 + (row + 1) * (stepsSide2 + 1) + posLen);
						indices.push(col + (row + 1) * (stepsSide2 + 1) + posLen);
						indices.push(col + row * (stepsSide2 + 1) + posLen);
						indices.push(col + 1 + row * (stepsSide2 + 1) + posLen);
						indices.push(col + 1 + (row + 1) * (stepsSide2 + 1) + posLen);
					}
				}				
			}
			
				// Result
			var vertexData = new BABYLON.VertexData();;
			vertexData.indices = indices;
			vertexData.positions = positions;
			vertexData.normals = normals;
			vertexData.uvs = uvs;
			if (faceColors) {
				var totalColors = (sideOrientation === BABYLON.Mesh.DOUBLESIDE) ? colors.concat(colors) : colors;
				vertexData.colors = totalColors;
			}			
			return vertexData;
		}
		
        CreateSoftBox = function (name, options, scene) {
            if (scene === void 0) { scene = null; }
            var box = new BABYLON.Mesh(name, scene);
            options.sideOrientation = BABYLON.MeshBuilder.updateSideOrientation(options.sideOrientation);
            box._originalBuilderSideOrientation = options.sideOrientation;
            var vertexData = VertexDataCreateSoftBox(options);
            vertexData.applyToMesh(box, options.updatable);
            return box;
		}
		
		
		BABYLON.Mesh.prototype.minimizeVertices = function() {

        var _pdata = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var _ndata = this.getVerticesData(BABYLON.VertexBuffer.NormalKind);
		var _uvdata = this.getVerticesData(BABYLON.VertexBuffer.UVKind);
        var _idata = this.getIndices();    

        var _newPdata = []; //new positions array
        var _newIdata =[]; //new indices array
		var _newUVdata = []; // new UVs array;

        var _mapPtr =0; // new index;
        var _uniquePositions = []; // unique vertex positions
        for(var _i=0; _i<_idata.length; _i+=3) {
            var _facet = [_idata[_i], _idata[_i + 1], _idata[_i+2]]; //facet vertex indices
            var _pstring = []; //lists facet vertex positions (x,y,z) as string "xyz""
            for(var _j = 0; _j<3; _j++) { //
                _pstring[_j] = "";
                for(var _k = 0; _k<3; _k++) {
                    //small values make 0
                    if (Math.abs(_pdata[3*_facet[_j] + _k]) < 0.0001) {
                        _pdata[3*_facet[_j] + _k] = 0;
                    }
                    _pstring[_j] += _pdata[3*_facet[_j] + _k] + "|";
                }
                _pstring[_j] = _pstring[_j].slice(0, -1);        
            }
            //check facet vertices to see that none are repeated
            // do not process any facet that has a repeated vertex, ie is a line
            if(!(_pstring[0] == _pstring[1] || _pstring[0] == _pstring[2] || _pstring[1] == _pstring[2])) {        
                //for each facet position check if already listed in uniquePositions
                // if not listed add to uniquePositions and set index pointer
                // if listed use its index in uniquePositions and new index pointer
                for(var _j = 0; _j<3; _j++) { 
                    var _ptr = _uniquePositions.indexOf(_pstring[_j])
                    if(_ptr < 0) {
                        _uniquePositions.push(_pstring[_j]);
                        _ptr = _mapPtr++;
                        //not listed so add individual x, y, z coordinates to new positions array newPdata
                        //and add matching UV data to new UV array newUVdata
                        for(var _k = 0; _k<3; _k++) {
                            _newPdata.push(_pdata[3*_facet[_j] + _k]);
                        }
						for(var _k = 0; _k<2; _k++){
							_newUVdata.push(_uvdata[2*_facet[_j] + _k]);
						}
                    }
                    // add new index pointer to new indices array newIdata
                    _newIdata.push(_ptr);
                }
            }
        }

        _newNdata =[]; //new normal data

        BABYLON.VertexData.ComputeNormals(_newPdata, _newIdata, _newNdata);

        //create new vertex data object and update
        var _vertexData = new BABYLON.VertexData();
        _vertexData.positions = _newPdata;
        _vertexData.indices = _newIdata;
        _vertexData.normals = _newNdata;
		_vertexData.uvs = _newUVdata;

        _vertexData.applyToMesh(this, true);

    }
        
			