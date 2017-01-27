var sampleString = "\
using UnityEngine;\n\
using System.Collections;\n\
public class sample : MonoBehaviour {\n\
	public struct block {\n\
		public int[][] type;\n\
		public int[][] rotation;\n\
		public int input;\n\
		public int output;\n\
    }\n\
	public block[][] blocks=new block[3][];\n\
	public sample(){\n\
        blocks[0][0].type = new int[2][] {\n\
            new int[]{2,2,1,3,1},\n\
            new int[]{2,2,1,3,1}\n\
        };\n\
        blocks[0][0].rotation = new int[2][] {\n\
            new int[]{1,3,0,0,2},\n\
            new int[]{0,2,1,0,2}\n\
        };\
        blocks[0][0].input = 4;\n\
        blocks[0][0].output = 3;\n\
    }\n\
}";

var constructHead = "\
using UnityEngine;\n\
using System.Collections;\n\
public class sample {\n\
	public struct block {\n\
		public int[][] type;\n\
		public int[][] rotation;\n\
    }\n\
	public int[,] setInfo=new int[{{blockTypesNumber}},3];\n\
	public block[,] blocks=new block[{{blockTypesNumber}},{{maxBlocksInSet}}];\n\
	public int block_i={{blockTypesNumber}},block_j={{maxBlocksInSet}};\n\
	public sample(){\n";
var constructBodyType = "		blocks[{{typeIndex}},{{blockIndex}}].type = new int[{{rowNumbers}}][] {\n";
var constructBodyRow = "			new int[]{";
var constructEnd = "};\n";
var constructBodyRotation = "		blocks[{{typeIndex}},{{blockIndex}}].rotation = new int[{{rowNumbers}}][] {\n";
var blocksTypeInfo = "		setInfo[{{typeIndex}}, 0] = {{input}};\n		setInfo[{{typeIndex}}, 1] = {{output}};\n		setInfo[{{typeIndex}}, 2] = {{blocksCount}};\n\n";

var indexOf = function (input, output) {
	return 1;
}

var readBlock = function (block) {
	var x = block.type[0].length;
	var y = block.type.length;
	var entry = block.input;
	var outry = block.output;
	//read from block data and put in inputs
	$("#x").val(x);
	$("#y").val(y);
	$("#entry").val(entry);
	$("#outry").val(outry);
	scene.refresh();
	var l = x * y;
	var modules = $("#scene .module");
	for (var i = 0; i < y; i++) {
		//if row doesn't exist add a row
		for (var j = 0; j < x; j++) {
			var m = modules[i * x + j];
			sceneMaker.changeType(m, block.type[i][j]);
			rotate(m, block.rotation[i][j]);
		}

	}
}
var writeBlock = function (block, data) {
	if (data) {
		
	} else {
		var x = $("#x").val();
		var y = $("#y").val();
		var entry = $("#entry").val();
		var outry = $("#outry").val();

		var l = x * y;
		var modules = $("#scene .module");
		for (var i = 0; i < y; i++) {
			//if row doesn't exist add a row
			if (block.type[i] == undefined) {
				block.type[i] = new Array(parseInt(x));
				block.rotation[i] = new Array(parseInt(x));
			}
			for (var j = 0; j < x; j++) {
				var m = modules[i * x + j];
				var r = $(m).attr("data-rotate");
				if (r == undefined) r = 0;
				var t = $(m).attr("data-type");
				block.type[i][j] = t;
				block.rotation[i][j] = r;
			}
		}
		while (block.type.length > y) {
			block.type.pop();
			block.rotation.pop();
		}
	}

}

