/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"com/canon/cosmos/webclient/util/GlobalConstants",
	"com/canon/cosmos/webclient/util/GlobalProperties"
], function (Object,JSONModel, GlobalConstants, GlobalProperties){
	"use strict";
	var instance;
	var storage;
	
	/**
	 * @class Manages the OAuth2 communication
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.service.OAuthService
	 */
	var Service = Object.extend("com.canon.cosmos.webclient.service.OAuthService", {

		/** 
		 * Constructor
		 * @public
		 */
		constructor: function() {
			$.sap.require("jquery.sap.storage");
			storage = $.sap.storage($.sap.storage.Type.local);
		},

		/** 
		 * Gets a bearer token from the server
		 * @public
		 * @param {string}  username The username
		 * @param {string}  password The pasword
		 * @param {object}  serviceCallback The object with the callback function onError, onSuccess and the sender

		 */
		getBearer: function(username, password, serviceCallback) {
			
			var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webauth/oauth/token";
			var parameters = "grant_type=" + GlobalConstants.GRANT_TYPE.PASSWORD +
			"&username=" + username +
			"&password=" + password +
			"&client_id=" + GlobalConstants.CLIENT_ID +
			"&client_secret=" + GlobalConstants.CLIENT_SECRET;

			var oBearer = new JSONModel();
			oBearer.attachRequestCompleted(function (oEvent){
				oEvent.sender = serviceCallback.sender;
				if(oEvent.getParameters().success === false){
					serviceCallback.onError(oEvent);
				}else{
					serviceCallback.onSuccess(oEvent);
				}
			});
			oBearer.loadData(uri, parameters, true, "POST", false, false, null); 
			
		},


		
		/** 
		 * Gets the User Information
		 * @public
		 * @param {object} oBearer a valid bearer 
		 * @returns {object} a promised user information
		 */
		getUserInformation : function (oBearerModel, serviceCallback){
			
			var oBearerModelResult = instance.checkBearer(oBearerModel);
			if(oBearerModelResult === null){
				serviceCallback.onError();
				return;
			}else{
				var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webauth/oauth/check_token";
				var parameters = "token="  + oBearerModelResult.getProperty("/access_token");
	
				var oUserInfoModel = new JSONModel();
				oUserInfoModel.attachRequestCompleted(function (oEvent){
					oEvent.sender = serviceCallback.sender;
					if(oEvent.getParameters().success === false){
						serviceCallback.onError(oEvent);
					}else{
						serviceCallback.onSuccess(oEvent);
					}
				});
				oUserInfoModel.loadData(uri, parameters, true, "GET", false, false, null); 
			}

		},
		
		/** 
		 * Ccecks the bearer and if not valid it gets a new one. If refresh token also not valid
		 * a confirm dialog pops up. This must be done for each secured call to the server
		 * @public
		 * @param {object} oBearer The current bearer
		 * @returns {object} a promised bearer 
		 */
		checkBearer: function(oBearerModel){

			if(oBearerModel.getProperty("/access_token_valid") === false){
				var oResult = instance._getNewBearer(oBearerModel);
				if(oResult !== null){
					instance.setBearerToLocalStorage(oResult.getData());
				}else{
					//Confirm dialog must popup
					
					//Confirm dialog must getBack an new Bearer
					
					
					//Bearer must set to storage
					//instance.setBearerToLocalStorage(oResult.getData());
					
					//falls Abbruch
					instance.removeBearerFromLocalStorage();
				}
				return oResult;
			}else{
				return oBearerModel;
			}
		},
		
		
		/** 
		 * Gets a bearer token from the server. This is a synch call because of handle it easy
		 * @private
		 * @param {string}  oBearer The Refreshtoken
		 * @returns {object} a promised token 
		 */
		_getNewBearer: function(oBearerModel) {
/*			var oResult;
			var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webauth/oauth/token";
			var parameters = "grant_type=" + GlobalConstants.GRANT_TYPE.REFRESH_TOKEN +
			"&client_id=" + GlobalConstants.CLIENT_ID +
			"&client_secret=" + GlobalConstants.CLIENT_SECRET +
			"&refresh_token=" + oBearerModel.getProperty("/refresh_token");

			var oBearer = new JSONModel();
			oBearer.attachRequestCompleted(function (oEvent){
				oResult = oEvent;
			});
			oBearer.loadData(uri, parameters, true, "POST", false, false, null); 
			
			return oResult;
			
			
			*/
			
			var oResult;
			var baseUri = GlobalProperties.getWebApiDataSource().getProperty("/uri");
			var payload = "&grant_type=" + GlobalConstants.GRANT_TYPE.REFRESH_TOKEN +
				"&client_id=" + GlobalConstants.CLIENT_ID +
				"&client_secret=" + GlobalConstants.CLIENT_SECRET +
				"&refresh_token=" + oBearerModel.getProperty("/refresh_token");

			$.sap.log.debug("*** GET NEW BEARER WITH REFRESH_TOKEN: " + oBearerModel.getProperty("/refresh_token"));

			$.ajax({
				url: baseUri + "cosmos-webauth/oauth/token",
				type: "post",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				data: payload,
				dataType: "json",
				async:false,
				success: function(oBearerResult) {
					$.sap.log.debug("*** NEW BEARER: " + JSON.stringify(oBearerResult));
					var m = new JSONModel();
					m.setData(oBearerResult);
					oResult = m;
				},
				error: function(err) {
					$.sap.log.error(err.responseText);
					oResult = null;
				}
			});
			return oResult;
		},

		/** 
		 * Gets the extended bearer model from local storage
		 * @public
		 * @returns {object} The bearer
		 */
		getBearerFromLocalStorage: function() {
			var oBearerData = storage.get(GlobalConstants.STORAGE_BEARER);
			if (oBearerData === null) {
				return null;
			} else {
				if (new Date().getTime() > oBearerData.expire_date) {
					oBearerData.access_token_valid = false;
				} else {
					oBearerData.access_token_valid = true;
				}
				$.sap.log.debug("*** LOAD BEARER: " + JSON.stringify(oBearerData));
				return oBearerData;

			}
		},
		
		/** 
		 * Sets the Bearer fo the local storage
		 * @public
		 * @param {object} oBearer The Bearer
		 * @returns {object} The bearer
		 */
		setBearerToLocalStorage:function(oBearerData){
		  	//Compute access_token expire date
		  	var oCurrentDate = new Date();
		  	var time = oCurrentDate.getTime() + ((oBearerData.expires_in - 5) * 1000);
		  	oCurrentDate = oCurrentDate.setTime(time);
		  	oBearerData.expire_date = oCurrentDate;
		  	$.sap.log.debug("*** STORE BEARER: " + JSON.stringify(oBearerData));
		  	storage.put(GlobalConstants.STORAGE_BEARER, oBearerData);
		},
		
		/** 
		 * Removes the bearer  amd the user info from local storage
		 * @public
		 */
		removeBearerFromLocalStorage: function(){
			$.sap.log.debug("*** REMOVE BEARER");
			storage.remove(GlobalConstants.STORAGE_BEARER);
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