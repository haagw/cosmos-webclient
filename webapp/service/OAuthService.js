/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"com/canon/cosmos/webclient/util/GlobalConstants",
	"sap/ui/model/json/JSONModel",
	"com/canon/cosmos/webclient/util/GlobalProperties"
], function (GlobalConstants, JSONModel, GlobalProperties){
	"use strict";
	
	return {
		
		
		
		/** 
		 * Gets a bearer token from the server
		 * @param {string}  username The username
		 * @param {string}  password The pasword
		 * @returns {sap.ui.model.json.JSONModel} a promised token 
		 */
		getBearerToken: function(username, password){
			var oModel = new JSONModel();
		    var deferred = $.Deferred();
		    var baseUri = GlobalProperties.getWebApiDataSource().getProperty("/uri");
            var payload =	"&grant_type=" + GlobalConstants.GRANT_TYPE + 
            				"&username=" + username + 
            				"&password=" + password + 
            				"&client_id=" + GlobalConstants.CLIENT_ID + 
            				"&client_secret=" + GlobalConstants.CLIENT_SECRET;
            
			$.ajax({
				url: baseUri + "cosmos-webauth/oauth/token",
				type : "post",
				contentType : "application/x-www-form-urlencoded;charset=UTF-8",
				data: payload,
				dataType : "json",
				success: function(oData){
					oModel.setData(oData);
					deferred.resolve(oModel);
				},
				error : function(err){
					$.sap.log.error(err.statusText);
					deferred.reject(err);
				}
			});
			return deferred.promise();
		}
		
	};
});