var blockSample = function (set) {
	return new function () {
		var block = this;
		this.index = function () {
			if (set == undefined) return 0;
			return block.set.array.indexOf(block);
		};
		this.typeIndex = function () {
			if (set == undefined) return 0;
			return block.set.index();
		}
		this.set = set;
		this.type = [
			//row
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		];
		this.rotation = [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		];
		this.input = 62;
		this.output = 62;

		if (block.set) {
			block.input = block.set.input;
			block.output = block.set.output;
			var _emptyBlockArray = function (n, m) {
				var arr = new Array(n);
				for (var i = 0; i < n; i++) {
					arr[i] = new Array(m);
					for (var j = 0; j < m; j++) {
						arr[i][j] = 0;
					}
				}
				return arr;
			}
			block.type = _emptyBlockArray(2, block.set.x);
			block.rotation = _emptyBlockArray(2, block.set.x);
		}
		this.code = function (typeIndex, blockIndex) {
			/*
			blocks[0,0].type = new int[2][] {
				new int[]{2,2,1,3,1},
				new int[]{2,2,1,3,1}
			};\
			blocks[0,0].rotation = new int[2][] {
				new int[]{1,3,0,0,2},
				new int[]{0,2,1,0,2}
			};\
			*/
			var codeBlock = "";
			if (typeIndex == undefined) {
				var typeIndex = block.typeIndex();
			}
			if (blockIndex == undefined) {
				var blockIndex = block.index();
			}

			codeBlock = S(constructBodyType).template({
				typeIndex: typeIndex,
				blockIndex: blockIndex,
				rowNumbers: block.type.length
			}).s;
			for (var i = 0; i < block.type.length; i++) {
				codeBlock += constructBodyRow + block.type[i].join(',') + '}';
				if (i != block.type.length - 1) codeBlock += ',\n';
				else codeBlock += '\n';
			}
			codeBlock += '		' + constructEnd;
			codeBlock += S(constructBodyRotation).template({
				typeIndex: typeIndex,
				blockIndex: blockIndex,
				rowNumbers: block.type.length
			}).s;
			for (var i = 0; i < block.type.length; i++) {
				codeBlock += constructBodyRow + block.rotation[i].join(',') + '}';
				if (i != block.type.length - 1) codeBlock += ',\n';
				else codeBlock += '\n';
			}
			codeBlock += '		' + constructEnd;
			return codeBlock;
		}
		this.read = function () {
			readBlock(block);
		}
		this.write = function (data) {
			writeBlock(block, data);
		}
		this.ui = {
			el: undefined,
			make: function () {
				var tmp = $(".blockThumb.template").clone().removeClass("template");
				tmp[0].block = block;
				block.set.ui.el.find(".sections").append(tmp);
				tmp.click(function () {
					block.set.select(block);
				});
				block.ui.el = tmp;
			}
		}
		this.remove = function () {
			if (window._selectedBlock == block) {
				block.set.clearSelection();
				sceneMaker.build();
			}
			block.set.removeBlock(block);
			block.ui.el.remove();
		}
	}
}
var blocksSample = [
	//block type set
	[
		//block type
		{
			type: [
				//row
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0]
			],
			rotation: [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0]
			],
			input: 62,
			output: 62,
			code: function () {

			}
		}
	]
]
var blocksTree = [
	//block type set
	[
		//block type
		{
			type: [
				//row
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0]
			],
			rotation: [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0]
			],
			input: 62,
			output: 62
		}
	]
]

var construction = {
	parts: {

	},
	head: function () {
		return "";
	},
	types: {
		get: function () {
			return "blockType";
		},
		set: function (number) {
			var string = S(construction.head()).template({
				blocksTypeNumber: number
			}).s;

		}
	}
}

