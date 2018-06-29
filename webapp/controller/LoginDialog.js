/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/ValueState",
	"com/canon/cosmos/webclient/util/FormsValidator"
], function(ManagedObject, JSONModel, BindingMode, ValueState, FormsValidator) {
	"use strict";
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
			this._oView = oView;
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
		 * Opens the dialog
		 */
		open: function() {
			var oDialog = this._oView.byId("loginDialog");
			var oLoginErrorMessage = this._oView.byId("loginErrorMessage");
			var oModel = new JSONModel({
                InputUserValue: "",
                InputPasswordValue: ""
            });
            oModel.setDefaultBindingMode(BindingMode.TwoWay);
			// create dialog lazily
			if (!oDialog) {
				
				var oFragmentController = {
					onClose: function() {
						sap.ui.getCore().getMessageManager().removeAllMessages();
						oLoginErrorMessage.setVisible(false);
						oDialog.getModel().setData(null);
						oDialog.close();
					},
					onLogin: function(){
						var formsValidator = new FormsValidator();
						formsValidator.validate(oDialog);
						if(formsValidator.isValid() === true){
							var _oModel = oDialog.getModel();
							oLoginErrorMessage.setText(_oModel.getProperty('/InputUserValue'));
							oLoginErrorMessage.setVisible(true);
							
							
							
						}
						
					}
				};
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(this._oView.getId(), "com.canon.cosmos.webclient.view.LoginDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				this._oView.addDependent(oDialog);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this._oView.getController().getContentDensityClass(), this._oView, oDialog);
				oLoginErrorMessage = this._oView.byId("loginErrorMessage");
			}
			
			oDialog.setModel(oModel);
			oDialog.open();
		}
	});

});