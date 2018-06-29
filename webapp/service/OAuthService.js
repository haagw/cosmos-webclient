/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"com/canon/cosmos/webclient/util/Constants",
	"sap/ui/model/json/JSONModel"
], function (Constants, JSONModel){
	"use strict";
	
	return {
		/** 
		 * Gets a bearer token from the server
		 * @param {string}  username The username
		 * @param {string}  password The pasword
		 * @param {boolean} [synch] optional, if true, the request is done in snchronous mode
		 * @returns {sap.ui.model.json.JSONModel} a defered token or then synch non defered
		 */
		getBearerToken: function(username, password, synch){
			// use this if you specifically want to know if b was passed
			var oModel = new JSONModel();
			var asynchron = false;
		    if (synch === undefined || synch === false) {
		        var deferred = $.Deferred();
		         asynchron = true;
		    }
			
            var payload =	"&grant_type=" + Constants.GRANT_TYPE + 
            				"&username=" + username + 
            				"&password=" + password + 
            				"&client_id=" + Constants.CLIENT_ID + 
            				"&client_secret=" + Constants.CLIENT_SECRET;
            
			$.ajax({
				url: "http://localhost:8088/cosmos-webauth/oauth/token",
				type : "post",
				contentType : "application/x-www-form-urlencoded;charset=UTF-8",
				data: payload,
				dataType : "json",
				async : asynchron,
				success: function(oData){
					oModel.setData(oData);
					if(asynchron){
						deferred.resolve(oModel);
					}
				},
				error : function(err){
					$.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(err.statusText, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.CLOSE],
						id: "messageBoxId2",
						details: err.responseText,
						styleClass: "sapUiSizeCompact",
						contentWidth: "100px"
					});                      
					$.sap.log.error(err.statusText);
					if(asynchron){
						deferred.reject();
					}
					
				}
			});
			if(asynchron){
				return deferred.promise();
			}else{
				return oModel;
			}
		}
		
		
	};
});