sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ValueState",
	"com/canon/cosmos/webclient/util/FormsValidator",
	"com/canon/cosmos/webclient/service/OAuthService"
], function(ManagedObject, JSONModel, ValueState, FormsValidator, OAuthService){
	
	
	return ManagedObject.extend("com.canon.cosmos.webclient.controller.AuthDialog", {
		
		/** 
		 * Constructor
		 * @param {sap.ui.core.mvc.View} oParentView - The view creates the dialog
		 */
		constructor: function(oParentView) {
			this._oParentView = oParentView;
			this._oAuthDialog = oParentView.byId("authDialog");
			
			// Attaches validation handlers
            sap.ui.getCore().attachValidationError(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.Error);
            });
            sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.None);
            });
		},
		
		
		open: function() {
			
			if (!this._oAuthDialog) {
			
				var oFragmentController = {
					onCloseButtonPressed: function(oEvent) {
						$.sap.log.debug("Closing auth dialog");
						sap.ui.getCore().getMessageManager().removeAllMessages();
						oEvent.getSource().getParent().close();
					},
					onLoginButtonPressed: function(oEvent){
						$.sap.log.debug("Handle login");
						var formsValidator = new FormsValidator();
						formsValidator.validate(oEvent.getSource().getParent());
						if(formsValidator.isValid() === true){
							var userValue = oEvent.getSource().getParent().getModel("input").getProperty("/userValue");
							var passwordValue = oEvent.getSource().getParent().getModel("input").getProperty("/passwordValue");
							var serviceCallback = {
								sender : oEvent.getSource().getParent(),
								onError : function(oEventError){
									$.sap.log.debug("Handle Error");
									var oErrorObject = oEventError.getParameters().errorobject;
									if(oErrorObject.statusCode === 0){
										$.sap.log.debug(oErrorObject.statusText);
										oEventError.sender.getModel("input").setProperty("/errorText",oErrorObject.statusText);
					        		}else{
					        			var responseJSON = new JSONModel();
					        			responseJSON.setJSON(oErrorObject.responseText);
					        			oEventError.sender.getModel("input").setProperty("/errorText", responseJSON.getProperty("/error") + "\n" + responseJSON.getProperty("/error_description") );
					        		}
								},
								onSuccess : function(oEvenSuccess){
									var appView = oEvenSuccess.sender.getParent();
									OAuthService.getInstance().setBearerToLocalStorage(oEvenSuccess.getSource().getData());
									appView.getController().setUserInformation(OAuthService.getInstance().getBearerFromLocalStorage());
									oEvenSuccess.sender.close();
								}
							};
							OAuthService.getInstance().getBearer(userValue, passwordValue, serviceCallback); 
							
						}
					}
				};
							// create dialog via fragment factory
				this._oAuthDialog = sap.ui.xmlfragment(this._oParentView.getId(), "com.canon.cosmos.webclient.view..fragment.AuthDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				this._oParentView.addDependent(this._oAuthDialog);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this._oParentView.getController().getOwnerComponent().getContentDensityClass(), this._oParentView, this._oAuthDialog);
			}

			var inputModel = new JSONModel({"userValue": "", "passwordValue" : "", "errorText" : ""});
			this._oAuthDialog.setModel(inputModel, "input"); 
			this._oAuthDialog.open();
		}
		
	});
});