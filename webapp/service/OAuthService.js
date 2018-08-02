/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/Object",
	"com/canon/cosmos/webclient/util/GlobalConstants",
	"sap/ui/model/json/JSONModel",
	"com/canon/cosmos/webclient/util/GlobalProperties",
	"com/canon/cosmos/webclient/controller/LoginDialog"
], function (Object, GlobalConstants, JSONModel, GlobalProperties, LoginDialog){
	"use strict";
	var instance;
	
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
			this._Storage = $.sap.storage($.sap.storage.Type.local);
		},

		/** 
		 * Gets a bearer token from the server
		 * @public
		 * @param {string}  username The username
		 * @param {string}  password The pasword
		 * @returns {sap.ui.model.json.JSONModel} a promised token 
		 */
		getBearer: function(username, password) {

			var deferred = $.Deferred();
			var baseUri = GlobalProperties.getWebApiDataSource().getProperty("/uri");
			var payload = "&grant_type=" + GlobalConstants.GRANT_TYPE.PASSWORD +
				"&username=" + username +
				"&password=" + password +
				"&client_id=" + GlobalConstants.CLIENT_ID +
				"&client_secret=" + GlobalConstants.CLIENT_SECRET;

			$.ajax({
				url: baseUri + "cosmos-webauth/oauth/token",
				type: "post",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				data: payload,
				dataType: "json",
				success: function(oData) {
					deferred.resolve(oData);
				},
				error: function(err) {
					$.sap.log.error(err.statusText);
					err.baseURI = baseUri;
					deferred.reject(err);
				}
			});
			return deferred.promise();
		},


		
		/** 
		 * Gets the User Information
		 * @param {string} accesstoken The accesstoken to get the data
		 * @returns {JSONModel} The model with the data
		 */
		getUserInformation : function (oBearer){

			var oCheckedBaerer = instance.checkBeraer(oBearer);
			var deferred = $.Deferred();
			var baseUri = GlobalProperties.getWebApiDataSource().getProperty("/uri");
			$.ajax({
				url: baseUri + "cosmos-webauth/oauth/check_token?token=" + oCheckedBaerer.access_token,
				type: "get",
				dataType: "json",
				success: function(oUserData) {
					deferred.resolve(oUserData);
				},
				error: function(err) {
					$.sap.log.error(err.statusText);
					deferred.reject(err);
				}
			});

			return deferred.promise();

		},
		
		checkBeraer: function(oBearer){
			if(oBearer.access_token_valid === false){
				var oNewBearer = instance._getNewBearer(oBearer);
				if(oNewBearer.status !== null && oNewBearer.status === 400){
					var promise = instance._showPasswordDialog();
					$.when(promise)
		    		.done( function() {
						return null;
		    		})
		        	.fail( function(err)  {
					});
				}else{
					return instance.setBearerToLocalStorage(oNewBearer);
				}
			}else{
				return oBearer;
			}

		},
		
		_showPasswordDialog: function(){
/*			var deferred = $.Deferred();
				this._loginDialog = new LoginDialog(null);
				var loginDialogCallback = {
						onLoginDone : function(){
							var bearer = instance.getBearerFromLocalStorage();
							
						}
						
				};
				this._loginDialog.open(loginDialogCallback); 
			    
			return deferred.promise();*/
		},
		
		/** 
		 * Gets a bearer token from the server
		 * @private
		 * @param {string}  refreshtoken The Refreshtoken
		 * @returns {sap.ui.model.json.JSONModel} a promised token 
		 */
		_getNewBearer: function(oBearer) {
			var oResult;
			var baseUri = GlobalProperties.getWebApiDataSource().getProperty("/uri");
			var payload = "&grant_type=" + GlobalConstants.GRANT_TYPE.REFRESH_TOKEN +
				"&client_id=" + GlobalConstants.CLIENT_ID +
				"&client_secret=" + GlobalConstants.CLIENT_SECRET +
				"&refresh_token=" + oBearer.refresh_token;

			$.ajax({
				url: baseUri + "cosmos-webauth/oauth/token",
				type: "post",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				data: payload,
				dataType: "json",
				async:false,
				success: function(oBearerResult) {
					oResult = oBearerResult;
				},
				error: function(err) {
					$.sap.log.error(err.statusText);
					oResult = err;
				}
			});
			return oResult;
		},

		/** 
		 * Gets the extended bearer model from local storage
		 * @public
		 * @returns {string} The JSONString
		 */
		getBearerFromLocalStorage: function() {
			var oBearer = this._Storage.get(GlobalConstants.STORAGE_BEARER);
			if (oBearer === null) {
				return null;
			} else {
				if (new Date().getTime() > oBearer.expire_date) {
					oBearer.access_token_valid = false;
				} else {
					oBearer.access_token_valid = true;
				}
				return oBearer;

			}
		},
		
		/** 
		 * Sets the Bearer fo the local storage
		 * @public
		 * @param {string} oBearer The Bearer JSONString
		 */
		setBearerToLocalStorage:function(oBearer){

		  	//Compute access_token expire date
		  	var oCurrentDate = new Date();
		  	var time = oCurrentDate.getTime() + ((oBearer.expires_in - 5) * 1000);
		  	oCurrentDate = oCurrentDate.setTime(time);
		  	oBearer.expire_date = oCurrentDate;
		  	this._Storage.put(GlobalConstants.STORAGE_BEARER, oBearer);
		  	return oBearer;
		},
		
		/** 
		 * Removes the bearer from local storage
		 * @public
		 */
		removeBearerFromLocalStorage: function(){
			this._Storage.remove(GlobalConstants.STORAGE_BEARER);
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