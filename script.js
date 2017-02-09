var sceneMaker = {
	build: function () {
		var x = $("#x").val();
		var y = $("#y").val();
		var entry = $("#entry").val();
		var outry = $("#outry").val();
		for (var i = 1; i < 10; i++) {
			$("#scene").removeClass("cols-" + i);
		}
		$("#scene").addClass("cols-" + x);

		if (x == "") {
			x = 5;
			$("#x").val(5);
		}
		if (y == "") {
			y = 2;
			$("#y").val(2);
		}

		var modules = $("#scene .module");
		var dif = x * y - modules.length;
		if (dif > 0) {
			for (; dif > 0; dif--) {
				moduleClickFunc($(".module.template").clone().removeClass("template").appendTo("#scene"));
			}
		} else if (dif < 0) {
			for (; dif < 0; dif++) {
				$(modules[modules.length - 1]).remove();
				var modules = $("#scene .module");
			}
		}

		sceneMaker.type.sync();
	},
	type: {
		get: function () {
			var x = $("#x").val();
			var first5 = $("#scene .module").slice(0, x);
			var last5 = $("#scene .module").slice(-x);
			var entry = '';
			var outry = ''
			first5.each(function () {
				if (sceneMaker.type.canExit(this)) {
					outry += '1';
				} else {
					outry += '0';
				}
			});
			last5.each(function () {
				if (sceneMaker.type.canEnter(this)) {
					entry += '1';
				} else {
					entry += '0';
				}
			});
			return [entry, outry];
		},
		set: function (entry, outry) {
			try {
				$("#entry").val(parseInt(entry, 2));
			} catch (e) {
				//do nothing
			}
			try {
				$("#outry").val(parseInt(outry, 2));
			} catch (e) {
				//do nothing
			}
		},
		sync: function () {
			var data = sceneMaker.type.get();
			sceneMaker.type.set(data[0], data[1]);
		},
		canEnter: function (module) {
			var type, rotation;
			type = $(module).attr("data-type").slice(-1);
			rotation = $(module).attr("data-rotate");
			if (type == 0) return true;
			else if (type == 1 && rotation != 3) return true;
			else if (type == 2 && rotation % 2 != 0) return true;
			else if (type == 3 && rotation < 2) return true;
			else if (type == 4 && rotation == 1) return true;
			else return false;
		},
		canExit: function (module) {
			var type, rotation;
			type = $(module).attr("data-type").slice(-1);
			rotation = $(module).attr("data-rotate");
			if (type == 0) return true;
			else if (type == 1 && rotation != 1) return true;
			else if (type == 2 && rotation % 2 != 0) return true;
			else if (type == 3 && rotation > 1) return true;
			else if (type == 4 && rotation == 3) return true;
			else return false;
		}
	},
	select: function (module) {
		$(module).addClass("selected");
		if ($("#scene").hasClass("active")) {

		} else {
			sceneMaker.activate();

		}
	},
	deselect: function (module) {
		$(module).removeClass("selected");
	},
	activate: function () {
		$("#scene").addClass("active");
		$("footer").addClass("active");
		sceneMaker.attachEvents();
	},
	deactivate: function () {
		$("#scene").removeClass("active");
		$("footer").removeClass("active");
		sceneMaker.detachEvents();
	},
	changeType: function (module, type) {
		$(module).attr("data-type", type);
		$(module).trigger("alter");
	},
	move: function (direction) {

	},
	addRow: function () {
		$("#y").val(parseInt($("#y").val()) + 1);
		scene.refresh();	
	},
	removeRow: function () {
		$("#y").val(parseInt($("#y").val()) - 1);
		scene.refresh();	
	},
	attachEvents: function () {
		var eventHandler = function (e) {
			var module = $("#scene .module.selected");
			if (e.keyCode == 49) {
				sceneMaker.changeType(module, 0);
			} else if (e.keyCode == 50) {
				sceneMaker.changeType(module, 1);
			} else if (e.keyCode == 51) {
				sceneMaker.changeType(module, 2);
			} else if (e.keyCode == 52) {
				sceneMaker.changeType(module, 3);
			} else if (e.keyCode == 53) {
				sceneMaker.changeType(module, 4);
			} else if (e.keyCode == 82) {
				rotate(module);
			} else if (e.keyCode == 39) {
				if (module.next().length) {
					sceneMaker.select(module.next());
					sceneMaker.deselect(module);
				}

			} else if (e.keyCode == 37) {
				if (module.prev().length) {
					sceneMaker.select(module.prev());
					sceneMaker.deselect(module);
				}
			} else if (e.keyCode == 38) {
				var x = $("#x").val();
				var possibles = module.prevAll();
				if (possibles.length >= x) {
					sceneMaker.deselect(module);
					sceneMaker.select(possibles[x - 1]);
				}
			} else if (e.keyCode == 40) {
				var x = $("#x").val();
				var possibles = module.nextAll();
				if (possibles.length >= x) {
					sceneMaker.deselect(module);
					sceneMaker.select(possibles[x - 1]);
				} else {
					$("#y").val(parseInt($("#y").val()) + 1);
					scene.refresh();
					possibles = module.nextAll();
					sceneMaker.deselect(module);
					sceneMaker.select(possibles[x - 1]);
				}
			} else if (e.keyCode == 187) {
				$("#y").val(parseInt($("#y").val()) + 1);
				scene.refresh();
			} else if (e.keyCode == 189) {
				$("#y").val(parseInt($("#y").val()) - 1);
				scene.refresh();
			} else if (e.keyCode == 219) {
				$("#x").val(parseInt($("#x").val()) - 1);
				scene.refresh();
			} else if (e.keyCode == 221) {
				$("#x").val(parseInt($("#x").val()) + 1);
				scene.refresh();
			}


		}
		$("body").on("keydown", eventHandler);
		$("body")[0].detachKeyboardControls = function () {
			$("body").off("keydown", eventHandler)
		}
	},
	detachEvents: function () {
		$("body")[0].detachKeyboardControls();
	}
}
var scene = {
	refresh: function () {
		sceneMaker.build();
	},
	save: function (makeNew) {
		var set, block;
		//does set exist ?
		var entry = $("#entry").val();
		var outry = $("#outry").val();
		set = blocks.getSet(entry, outry);
		//yes
		if (set) {
			block = set.selectedBlock;
		}
		//no
		else {
			var set = blocks.makeSet();
			if (window._selectedBlock != undefined && makeNew != true) {
				window._selectedBlock.remove();
			}
			block = false;
		}

		//does block exist? 
		//yes
		if (block && makeNew != true) {
			block.write();
		} else {
			if (window._selectedBlock != undefined && makeNew != true) {
				window._selectedBlock.remove();
			}
			var b = set.makeBlock();
			set.select(b, false);
		}
	},
	readAll: function (clean) {
		if (clean) {
			blocks.clear();
		}
		
		var all = S(allCode.getValue());
		var firstIndex = all.s.indexOf("sample(){") + ("sample(){").length;
		var lastIndex = all.s.lastIndexOf('}');
		lastIndex = all.s.lastIndexOf('}', lastIndex-1);
		var blocksData = all.s.slice(firstIndex, lastIndex);
		var blockSetNumber = all.between("public block[,] blocks=new block[",",").s;
		
		var blocksDataArray = blocksData.split(';');
		var blockTypeData,
			blockRotateData,
			setInputData,
			setOutputData,
			setBlocksNumber,
			blockSet,
			setInput,
			setOutput,
			setType,
			setNumber,
			typeArrays,rotateArrays,y,x;
		
		setNumber = S(blocksData).count("setInfo") / 3;
		var blocksNumber = parseInt((blocksDataArray.length - setNumber * 3) / 2);
		var setStartIndex = 0;
		for (var i = 0; i < setNumber; i++) {
			var blocksStartIndex = setStartIndex + 3;
			setInputData = blocksDataArray[setStartIndex];
			setOutputData = blocksDataArray[setStartIndex + 1];
			setBlocksNumber = blocksDataArray[setStartIndex + 2];
			
			setInput = parseInt(setInputData.split('=')[1]);
			setOutput = parseInt(setOutputData.split('=')[1]);
			setBlocksNumber = parseInt(setBlocksNumber.split('=')[1]);
			
			set = blocks.getSet(setInput, setOutput);
			if (set == false) {
				set = blocks.makeSet(setInput, setOutput);
			}
			
			for (var j = 0; j < setBlocksNumber;j++) {
				var k = blocksStartIndex + j *2;
				blockTypeData = blocksDataArray[k];
				blockRotateData = blocksDataArray[k+1];
				

				
				typeArrays = blockTypeData.split("new");
				typeArrays.splice(0,2);
				y = typeArrays.length;
				for (var ti = 0;ti < y;ti++) {
					typeArrays[ti] = S(typeArrays[ti]).between('{','}').s.split(',');
				}
				rotateArrays = blockRotateData.split("new");
				rotateArrays.splice(0,2);
				for (var ri = 0;ri < y;ri++) {
					rotateArrays[ri] = S(rotateArrays[ri]).between('{','}').s.split(',');
				}

				block = set.makeBlock({type: typeArrays, rotation: rotateArrays});
			}
			setStartIndex += 3 + setBlocksNumber * 2;
		}
		
	},
	writeAll: function () {
		allCode.setValue(blocks.exportCode());
	},
	changeFamily: function (select) {
		var current = $("#scene").data("family");
		var next = $(select).val();
		$("#scene").removeClass(current).addClass(next).data("family", next);
	},
	readFile: function (fileInput) {
		var reader = new FileReader();
		var file = fileInput.files[0];
		if (file) {
			reader.onload = (function (reader) {
				return function () {
					var contents = reader.result;
					allCode.setValue(contents);
				}
			})(reader);
			reader.readAsText(file);
			fileInput.form.reset();
		}
		
		
	}
}
var rotate = function (module, i) {

	if (i && i >= 0 && i < 4) {
		$(module).attr("data-rotate", i);
	} else {
		var currentRotation = $(module).attr("data-rotate");
		if (currentRotation == undefined) {
			var currentRotation = 0;
		}
		currentRotation++;
		if (currentRotation == 4) {
			currentRotation = 0;
		}
		$(module).attr("data-rotate", currentRotation);
	}
	$(module).trigger("alter");
}
var moduleClickFunc = function (selector) {
	if (selector == undefined) {
		var selector = $("#scene .module");
	}
	selector.on("click", function () {
		if ($(this).hasClass("selected")) {
			sceneMaker.deselect(this);
			sceneMaker.deactivate();
		} else {
			sceneMaker.deselect($("#scene .module.selected"));
			sceneMaker.select(this);
		}

	});
}
var downloadAll = function () {

	var file = new File([allCode.getValue()], "sample.cs", {
		type: "text/plain;charset=utf-8"
	});
	saveAs(file);
}
$(function () {
	moduleClickFunc();
	$(".button-collapse").sideNav({
		edge: 'right'
	});
	$(".moduleType").on("click", function () {
		var type = $(this).data("type");
		sceneMaker.changeType($("#scene .module.selected")[0], parseInt(type[type.length - 1]));
	});
	$('select').material_select();
	$('.collapsible').collapsible();
	$("body").on("keydown", function (e) {
		if (e.keyCode == 13) {
			var module = $("#scene .module.selected");
			if (module.length) {
				sceneMaker.deselect(module);
				sceneMaker.deactivate();
			} else {
				sceneMaker.select($("#scene .module")[0]);
			}
		}
	});
	$("section.toolbar, aside").on("keydown", function (e) {
		e.stopPropagation();
	});
	window.allCode = CodeMirror.fromTextArea($("#code-text")[0], {
		lineNumbers: true,
		mode: "text/x-csharp",
		theme: "material"
	});
	sceneMaker.build();

	$("#scene").on("alter", ".module", function () {
		var x = $("#x").val();
		var l = $("#scene .module").length;
		var i = $("#scene .module").index(this);
		if (i < x || i > l - x - 1) {
			scene.refresh()
		}
	});

});