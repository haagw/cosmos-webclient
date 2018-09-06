/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"com/oce/cosmos/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/oce/cosmos/formatter/i18nTranslater",
	"com/oce/cosmos/service/OAuthService",
	"com/oce/cosmos/controller/fragment/AuthDialog",
	"com/oce/cosmos/service/ServerService",
	"com/oce/cosmos/util/InternalNotificationHandler",
	"com/oce/cosmos/controller/fragment/AboutDialog",
	"com/oce/cosmos/controller/fragment/setting/SettingDialog"
], function(BaseController, JSONModel, i18nTranslater, OAuthService, AuthDialog, ServerService, InternalNotificationHandler, AboutDialog, SettingDialog) {
	"use strict";
	
	//Reference to the controller
	var that = this;
	/**
	 * @class The main entry class for the cosmos eb client
	 * @author Wolfgang Haag
	 * @public
	 * @name com.oce.cosmos.Controller.App
	 */

	return BaseController.extend("com.oce.cosmos.controller.App", {
		/**
		 * @memberOf com.oce.cosmos.Controller.App
		 */
		i18nTranslater: i18nTranslater,

		onInit: function() {
			that = this;
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.attachPopoverOnMouseover(this.byId("tbTitle"), this.byId("tbTitlePopover"));

			//Set the popover template for the userinfo
			this._oPopover = sap.ui.xmlfragment("com.oce.cosmos.view.LogoutPopover", this);
			this.getView().addDependent(this._oPopover);
			
			var btnAuth = that.byId("btnAuth");
			//btnAuth.setText(i18nTranslater.doTranslate("login"));
			
			//Handle the srorage values
			var oBearerData = OAuthService.getInstance().getBearerFromLocalStorage();
			if(oBearerData !== null){
				var oUserInformation = OAuthService.getInstance().getUserInformationFromLocalStorage();
				if(oUserInformation !== null){
					var oUserInformationModel = new JSONModel(oUserInformation);
					this.getView().setModel(oUserInformationModel, "userdata");
					btnAuth.setIcon("sap-icon://employee");
					btnAuth.setText(oUserInformationModel.getProperty("/user_name"));
				}
				this.setUserInformation(oBearerData);
			}

			
		},

		onAfterRendering: function() {
			this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
			
			//Callback from service
			var getInformationListCallback = {
				onSuccess: function(oEvenSuccess) {
					var model = oEvenSuccess.getSource();
					model.setProperty("/currentYear", new Date().getFullYear());
					var applicationVersion = that.getOwnerComponent().getManifestEntry("/sap.app/applicationVersion/version");
					model.setProperty("/applicationVersion", applicationVersion);
					var nodeName = model.getProperty("/nodeName");
					if(nodeName.length === 0){
						model.setProperty("/nodeName", i18nTranslater.doTranslate("notSet"));
					}
					that.setModel(model, "informationList");
				}
			};
			ServerService.getInstance().getInformationList(getInformationListCallback);
		},

		/**
		 * Event handler while a item in the sideNavigation is pressed
		 * @param {sap.ui.base.Event} oEvent contains the information of the item pressed
		 * @public
		 */
		onItemSelect: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			var sKey = oItem.getKey();
			this.getRouter().navTo(sKey, "flip");
			
/*			// if you click on home, settings or statistics button, call the navTo function
			if ((sKey === "home" || sKey === "licenseOverview" || sKey === "statistics")) {
				this.getRouter().navTo(sKey);
			} else {
				sap.m.MessageToast.show(sKey);
			}*/
	
			
		},

		/**
		 * Event handler while the user name is pressed
		 * @param {sap.ui.base.Event} oEvent ?
		 * @public
		 */
		handleAuthPress: function(oEvent) {
			if (oEvent.getSource().getIcon() === "") {
				this._authDialog = new AuthDialog(this.getView());
				var authDialogCallback = {
					onAuthDone: function(oModelBearer) {
						that.setUserInformation(oModelBearer);
					}

				};
				this._authDialog.open(authDialogCallback);

			} else {
				this._oPopover.openBy(oEvent.getSource());
			}
		},

		/**
		 * Event handler while logout is pressed
		 * @param {sap.ui.base.Event} oEvent ?
		 * @public
		 */
		onLogoutPressed: function() {
			this._oPopover.close();
			OAuthService.getInstance().removeBearerFromLocalStorage();
			var btnAuth = that.byId("btnAuth");
			btnAuth.setIcon("");
			btnAuth.setText(i18nTranslater.doTranslate("login"));
			this.handleLogout();

		},

		handleLogout: function() {
			
			var sideContentModel = that.getView().getModel("side");
			sideContentModel.setProperty("/navigation/1/visible", false);
			sideContentModel.setProperty("/navigation/2/visible", false);
			sideContentModel.setProperty("/navigation/3/visible", false);
			sideContentModel.setProperty("/navigation/4/visible", false);
			sideContentModel.setProperty("/navigation/5/visible", false);
			sideContentModel.setProperty("/navigation/6/visible", false);
			sideContentModel.setProperty("/navigation/7/visible", false);
			sideContentModel.setProperty("/navigation/8/visible", false);
			sideContentModel.setProperty("/navigation/9/visible", false);
			sideContentModel.setProperty("/navigation/10/visible", false);
			sideContentModel.setProperty("/navigation/11/visible", false);
			sideContentModel.setProperty("/navigation/12/visible", false);
			
			sideContentModel.setProperty("/fixedNavigation/0/visible", false);
			
			this.getRouter().navTo("home");

		},
		handleLogin: function() {

			var sideContentModel = that.getView().getModel("side");
			sideContentModel.setProperty("/navigation/1/visible", true);
			sideContentModel.setProperty("/navigation/2/visible", true);
			sideContentModel.setProperty("/navigation/3/visible", true);
			sideContentModel.setProperty("/navigation/4/visible", true);
			sideContentModel.setProperty("/navigation/5/visible", true);
			sideContentModel.setProperty("/navigation/6/visible", true);
			sideContentModel.setProperty("/navigation/7/visible", true);
			sideContentModel.setProperty("/navigation/8/visible", true);
			sideContentModel.setProperty("/navigation/9/visible", true);
			sideContentModel.setProperty("/navigation/10/visible", true);
			sideContentModel.setProperty("/navigation/11/visible", true);
			sideContentModel.setProperty("/navigation/12/visible", true);
			
			sideContentModel.setProperty("/fixedNavigation/0/visible", true);

		},

		/** 
		 * Sets the actual user information for the given bearer
		 * @param {object} oBearerData The bearer data from the store
		 */
		setUserInformation: function(oBearerData) {
			var oBearerModel = new JSONModel();
			oBearerModel.setData(oBearerData);

			var getUserInformationCallback = {
				sender: that.getView(),
				onSuccess: function(oEvenSuccess) {
					oEvenSuccess.sender.setModel(oEvenSuccess.getSource(), "userdata");
					var btnAuth = oEvenSuccess.sender.getController().byId("btnAuth");
					btnAuth.setIcon("sap-icon://employee");
					btnAuth.setText(oEvenSuccess.getSource().getProperty("/user_name"));
					oEvenSuccess.sender.getController().handleLogin();
				}
			};
			OAuthService.getInstance().getUserInformation(oBearerModel, getUserInformationCallback);
		},

		onMenuHelpAction: function(oEvent) {

			var oItem = oEvent.getParameter("item"),
			sItemPath = "";
			if (oItem instanceof sap.m.MenuItem) {
				sItemPath = oItem.getId();
				if(sItemPath.includes("mnuHelpAbout")){
					$.sap.require("com.oce.cosmos.controller.fragment.AboutDialog");
					var aboutDialog = new AboutDialog(this.getView());
					aboutDialog.open();
				}else if(sItemPath.includes("mnuHelpSettings")){
					$.sap.require("com.oce.cosmos.controller.fragment.setting.SettingDialog");
					var settingsDialog = new SettingDialog(this.getView());
					settingsDialog.open();
				}
			}


		},
		onMenuRunAction: function(oEvent){
			var oItem = oEvent.getParameter("item"),
			sItemPath = "";
			if (oItem instanceof sap.m.MenuItem) {
				sItemPath = oItem.getId();
				if(sItemPath.endsWith("mnuRunTest")){
					InternalNotificationHandler.notifyInformation("Dies ist eine Information", "Nur zu Demozwecke", "<p>Dies sind die Informationsdetails</p>");
				}else if(sItemPath.endsWith("mnuRunTest1")){
					InternalNotificationHandler.notifyWarning("Dies ist eine Warnung", "Nur zu Demozwecke", "<p>Dies sind die Warnungsdetails</p>");
				}
			}
		},

		/**
		 * Event handler while the navigation button (sandwich) is pressed
		 * @public
		 */
		onSideNavButtonPress: function() {
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
		_setToggleButtonTooltip: function(bLarge) {
			var toggleButton = this.byId("sideNavigationToggleButton");
			if (bLarge) {
				toggleButton.setTooltip(this.i18nTranslater.doTranslate("largeSizeNavigation"));
			} else {
				toggleButton.setTooltip(this.i18nTranslater.doTranslate("smallSizeNavigation"));
			}
		},
		
		/**
		 * Method to set the tooltip
		 * @param {object} targetControl - the target control bind to
		 * @param {object} popover - the depend popover inside the target control
		 * @private
		 */
	    attachPopoverOnMouseover: function (targetControl, popover) {
	      targetControl.addEventDelegate({
	        onmouseover: this._showPopover.bind(this, targetControl, popover),
	        onmouseout: this._clearPopover.bind(this, popover)
	      }, this);
	    },
    
		 _showPopover: function (targetControl, popover) {
	      this._timeId = window.setTimeout( function() {
	      		popover.openBy(targetControl);
	    	}, 500);
		 	
		 },

	    _clearPopover: function(popover) {
	      clearTimeout(this._timeId);
	      popover.close();
	    },
	    // Errors Pressed
		onInternalNotification: function (oEvent) {
			
			if (!this.byId("internalNotificationPopover")) {
				var oMessagePopover = new sap.m.MessagePopover(this.getView().createId("internalNotificationPopover"), {
					headerButton : new sap.m.Button({
						text : i18nTranslater.doTranslate("clear"), 
						press: function (){
							oMessagePopover.destroyItems();
							oMessagePopover.destroy();
							InternalNotificationHandler.clearNotifications();
							
						}
					}),
					placement: sap.m.VerticalPlacementType.Bottom,
					items: {
						path: "notification>/internalNotifications",
						factory: this._createError
					},
					afterClose: function () {
						oMessagePopover.destroy();
					}

				});
				this.getView().addDependent(oMessagePopover);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
				oMessagePopover.openBy(oEvent.getSource());
			}
		},
		_createError: function (sId, oBindingContext) {
				var oBindingObject = oBindingContext.getObject();
				var oMessageItem = new sap.m.MessageItem(sId, {
					type: oBindingObject.type,
					title: oBindingObject.title,
					subtitle: oBindingObject.subTitle,
					description: oBindingObject.detail + "<p><strong>" + new Date().toLocaleTimeString() + "</strong></p>",
					counter: oBindingObject.counter,
					markupDescription: true
				});
				return oMessageItem;
			}
	});

});