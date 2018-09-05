/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"com/oce/cosmos/util/GlobalConstants",
	"com/oce/cosmos/util/GlobalProperties",
	"com/oce/cosmos/service/OAuthService",
	"com/oce/cosmos/util/InternalNotificationHandler"
], function (Object,JSONModel, GlobalConstants, GlobalProperties, OAuthService, InternalNotificationHandler ){
	"use strict";
	var instance;
	
	/**
	 * @class Manages the Server communication. 
	 * @author Wolfgang Haag
	 * @public
	 * @name com.oce.cosmos.service.ServerService
	 */
	var Service = Object.extend("com.oce.cosmos.service.ServerService", {

		/** 
		 * Constructor
		 * @public
		 */
		constructor: function(){ 
		},


		/** 
		 * Gets information about the server (No authentification requiered)
		 * @param {function()} getInformationListCallback - the callback function
		 */
		getInformationList: function(getInformationListCallback) {
			
			var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webapi/v3/server/list/informations";

			var oInformation = new JSONModel();
			oInformation.attachRequestCompleted(function (oEvent){
				
				oEvent.sender = getInformationListCallback.sender;
				if(oEvent.getParameters().success === true){
					getInformationListCallback.onSuccess(oEvent);
				}else{
					InternalNotificationHandler.notifyAPIException(oEvent);
				}
				
			});
			oInformation.loadData(uri, "", true, "GET", false, "", null); 
			
		},
		
		/** 
		 * Gets license information about the server
		 * @param {object} oBearerModel a valid bearer 
		 * @param {function()} getLicenseInformationListCallback - the callback function
		 */
		getLicenseInformationList : function (getLicenseInformationListCallback) {

			var checkBearerCallback = {
				sender: getLicenseInformationListCallback.sender,
				onSuccess: function(oSubBearerModel){
					var oHeaders = {
					    "authorization" : "Bearer " + oSubBearerModel.getProperty("/access_token") 
					};
					
					var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webapi/v3/server/list/licenseInformations";
					var oLicenseInformation = new JSONModel();
					oLicenseInformation.attachRequestCompleted(function (oEvent){
						oEvent.sender = getLicenseInformationListCallback.sender;
						if(oEvent.getParameters().success === true){
							getLicenseInformationListCallback.onSuccess(oEvent);
						}else{
							InternalNotificationHandler.notifyAPIException(oEvent);
							
						}
					});
					oLicenseInformation.loadData(uri, "", true, "GET", false, "", oHeaders); 
					
				},
				onError: function(oError){
					getLicenseInformationListCallback.onError(oError);
				}
			};
			var oBearerModel = OAuthService.getInstance().getBearerModelFromLocalStorage();
			OAuthService.getInstance().checkBearer(oBearerModel, checkBearerCallback);
			
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