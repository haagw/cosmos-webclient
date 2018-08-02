/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/MessageBox",
	"sap/m/Button",
	"com/canon/cosmos/webclient/formatter/i18nTranslater",
	"com/canon/cosmos/webclient/controller/LoginDialog",
	"com/canon/cosmos/webclient/service/OAuthService",
	"com/canon/cosmos/webclient/controller/fragment/AuthDialog"
], function (Fragment, Controller, JSONModel, Popover, MessageBox, Button, i18nTranslater, LoginDialog, OAuthService, AuthDialog) {
	"use strict";
	
	//Reference to the controller
	var appController;
	/**
	 * @class The main entry class for the cosmos eb client
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.Controller.App
	 */
	 
	return Controller.extend("com.canon.cosmos.webclient.controller.App", {
		/**
		 * @memberOf com.canon.cosmos.webclient.Controller.App
		 */
		i18nTranslater : i18nTranslater,

		onInit : function() {
			appController = this;
			
			//OAuthService.getInstance().removeBearerFromLocalStorage();
			
			this._oPopover = sap.ui.xmlfragment("com.canon.cosmos.webclient.view.LogoutPopover", this);
			this.getView().addDependent(this._oPopover);
			


			
			var bearer = OAuthService.getInstance().getBearerFromLocalStorage();
			if(bearer !== null){
				this.setUserInformation(bearer);
			}
			
			
			
			
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
			this._authDialog = new AuthDialog("Wolfgang");
			this._authDialog.open();
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
		 * @param {sap.ui.base.Event} oEvent ?
		 * @public
		 */
		handleAuthPress: function (oEvent) {
			if(oEvent.getSource().getIcon() === ""){
			
				this._loginDialog = new LoginDialog(this.getView());
				var loginDialogCallback = {
						onLoginDone : function(){
							var bearer = OAuthService.getInstance().getBearerFromLocalStorage();
							appController.setUserInformation(bearer);
						}
						
				};
				this._loginDialog.open(loginDialogCallback); 
			
			}else{
				this._oPopover.openBy(oEvent.getSource());
				
			}

			
			
		},
		
		onLogoutPressed: function(){
			this._oPopover.close();
			OAuthService.getInstance().removeBearerFromLocalStorage();
			var btnAuth = appController.byId("btnAuth");
			btnAuth.setIcon("");
			btnAuth.setText(i18nTranslater.doTranslate("login"));
			this.handleLogout();
			
		},
		
		handleLogout: function(){
			sap.m.MessageToast.show("Handle Logout", {});
		},
		handleLogin: function(){
			sap.m.MessageToast.show("Handle Login", {});
		},
		
		
		setUserInformation: function(oBearer){
			var promise = OAuthService.getInstance().getUserInformation(oBearer);
			$.when(promise)
    		.done( function(oUserData) {
    			var oModelUserData = new JSONModel(oUserData);
				appController.getView().setModel(oModelUserData, "userdata");
    			
    			/** @type sap.m.Button **/		
				var btnAuth = appController.byId("btnAuth");
				btnAuth.setIcon("sap-icon://employee");
				btnAuth.setText(oUserData.user_name);
				appController.handleLogin();

    		})
        	.fail( function(err)  {
				MessageBox.show(err.statusText, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error",
					actions: [MessageBox.Action.CLOSE],
					id: "mbox1",
					details: err.responseText,
					styleClass: "sapUiSizeCompact",
					contentWidth: "100px"
				});
			});
		},
		

		
		
		handleLoginDialogResult: function(){
			$.sap.log.info("Halloo");
		},
		
		onMenuHelpAction : function (oEvent){
			var oItem = oEvent.getParameter("item"), sItemPath = "";
			if(oItem instanceof sap.m.MenuItem){
				sItemPath = oItem.getId();
			}
			

			MessageBox.show(sItemPath, {
				icon: sap.m.MessageBox.Icon.INFORMATION,
				title: "Information",
				actions: [MessageBox.Action.CLOSE],
				id: "mboxAbout",
				styleClass: "sapUiSizeCompact",
				contentWidth: "100px"
			});
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
				toggleButton.setTooltip(this.i18nTranslater.doTranslate("largeSizeNavigation"));
			} else {
				toggleButton.setTooltip(	this.i18nTranslater.doTranslate("smallSizeNavigation"));
			}
		}
		

		
		

	});

});