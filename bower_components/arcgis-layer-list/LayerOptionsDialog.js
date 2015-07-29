﻿/*global define*/
define(["./metadataUtils"], function (metadataUtils) {
	var exports = {};

	/**
	 * Creates an opacity slider for the given layer.
	 * @returns {HTMLInputElement}
	 */
	function createOpacitySlider(/**{OperationLayer}*/ opLayer) {
		var setOpacity = function () {
			opLayer.layerObject.setOpacity(this.value * 0.01);
		};

		var opacitySlider = document.createElement("input");
		opacitySlider.classList.add("opacity-slider");
		opacitySlider.type = "range";
		opacitySlider.min = 0;
		opacitySlider.max = 100;
		opacitySlider.step = 1;
		opacitySlider.value = (opLayer.layerObject ? opLayer.layerObject.opacity : opLayer.opacity) * 100;
		opacitySlider.addEventListener("change", setOpacity);
		return opacitySlider;
	}

	/**
	 * Creates a list of links to metadata documents.
	 * @param {Object.<string, string>} metadataUrls - Dictionary of metadata URLs keyed by associated layer name.
	 * @returns {HTMLUListElement}
	 */
	function createMetadataLinkList(metadataUrls) {
		var list = document.createElement("ul");
		list.classList.add("metadata-list");
		var li, a;
		for (var name in metadataUrls) {
			if (metadataUrls.hasOwnProperty(name)) {
				li = document.createElement("li");
				a = document.createElement("a");
				a.target = "layer_metadata";
				a.href = [metadataUrls[name], "f=html"].join("?");
				a.textContent = name;
				li.appendChild(a);
				list.appendChild(li);
			}

		}
		return list;
	}

	function createMetadataSection(parentNode, opLayer) {
		var section = document.createElement("section");

		var h1 = document.createElement("h1");
		h1.textContent = "Metadata";
		section.appendChild(h1);

		var progress = document.createElement("progress");
		progress.textContent = "Loading metadata...";
		section.appendChild(progress);

		parentNode.appendChild(section);

		// Load metadata and create list if successfull.
		metadataUtils.getIdsOfLayersWithMetadata(opLayer.layerObject).then(function (metadataInfo) {
			section.removeChild(progress);
			section.appendChild(createMetadataLinkList(metadataInfo))
		}, function (error) {
			section.removeChild(progress);
			console.error(error);
		});
	}

	/**
	 * Creates the layer options dialog.
	 * The layer list will use a single dialog for the options of all layers.
	 * The controls and contents will be updated when called for a layer.
	 * @returns {HTMLDialogElement}
	 */
	exports.createLayerOptionsDialog = function () {
		var dialog = document.createElement("dialog");

		dialog.classList.add("layer-options-dialog");

		var headerSection = document.createElement("section");
		headerSection.classList.add("layer-options-dialog-header");

		var closeButton = document.createElement("button");
		closeButton.type = "button";
		closeButton.classList.add("layer-options-dialog-close-button");
		closeButton.textContent = "X";

		headerSection.appendChild(closeButton);

		dialog.appendChild(headerSection);

		var mainSection = document.createElement("section");
		mainSection.classList.add("layer-options-dialog-main-section");

		dialog.appendChild(mainSection);

		closeButton.addEventListener("click", function () {
			dialog.close();
		});


		if (window.dialogPolyfill) {
			window.dialogPolyfill.registerDialog(dialog);
		}

		

		document.body.appendChild(dialog);

		return dialog;
	};

	/**
	 * Shows the layer options dialog with options for the specified layer.
	 * @returns {HTMLDialogElement}
	 */
	exports.showLayerOptionsDialog = function (/**{OperationLayer}*/ opLayer) {
		var dialog = document.querySelector("dialog.layer-options-dialog");

		var mainSection = dialog.querySelector(".layer-options-dialog-main-section");

		// Remove existing child elements.
		var mainSectionChildren = dialog.querySelectorAll(".layer-options-dialog-main-section > *");

		for (var i = 0; i < mainSectionChildren.length; i++) {
			mainSection.removeChild(mainSectionChildren[i]);
		}

		var opacityLabel = document.createElement("label");
		opacityLabel.textContent = "Layer Opacity";
		mainSection.appendChild(opacityLabel);

		var opacitySlider = createOpacitySlider(opLayer);
		mainSection.appendChild(opacitySlider);

		createMetadataSection(mainSection, opLayer);

		dialog.showModal();
		return dialog;
	};

	return exports;
});