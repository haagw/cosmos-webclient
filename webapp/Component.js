/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/canon/cosmos/webclient/model/GlobalModels"
], function(UIComponent, Device, GlobalModels) {
	"use strict";
	
	return UIComponent.extend("com.canon.cosmos.webclient.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(GlobalModels.createDeviceModel(), "device");
		}
	});
});