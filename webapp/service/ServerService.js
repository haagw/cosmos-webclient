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
	
	/**
	 * @class Manages the Server communication. 
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.service.ServerService
	 */
	var Service = Object.extend("com.canon.cosmos.webclient.service.ServerService", {

		/** 
		 * Constructor
		 * @public
		 */
		constructor: function(){ 
		},


		getInformationList: function(getInformationListCallback) {
			
			var uri = GlobalProperties.getWebApiDataSource().getProperty("/uri") + "cosmos-webapi/v3/server/list/informations";

			var oInformation = new JSONModel();
			oInformation.attachRequestCompleted(function (oEvent){
				
				oEvent.sender = getInformationListCallback.sender;
				if(oEvent.getParameters().success === false){
					getInformationListCallback.onError(oEvent);
				}else{
					getInformationListCallback.onSuccess(oEvent);
				}
				
			});
			oInformation.loadData(uri, "", true, "GET", false, false, null); 
			
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