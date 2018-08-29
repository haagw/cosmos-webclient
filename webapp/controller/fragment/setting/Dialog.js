/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"com/canon/cosmos/webclient/formatter/i18nTranslater",
	"com/canon/cosmos/webclient/util/GlobalConstants"
], function(ManagedObject, JSONModel, i18nTranslater, GlobalConstants) {

	var that;

	return ManagedObject.extend("com.canon.cosmos.webclient.controller.fragment.setting.Dialog", {

		/** 
		 * Constructor
		 * @param {sap.ui.core.mvc.View} oParentView - The view creates the dialog
		 */
		constructor: function(oParentView) {
			that = this;
			this.oParentView = oParentView;
			$.sap.require("jquery.sap.storage");
			this.storage = $.sap.storage($.sap.storage.Type.local);

		},
		
		/** 
		 * Destroys the ressources when dialog closing
		 */
		exit: function() {
			delete that._oParentView;
		},

		/** 
		 * Opens the dialog
		 */
		open: function() {
			var oSettingsDialog = this.oParentView.byId("settingsDialog");
			var detailfragment;
			var controls;

			if (!oSettingsDialog) {
				
				//The fragment controller
				var oFragmentController = {
					
					//Used in hte XML
					i18nTranslater: i18nTranslater,

					/** 
					 * Close button pressed
					 */
					onCloseButtonPressed: function() {
						that.oParentView.removeDependent(oSettingsDialog);
						oSettingsDialog.close();
						oSettingsDialog.destroy();
						//Calls the exit method in the kife cycle
						that.destroy();
					},
					

					/** 
					 * Tree item pressed
					 * @param {sap.ui.base.Event} oEvent The event
					 */
					onMasterPressed: function(oEvent) {
						if (detailfragment) {
					        detailfragment.destroy(true);
					    }
						that.oParentView.byId("detailContainer").removeAllContent();
						var oContext = oEvent.getParameter("listItem").getBindingContext("settingModel");
						var node = oContext.getModel("settingModel").getProperty(oContext.getPath() + "/id").slice(5);
						
						var refControls = oSettingsDialog.getModel("settingModel").getProperty(oContext.getPath() + "/refControls");
						controls = oSettingsDialog.getModel("settingModel").getProperty("/" + refControls);
						oSettingsDialog.setModel(that._prepareFragmentModel(controls));
						detailfragment = sap.ui.xmlfragment(that.oParentView.getId(), "com.canon.cosmos.webclient.view.fragment.setting." + node, oFragmentController);
						that.oParentView.byId("detailContainer").addContent(detailfragment);
						
					},
					
					
					/** 
					 * Button default pressed
					 * @param {sap.ui.base.Event} oEvent The event
					 */
					onBtnDefault: function(oEvent){
						$.each(controls, function(index, value){
							if(value.id.startsWith("sel") || value.id.startsWith("chk")){
								oSettingsDialog.getModel().setProperty("/" + value.id + "CurrentValue", value.defaultValue);
							}
						});
						sap.m.MessageToast.show(i18nTranslater.doTranslate("settingMassageDefaultValueSet"), {});
					},
					
					/** 
					 * Button apply pressed
					 * @param {sap.ui.base.Event} oEvent The event
					 */
					onButtonApply: function(oEvent){
						$.each(controls, function(index, value){
							if(value.id.startsWith("sel") || value.id.startsWith("chk")){
								var key = oSettingsDialog.getModel().getProperty("/" + value.id + "CurrentValue");
								var settingsStorage = new JSONModel(that.storage.get(GlobalConstants.STORAGE_SETTINGS));
								settingsStorage.setProperty("/" + value.id, key);
								that.storage.put(GlobalConstants.STORAGE_SETTINGS, settingsStorage.getData());
							}
						});
						
						that.oParentView.getController().getOwnerComponent().initializeSettings();
						sap.m.MessageToast.show(i18nTranslater.doTranslate("settingMassageApplyValues"), {});
						
						
					}
				};
				// create dialog via fragment factory
				oSettingsDialog = sap.ui.xmlfragment(that.oParentView.getId(), "com.canon.cosmos.webclient.view.fragment.setting.Dialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				that.oParentView.addDependent(oSettingsDialog);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(that.oParentView.getController().getOwnerComponent().getContentDensityClass(), that.oParentView, oSettingsDialog);
				
				//Load the model
				var oModel = new JSONModel("model/setting/settingModel.json");
				oSettingsDialog.setModel(oModel, "settingModel");
				
				//Used while asynchronus call
				oModel.attachRequestCompleted(function (oEvent){
					var refControls = oSettingsDialog.getModel("settingModel").getProperty("/masterTree/0/refControls");
					controls = oSettingsDialog.getModel("settingModel").getProperty("/" + refControls);
					oSettingsDialog.setModel(that._prepareFragmentModel(controls));
					detailfragment = sap.ui.xmlfragment(that.oParentView.getId(), "com.canon.cosmos.webclient.view.fragment.setting.DetailGlobal",oFragmentController);
					that.oParentView.byId("detailContainer").addContent(detailfragment);
					oSettingsDialog.open();
				});
				
			}else{
				oSettingsDialog.open();
			}
		},
		/** 
		 * Prepared a fragment model from contols
		 * @param {Objects} controls A collection of the defined controlls
		 * @returns {Object} the fragment model
		 */
		_prepareFragmentModel: function(controls){
			var fragmentModel = new JSONModel();
			var settingsStorage = new JSONModel(that.storage.get(GlobalConstants.STORAGE_SETTINGS));
			$.each(controls, function(index, value){
				if(value.id.startsWith("sel") || value.id.startsWith("chk")){
					var key = settingsStorage.getProperty("/" + value.id);
					if(key === null){
						fragmentModel.setProperty("/" + value.id + "CurrentValue", value.defaultValue);
					}else{
						fragmentModel.setProperty("/" + value.id + "CurrentValue", key);
					}
				}
			});
			
			var showButtonBar = true;
			if(controls.length === 0){
				showButtonBar = false;
			}
			
			fragmentModel.setProperty("/showButtonBar", showButtonBar);
			
			return fragmentModel;
		}

	});
});