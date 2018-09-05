/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/m/MessageBox",
	"com/oce/cosmos/formatter/i18nTranslater",
	"com/oce/cosmos/util/GlobalProperties"

], function(MessageBox, i18nTranslater, GlobalProperties) {
	"use strict";

	/**
	 * @class handles notifications (Error, Warning, Success, Information) thrown from different places
	 * @author Wolfgang Haag
	 * @public
	 * @name com.oce.cosmos.utils.InternalNotificationHandler
	 */
	return {

		/** 
		 * Handles the API-Exceptions in the services
		 * @static
		 * @param {Object} oEventError - the errorobject from the response
		 */
		notifyAPIException: function(oEventError) {
			
			var errorobject = oEventError.getParameters().errorobject;
			$.sap.log.error(oEventError.getParameters().errorobject);
			var url = oEventError.getParameters().url;
			var pos = url.indexOf("webapi");
			url = url.substring(pos + 7);
			var errorText = "";
			var errorDetail = "";
			//Check the error

			switch (errorobject.statusCode) {
				case 0:
					//No connection to the backend possible
					errorText = i18nTranslater.doTranslateMessage("errorLoadData");
					errorDetail = "<p><strong>Ressource:</strong> " + url + "</p>" +
						"<p><strong>" + i18nTranslater.doTranslateMessage("errorPossibleReasons") + "</strong></p>" +
						"<ul>" +
						"<li>" + i18nTranslater.doTranslateMessage("errorAPIBackend") + "</li>" +
						"<li>" + i18nTranslater.doTranslateMessage("errorProxyCORS") + "</li>";
					break;
				case 401:
					errorText = i18nTranslater.doTranslateMessage("errorText401");
					errorDetail = "<p><strong>Ressource:</strong> " + url + "</p>" +
						"<p><strong>" + i18nTranslater.doTranslateMessage("errorPossibleReasons") + "</strong></p>" +
						"<ul>" +
						"<li>" + i18nTranslater.doTranslateMessage("errorText404InvalidTocken") + "</li>" +
						"<li>" + i18nTranslater.doTranslateMessage("errorText404CORSSettings") + "</li>";
					break;
				case 404:
					errorText = i18nTranslater.doTranslateMessage("errorText404");
					errorDetail = errorobject.responseText;
					break;
				case 500:
				case 400:
				case 415:
					errorText = i18nTranslater.doTranslateMessage("errorText500");
					// is a API internal error
					try {
						var response = JSON.parse(errorobject.responseText);
					} catch (e) {
						errorDetail = errorobject.responseText;
						break;
					}
					
					errorDetail = "<p><strong>Ressource:</strong> " + url + "</p>" +
					"<p><strong>target: </strong></p>" + response.target +
					"<p><strong>message: </strong></p>" + response.message +
					"<p><strong>timestamp: </strong></p>" + response.timestamp;
					var subResponses = response.errorSubResponses;
					if(subResponses !== null && subResponses.length > 0){
					errorDetail = errorDetail + "<p>***** Sub Responses *****</p>";
						for (var aubResponse in subResponses ) {
							if (subResponses.hasOwnProperty(aubResponse)) {
								errorDetail = errorDetail +
								"<p><strong>target: </strong></p>" + aubResponse.target +
								"<p><strong>message: </strong></p>" + aubResponse.message +
								"<p><strong>timestamp: </strong></p>" + aubResponse.timestamp;
								}
						}
					}

					break;
			}
			
			var internalNotificationModel = {
					"type": "Error",
					"title": errorText,
					"subTitle": "Status: " + errorobject.statusCode,
					"detail": errorDetail,
					"counter": 1
			};

			MessageBox.show(errorText, {
				icon: MessageBox.Icon.ERROR,
				title: i18nTranslater.doTranslate("error"),
				actions: [sap.m.MessageBox.Action.CLOSE],
				id: "mbMainErrorDialog",
				details: errorDetail,
				styleClass: "sapUiSizeCompact",
				contentWidth: "400px"
			});
			
			this._updateNotifications(internalNotificationModel);
			
		},
		
		/** 
		 * Shows a message box and pushes the notification to the notification history
		 * @static
		 * @param {Object} oException - the exception contains name, message, detail
		 */
		notifyException : function (oException){

			var internalNotificationModel = {
					"type": "Error",
					"title": oException.name,
					"subTitle": oException.message,
					"detail": oException.detail,
					"counter": oException.detail === null ? 0 : 1
			};

			$.sap.log.Error(internalNotificationModel);
			
			MessageBox.show(internalNotificationModel.title + "\n" + internalNotificationModel.subTitle, {
				icon: MessageBox.Icon.Error,
				title: i18nTranslater.doTranslate("error"),
				actions: [sap.m.MessageBox.Action.CLOSE],
				id: "mbInternalNotifyDialog",
				details: internalNotificationModel.detail,
				styleClass: "sapUiSizeCompact",
				contentWidth: "400px"
			});
			
			this._updateNotifications(internalNotificationModel);
		},
		
		/** 
		 * Shows a message box and pushes the notification to the notification history
		 * @static
		 * @param {String} title - the title of the information
		 * @param {String} subtitle - the subtitle of the information
		 * @param {String} detail - the details (can be marked up language)
		 */
		notifyInformation: function(title, subtitle, detail){

			var internalNotificationModel = {
					"type": "Information",
					"title": title,
					"subTitle": subtitle,
					"detail": detail,
					"counter": detail.length === 0 ? 0 : 1
			};

			$.sap.log.info(internalNotificationModel);
			
			MessageBox.show(internalNotificationModel.title + "\n" + internalNotificationModel.subtitle, {
				icon: MessageBox.Icon.INFORMATION,
				title: i18nTranslater.doTranslate("info"),
				actions: [sap.m.MessageBox.Action.CLOSE],
				id: "mbInternalNotifyDialog",
				details: internalNotificationModel.detail,
				styleClass: "sapUiSizeCompact",
				contentWidth: "400px"
			});
			
			this._updateNotifications(internalNotificationModel);

		},
		
		/** 
		 * Shows a message box and pushes the notification to the notification history
		 * @static
		 * @param {String} title - the title of the success
		 * @param {String} subtitle - the subtitle of the notification
		 * @param {String} detail - the details (can be marked up language)
		 */
		notifySuccess: function(title, subtitle, detail){

			var internalNotificationModel = {
					"type": "Success",
					"title": title,
					"subTitle": subtitle,
					"detail": detail,
					"counter": detail.length === 0 ? 0 : 1
			};

			$.sap.log.info(internalNotificationModel);
			
			MessageBox.show(internalNotificationModel.title + "\n" + internalNotificationModel.subtitle, {
				icon: MessageBox.Icon.SUCCESS,
				title: i18nTranslater.doTranslate("success"),
				actions: [sap.m.MessageBox.Action.CLOSE],
				id: "mbInternalNotifyDialog",
				details: internalNotificationModel.detail,
				styleClass: "sapUiSizeCompact",
				contentWidth: "400px"
			});
			
			this._updateNotifications(internalNotificationModel);

		},
		
		
		/** 
		 * Shows a message box and pushes the notification to the notification history
		 * @static
		 * @param {String} title - the title of the warning
		 * @param {String} subtitle - the subtitle of the warning
		 * @param {String} detail - the details (can be marked up language)
		 */
		notifyWarning: function(title, subtitle, detail){

			var internalNotificationModel = {
					"type": "Warning",
					"title": title,
					"subTitle": subtitle,
					"detail": detail,
					"counter": detail.length === 0 ? 0 : 1
			};

			$.sap.log.warning(internalNotificationModel);
			
			MessageBox.show(internalNotificationModel.title + "\n" + internalNotificationModel.subtitle, {
				icon: MessageBox.Icon.WARNING,
				title: i18nTranslater.doTranslate("warn"),
				actions: [sap.m.MessageBox.Action.CLOSE],
				id: "mbInternalNotifyDialog",
				details: internalNotificationModel.detail,
				styleClass: "sapUiSizeCompact",
				contentWidth: "400px"
			});
			
			this._updateNotifications(internalNotificationModel);
		
			

		},
		clearNotifications : function(){
			var notificationModel = sap.ui.getCore().byId("webclient---app").getModel("notification");
			var notifications = notificationModel.getProperty("/internalNotifications");
			notifications.length = 0;
			notificationModel.refresh(true);
		},
		
		/** 
		 * Method to updateNotifications in the model
		 * @static
		 * @private
		 * @param {sap.m.JSONModel} internalNotificationModel - the notification model
		 */
		_updateNotifications : function(internalNotificationModel){
			var notificationModel = sap.ui.getCore().byId("webclient---app").getModel("notification");
			var notifications = notificationModel.getProperty("/internalNotifications");
			notifications.push(internalNotificationModel);
			var maxCount = GlobalProperties.getMaxCountOfNotifications();
			if(notifications.length > maxCount){
				notifications.shift();	
			}
			notificationModel.refresh(true);
		}
		


	};
});