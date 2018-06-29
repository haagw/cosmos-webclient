/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Button',
	"com/canon/cosmos/webclient/formatter/i18nTranslater",
	"com/canon/cosmos/webclient/controller/LoginDialog",
	"com/canon/cosmos/webclient/util/Constants",
	"com/canon/cosmos/webclient/service/OAuthService"
], function (jQuery, Fragment, Controller, JSONModel, Popover, Button, i18nTranslater, LoginDialog, Constants, OAuthService) {
	"use strict";
	/**
	 * @class The main entry class for the cosmos eb client
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.Controller.App
	 */
	var CController = Controller.extend("com.canon.cosmos.webclient.controller.App", {
		/**
		 * @memberOf com.canon.cosmos.webclient.Controller.App
		 */
		i18nTranslater : i18nTranslater,


		onInit : function() {
			
			
			//set dialog
			this._loginDialog = new LoginDialog(this.getView());
			
			
			var res =OAuthService.getBearerToken("cosmos", "admin", true);
			
			
			
			$.when(res).then(function(data) {
			    console.log('finished', data);
			});
						

			

			
			
		},
		
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		
		exit : function(){
			this._loginDialog.destroy();
			delete this._loginDialog;
		},
		
		onAfterRendering : function(){
			this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
		},

		/**
		 * Event handler while a item in the sideNavigation is pressed
		 * @param {sap.ui.base.Event} oEvent contains the information of the item pressed
		 * @public
		 */
		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey());
		},
		/**
		 * Event handler while the user name is pressed
		 * @param {sap.ui.base.Event} event ?
		 * @public
		 */
		handleUserNamePress: function (event) {
			this._loginDialog.open();          
			
			
/*			var popover = new Popover({
				showHeader: false,
				placement: sap.m.PlacementType.Bottom,
				content:[
					new Button({
						text: 'Logout',
						type: sap.m.ButtonType.Transparent
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			popover.openBy(event.getSource());*/
		},

		/**
		 * Event handler while the navigation button (sandwich) is pressed
		 * @public
		 */
		onSideNavButtonPress : function() {
			var viewId = this.getView().getId();
			var toolPage = sap.ui.getCore().byId(viewId + "--app");
			var sideExpanded = toolPage.getSideExpanded();
			
			this._setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		
		/**
		 * Method to set the tooltip
		 * @param {boolean} bLarge - the status of the menu size (large or small)
		 * @private
		 */
		_setToggleButtonTooltip : function(bLarge) {
			var toggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				toggleButton.setTooltip(this.i18nTranslater.doTranslate("largeSizeNavigation", this));
			} else {
				toggleButton.setTooltip(	this.i18nTranslater.doTranslate("smallSizeNavigation", this));
			}
		}

	});

	return CController;

});