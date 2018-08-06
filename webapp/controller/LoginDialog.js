/**
 * Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 * Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/ValueState",
	"com/canon/cosmos/webclient/util/FormsValidator",
	"com/canon/cosmos/webclient/service/OAuthService",
	"com/canon/cosmos/webclient/formatter/i18nTranslater"
], function(ManagedObject, JSONModel, BindingMode, ValueState, FormsValidator, OAuthService, i18nTranslater) {
	"use strict";
	
	var oLoginErrorMessage;
	var oParentView;
	var oLoginDialog;
	
	/**
	 * @class The login dialog
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.LoginDialog
	 */
	return ManagedObject.extend("com.canon.cosmos.webclient.controller.LoginDialog", {
		
		
		
		/** 
		 * Constructor
		 * @param {sap.ui.core.mvc.View} oView - The view creates the dialog
		 */
		constructor: function(oView) {
			oParentView = oView;
			oLoginErrorMessage = oParentView.byId("loginErrorMessage");
			oLoginDialog = oParentView.byId("loginDialog");
			// Attaches validation handlers
            sap.ui.getCore().attachValidationError(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.Error);
            });
            sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.None);
            });
		},

		
		/** 
		 * exits the dialog
		 */
		exit: function() {
			delete this._oView;
		},



		/** 
		 * Opens this dialog 
		 * @param callback The reference to the callback
		 */
		open: function(callback) {
			
			var oModel = new JSONModel({
                InputUserValue: "",
                InputPasswordValue: ""
            });
            oModel.setDefaultBindingMode(BindingMode.TwoWay);
			// create dialog lazily
			if (!oLoginDialog) {
				
				
				var oFragmentController = {
					onCloseButtonPressed: function() {
						sap.ui.getCore().getMessageManager().removeAllMessages();
						oLoginErrorMessage.setVisible(false);
						oLoginDialog.getModel().setData(null);
						oLoginDialog.close();
					},
					onLoginButtonPressed: function(event){
						var formsValidator = new FormsValidator();
						formsValidator.validate(oLoginDialog);
						if(formsValidator.isValid() === true){
							var username = oModel.getProperty("/InputUserValue");
							var password = oModel.getProperty("/InputPasswordValue");
							var promise = OAuthService.getInstance().getBearer(username, password);  
							$.when(promise)
			        		.done( function(oModelBearer) {
								OAuthService.getInstance().setBearerToLocalStorage(oModelBearer);
								callback.onAuthDone();
								oLoginErrorMessage.setVisible(false);
								//oLoginDialog.getModel().setData(null);
								oLoginDialog.close();
			        		})
				        	.fail( function(err)  {
				        		oLoginErrorMessage.setVisible(true);
				        		if(err.status === 0){
				        			oLoginErrorMessage.setText(i18nTranslater.doTranslate("connectionFailure", err.baseURI));
				        		}else{
				        			oLoginErrorMessage.setText(err.responseJSON.error + "\n" + err.responseJSON.error_description);
				        		}
				        	});
						}
					
						
					}
				};
				// create dialog via fragment factory
				oLoginDialog = sap.ui.xmlfragment(oParentView.getId(), "com.canon.cosmos.webclient.view.LoginDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				oParentView.addDependent(oLoginDialog);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(oParentView.getController().getContentDensityClass(), oParentView, oLoginDialog);
				oLoginErrorMessage = oParentView.byId("loginErrorMessage");
			}
			
			oLoginDialog.setModel(oModel);
			oLoginDialog.open();
		}
	});

});