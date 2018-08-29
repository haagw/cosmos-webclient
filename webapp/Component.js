/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/canon/cosmos/webclient/model/GlobalModels",
	"com/canon/cosmos/webclient/util/GlobalProperties",
	"com/canon/cosmos/webclient/util/GlobalConstants"
], function(UIComponent, Device, GlobalModels, GlobalProperties, GlobalConstants) {
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
			GlobalProperties.setWebApiDataSource(this.getManifestEntry("/sap.app/dataSources/cosmosWebApi"));
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(GlobalModels.createDeviceModel(), "device");
			
			sap.ui.getCore().setModel(this.getModel("i18n"), "i18n");
			
			this.initializeSettings();
			
		
		},
		getContentDensityClass: function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		
		initializeSettings: function(){
			$.sap.require("jquery.sap.storage");
			var storage = $.sap.storage($.sap.storage.Type.local);
			var oData = storage.get(GlobalConstants.STORAGE_SETTINGS);
			
			if(oData === null){
				return;
			}
			
			if(oData.chkDetailGlobalClear !== null && oData.chkDetailGlobalClear === true){
				storage.remove(GlobalConstants.STORAGE_SETTINGS);
				return;
			}
			
			if(oData.selDetailGlobalizationLanguage !== null){
				if(oData.selDetailGlobalizationLanguage === "english"){
					sap.ui.getCore().getConfiguration().setLanguage("en-EN");
				}else if(oData.selDetailGlobalizationLanguage === "german"){
					sap.ui.getCore().getConfiguration().setLanguage("de-DE");
				}else if(oData.selDetailGlobalizationLanguage === "browser"){
					sap.ui.getCore().getConfiguration().setLanguage(window.navigator.language);
				}
			}
			if(oData.selDetailAppearanceTheme !== null){
				sap.ui.getCore().applyTheme(oData.selDetailAppearanceTheme); 
			}
			

			
		}
		
		
		
		
	});
});