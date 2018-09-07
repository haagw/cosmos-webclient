/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"com/oce/cosmos/model/GlobalModels",
	"com/oce/cosmos/util/GlobalProperties",
	"com/oce/cosmos/util/GlobalConstants"
], function(UIComponent, GlobalModels, GlobalProperties, GlobalConstants) {
	"use strict";
	
	return UIComponent.extend("com.oce.cosmos.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			
			var cosmosWebApi = this.getManifestEntry("/sap.ui5/config/cosmosWebApi");
			if(cosmosWebApi.uri.startsWith("/cosmos-webapi")){
				cosmosWebApi.uri = window.location.origin;
			}
			
			GlobalProperties.setWebApiDataSource("/" + cosmosWebApi.uri + "/" + cosmosWebApi.version + "/");
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(GlobalModels.createDeviceModel(), "device");
			
			this.initializeSettings();
			
			// create the views based on the url/hash
			this.getRouter().initialize();
			
						

		},
		
		
		/** 
		 * Not used at the moment
		 */
		myNavBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("masterSettings", {}, true);
			}
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
			if(oData.stiDetailAppearanceNotifications !== null){
				GlobalProperties.setMaxCountOfNotifications(oData.stiDetailAppearanceNotifications);
			}

		}
		
		
		
		
	});
});