var blockSet = function (arr, input, output, x, type) {
	var splitter = ',';
	var that = this;
	this.array = [];
	this.length = function () {
		return that.array.length;
	};
	if (arr != undefined && arr.length) {
		this.array = arr;
	}
	this.input = input;
	this.output = output;
	this.x = x;
	if (x == undefined) {
		this.x = 5;
	}
	if (type == undefined) {
		this.type = this.input + splitter + this.output;
	} else {
		this.input = this.type.split(splitter)[0];
		this.output = this.type.split(splitter)[1];
	}
	this.index = function () {
		return blocks.sets.indexOf(that);
	}
	this.add = function (block) {

	}
	this.makeBlock = function (data) {
		var block = blockSample(that);
		block.write(data);
		that.array.push(block);
		that.ui.el.find(".number-ind").text(that.array.length);
		blocks.updateBlocksNumber(that.array.length);
		block.ui.make();
		return block;
	}
	this.code = function () {
		var typeIndex = that.index();
		var result = "";
		result += S(blocksTypeInfo).template({
				typeIndex: typeIndex,
				input: that.input,
				output: that.output,
				blocksCount:  that.length()
			}).s;
		for (var i = 0; i < that.length(); i++) {
			
			result += that.array[i].code(typeIndex, i);
		}
		return result;
	}
	this.selectedBlock = undefined;
	this.select = function (block, read) {

		if (window._selectedBlock != undefined) {
			window._selectedBlock.set.clearSelection();
		}
		if (typeof block == "number") {
			//select by index
			window._selectedBlock = that.array[block];
		} else {
			if (that.array.indexOf(block) != -1) {
				window._selectedBlock = block;
			} else {
				throw "can't select a block that's not in set";
			}
		}
		if (read !== false) {
			window._selectedBlock.read();
		}
		window._selectedBlock.ui.el.addClass("selected");
		that.selectedBlock = block;
	}
	this.clearSelection = function () {
		window._selectedBlock.ui.el.removeClass("selected");
		window._selectedBlock = undefined;
		that.selectedBlock = undefined;
	}
	this.ui = {
		el: undefined,
		make: function () {
			var setUi = $(".wayGroup li[data-type='TT']".replace("TT", that.type));
			if (setUi.length == 0) {
				setUi = $(".set.template").clone().removeClass("template").appendTo(".wayGroup").attr("data-type", that.type);

				var input = parseInt(that.input).toString(2);
				var output = parseInt(that.output).toString(2);

				while (input.length < that.x) input = '0' + input;
				while (output.length < that.x) output = '0' + output;
				for (var i = 0; i < that.x; i++) {
					var ou = "",
						en = "";
					if (input[i] == 1) en = "on";
					if (output[i] == 1) ou = "on";
					setUi.find(".input-inds").append($("<div>").addClass("input-ind").addClass(en));
					setUi.find(".output-inds").append($("<div>").addClass("output-ind").addClass(ou));
				}
			}
			that.ui.el = setUi;

			return setUi;
		}

	}
	that.ui.make();
	this.removeBlock = function (block) {
		that.array.splice(that.array.indexOf(block), 1);
		that.ui.el.find(".number-ind").text(that.array.length);
		blocks.updateBlocksNumber(that.array.length);
	}
}
var blocks = {
	exportCode: function () {
		var result = S(constructHead).template({
			blockTypesNumber: blocks.sets.length,
			maxBlocksInSet: blocks.maxBlocks
		}).s;

		for (var i = 0; i < blocks.sets.length; i++) {
			result += blocks.sets[i].code();
		}
		return result + '	' + constructEnd + constructEnd;
	},
	sets: [],
	typeMap: {},
	makeSet: function (entry, outry) {
		if (arguments.length == 0) {
			var entry = $("#entry").val();
			var outry = $("#outry").val();
		}
		var type = blocks.makeType(entry, outry);
		var set = new blockSet([], entry, outry);
		blocks.sets.push(set);
		blocks.typeMap[type] = set;
		return set;
	},
	getSet: function (entry, outry) {
		var set = blocks.typeMap[blocks.makeType(entry, outry)]
		if (set) {
			return set;
		} else return false;
	},
	makeType: function (entry, outry) {
		var splitter = ',';

		var type = entry + splitter + outry;
		return type;

	},
	clear: function () {
		for (var i = 0;i < blocks.sets.length; i++) {
			blocks.sets[i].ui.el.remove();
		}
		blocks.sets = [];
		blocks.typeMap = {};
	},
	updateBlocksNumber: function (num) {
		if (blocks.maxBlocks < num) {
			blocks.maxBlocks = num;
		}
	},
	maxBlocks: 0
}