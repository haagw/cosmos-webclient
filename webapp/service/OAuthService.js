/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"com/oce/cosmos/util/GlobalConstants",
	"com/oce/cosmos/util/GlobalProperties",
	"sap/m/Dialog",
	"sap/m/MessageStrip",
	"com/oce/cosmos/formatter/i18nTranslater",
	"com/oce/cosmos/util/InternalNotificationHandler"
], function (Object,
			JSONModel, 
			GlobalConstants, 
			GlobalProperties, 
			Dialog, 
			MessageStrip, 
			i18nTranslater,
			InternalNotificationHandler){
	"use strict";
	var instance;
	var storage;
	
	/**
	 * @class Manages the OAuth2 communication. 
	 * @author Wolfgang Haag
	 * @public
	 * @name com.oce.cosmos.service.OAuthService
	 */
	var Service = Object.extend("com.oce.cosmos.service.OAuthService", {

		/** 
		 * Constructor Initialize the storage
		 * @public
		 */
		constructor: function(){ 
		
			$.sap.require("jquery.sap.storage");
			storage = $.sap.storage($.sap.storage.Type.local);
			
		},

		/** 
		 * Gets a bearer token from the server with the password grant. For each servercall the method
		 * checkBearer must be called. This guarants a correct token. It is recomended to set the access_token
		 * to a small expiration time like 60-300 seconds. The refresh_token can have a lifetime of 7776000 seconds (3 month)
		 * @public
		 * @param {string}  username The username
		 * @param {string}  password The pasword
		 * @param {object}  getBearerCallback The object with the callback function onError, onSuccess and the sender
		 */
		getBearer: function(username, password, getBearerCallback) {
			
			var uri = GlobalProperties.getWebAuthUri() + "token";
			var parameters = "grant_type=" + GlobalConstants.GRANT_TYPE.PASSWORD +
			"&username=" + username +
			"&password=" + password +
			"&client_id=" + GlobalConstants.CLIENT_ID +
			"&client_secret=" + GlobalConstants.CLIENT_SECRET;

			var oBearer = new JSONModel();
			oBearer.attachRequestCompleted(function (oEvent){
				
				oEvent.sender = getBearerCallback.sender;
				if(oEvent.getParameters().success === true){
					getBearerCallback.onSuccess(oEvent);
				}else{
					getBearerCallback.onError(oEvent);
				}
				
			});
			oBearer.loadData(uri, parameters, true, "POST", false, "", null); 
			
		},

		/** 
		 * Gets the User Information from the auth server by an access token
		 * @public
		 * @param {object} oBearerModel a valid bearer 
		 * @param {object} getUserInformationCallback The object with the callback function onError, onSuccess and the sender
		 */
		getUserInformation : function (oBearerModel, getUserInformationCallback){
			
			var checkBearerCallback = {
				sender: getUserInformationCallback.sender,
				onSuccess: function(oSubBearerModel){
					
					var uri = GlobalProperties.getWebAuthUri() + "check_token";
					var parameters = "token="  + oSubBearerModel.getProperty("/access_token");
					var oUserInfoModel = new JSONModel();
					oUserInfoModel.attachRequestCompleted(function (oEventSub){
						oEventSub.sender = getUserInformationCallback.sender;
						if(oEventSub.getParameters().success === true){
							storage.put(GlobalConstants.STORAGE_USERINFO,oEventSub.getSource().getData());
							getUserInformationCallback.onSuccess(oEventSub);
						}else{
							InternalNotificationHandler.notifyAPIException(oEventSub);
						}
					});
					oUserInfoModel.loadData(uri, parameters, true, "GET", false, "", null); 
					
				},
				onError: function(oError){
					
					getUserInformationCallback.onError(oError);
					
				}
				
			};
			instance.checkBearer(oBearerModel, checkBearerCallback);
			
		},
		
		/** 
		 * Checks the bearer and if not valid it gets a new one. If refresh token also not valid
		 * a confirm dialog pops up. This must be done for each secured call to the server
		 * @public
		 * @param {object} oBearerModel The current berare model
		 * @param {object} checkBearerCallback A callback handler to push the results to 
		 */
		checkBearer: function(oBearerModel, checkBearerCallback){

			if(oBearerModel.getProperty("/accessTokenValid") === false){
				var getNewBearerCallback = {
					onSuccess: function(newBearerModel){
						
						instance.setBearerToLocalStorage(newBearerModel.getData());
						checkBearerCallback.onSuccess(newBearerModel);
						
					},
					onError: function(){
						//Confirm dialog must popup
						var dialog = new Dialog({
							title: i18nTranslater.doTranslate("confirmLogin"),
							type: "Message",
							content : [
									new MessageStrip("msErrorMessage",{
										text : "",
										type : "Error",
										visible : false, 
										showIcon : true,
										showCloseButton : true 
									}),
									new sap.m.Label({ text: i18nTranslater.doTranslate("password"), labelFor: "txtPassword" }),
									new sap.m.Input("txtPassword", {
										width: "100%",
										type: "Password"
									})
	
								],
								beginButton: new sap.m.Button({
									text: i18nTranslater.doTranslate("confirm"),
									press: function () {
										//Get the new Bearer
										var password = sap.ui.getCore().byId("txtPassword").getValue();
										if(password.length === 0){
											var msErrorMessage = sap.ui.getCore().byId("msErrorMessage");
											msErrorMessage.setText(i18nTranslater.doTranslate("validationFailurePassword"));
											msErrorMessage.setVisible(true);
											return;
										}
										
										var username = instance.getUserInformationFromLocalStorage().user_name;
										var getBearerCallBack = {
											onError: function(oEvent){
												var errorobject = oEvent.getParameters().errorobject;
												msErrorMessage = sap.ui.getCore().byId("msErrorMessage");
												msErrorMessage.setText(errorobject.responseText);
												msErrorMessage.setVisible(true);
											},
											onSuccess: function(oEvent){
												getNewBearerCallback.onSuccess(oEvent.getSource());
												dialog.close();
											}
										};
										instance.getBearer(username, password, getBearerCallBack );
									}
									
								}),
								endButton: new sap.m.Button({
									text: i18nTranslater.doTranslate("cancel"),
									press: function () {
										//Logout the user
										instance.removeBearerFromLocalStorage();
										checkBearerCallback.sender.getController().onLogoutPressed();
										dialog.close();
									}
								}),
								afterClose: function() {
									
									dialog.destroy();
									
								}
							
						});
						dialog.open();
					}
				};
				instance._getNewBearer(oBearerModel, getNewBearerCallback);
			}else{
				checkBearerCallback.onSuccess(oBearerModel);
			}
			
		},
		
		
		/** 
		 * Gets a bearer token from the server. This is a synch call because of handle it easy
		 * @private
		 * @param {string}  oBearerModel The bearer model
		 * @param {object} getNewBearerCallback A callback handler to push the results to 
		 */
		_getNewBearer: function(oBearerModel, getNewBearerCallback) {
			
			var uri = GlobalProperties.GlobalProperties.getWebAuthUri() + "token";
			var parameters = "grant_type=" + GlobalConstants.GRANT_TYPE.REFRESH_TOKEN +
			"&client_id=" + GlobalConstants.CLIENT_ID +
			"&client_secret=" + GlobalConstants.CLIENT_SECRET +
			"&refresh_token=" + oBearerModel.getProperty("/refresh_token");

			var oBearer = new JSONModel();
			oBearer.attachRequestCompleted(function (oEvent){
				
				if(oEvent.getParameters().success === true){
					//Callback with the newBearerModel
					getNewBearerCallback.onSuccess(oEvent.getSource());
				}else{
					//Callback with the errorobject
					//message : "error"
					//responseTeext : "{...}"
					//statusCode : 400
					//StatusText : "BadRequest"
					getNewBearerCallback.onError(oEvent.getParameters().errorobject);
				}
			});
			oBearer.loadData(uri, parameters, true, "POST", false, false, null); 

		},

		/** 
		 * Gets the  bearer oDate from local storage
		 * @public
		 * @returns {object} The bearer data
		 */
		getBearerFromLocalStorage: function() {
			
			var oBearerData = storage.get(GlobalConstants.STORAGE_BEARER);
			if (oBearerData === null) {
				return null;
			} else {
				if (new Date().getTime() > oBearerData.expireDate) {
					oBearerData.accessTokenValid = false;
				} else {
					oBearerData.accessTokenValid = true;
				}
				$.sap.log.debug("*** LOAD BEARER: " + JSON.stringify(oBearerData));
				return oBearerData;

			}
		},
		
		/** 
		 * Gets the JSON Model from local storage
		 * @public
		 * @returns {sap.ui.model.json.JSONModel} The bearer model
		 */
		getBearerModelFromLocalStorage: function (){
			var oBearer = instance.getBearerFromLocalStorage();
			var oBearerModel = new JSONModel();
			oBearerModel.setData(oBearer);
			return oBearerModel;
		},
		
		/** 
		 * Get the user information from store
		 * @returns {object} The user information
		 */
		getUserInformationFromLocalStorage : function(){
			return storage.get(GlobalConstants.STORAGE_USERINFO);
		},
		
		/** 
		 * Sets the Bearer fo the local storage
		 * @public
		 * @param {object} oBearerData The Bearer data
		 */
		setBearerToLocalStorage:function(oBearerData){
		  	//Compute access_token expire date
		  	var oCurrentDate = new Date();
		  	var time = oCurrentDate.getTime() + ((oBearerData.expires_in - 5) * 1000);
		  	oCurrentDate = oCurrentDate.setTime(time);
		  	oBearerData.expireDate = oCurrentDate;
		  	$.sap.log.debug("*** STORE BEARER: " + JSON.stringify(oBearerData));
		  	storage.put(GlobalConstants.STORAGE_BEARER, oBearerData);
		},
		
		/** 
		 * Removes the bearer  amd the user info from local storage
		 * @public
		 */
		removeBearerFromLocalStorage: function(){
			$.sap.log.debug("*** REMOVE BEARER from local store");
			storage.remove(GlobalConstants.STORAGE_BEARER);
			storage.remove(GlobalConstants.STORAGE_USERINFO);
		}
		
	});

	return {
		/** 
		 * Gets the singleten instance
		 * @returns {OAuthService} The instance of the class
		 */
		getInstance: function() {
			if (!instance) {
				instance = new Service();
			}
			return instance;
		}
	};
});