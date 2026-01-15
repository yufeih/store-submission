"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const store_apis_1 = require("./store_apis");
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const storeApis = new store_apis_1.StoreApis();
        try {
            const command = core.getInput("command");
            // Load credentials and configuration for all commands except configure
            if (command !== "configure") {
                // Get credentials from inputs (optional for DefaultAzureCredential)
                const tenantId = core.getInput("tenant-id");
                const clientId = core.getInput("client-id");
                const clientSecret = core.getInput("client-secret");
                // Get product configuration
                const productId = core.getInput("product-id");
                const sellerId = core.getInput("seller-id");
                // Set credentials if provided
                if (tenantId)
                    storeApis.tenantId = tenantId;
                if (clientId)
                    storeApis.clientId = clientId;
                if (clientSecret)
                    storeApis.clientSecret = clientSecret;
                // Set product configuration if provided
                if (productId)
                    storeApis.productId = productId;
                if (sellerId)
                    storeApis.sellerId = sellerId;
                // Initialize authentication
                yield storeApis.InitAsync();
            }
            switch (command) {
                case "configure": {
                    core.setFailed(`The 'configure' command has been deprecated. Please provide credentials and configuration directly in the 'update' or 'publish' commands using the 'product-id', 'seller-id', 'tenant-id', 'client-id', and 'client-secret' inputs. If 'tenant-id', 'client-id', and 'client-secret' are not provided, DefaultAzureCredential will be used for authentication.`);
                    break;
                }
                case "get": {
                    const moduleName = core.getInput("module-name");
                    const listingLanguage = core.getInput("listing-language");
                    const draftSubmission = yield storeApis.GetExistingDraft(moduleName, listingLanguage);
                    core.setOutput("draft-submission", draftSubmission);
                    break;
                }
                case "update": {
                    const updatedMetadataString = core.getInput("metadata-update");
                    const updatedProductString = core.getInput("product-update");
                    if (!updatedMetadataString && !updatedProductString) {
                        core.setFailed(`Nothing to update. Both product-update and metadata-update are null.`);
                        return;
                    }
                    if (updatedMetadataString) {
                        const updateSubmissionMetadata = yield storeApis.UpdateSubmissionMetadata(updatedMetadataString);
                        console.log(updateSubmissionMetadata);
                    }
                    if (updatedProductString) {
                        const updateSubmissionData = yield storeApis.UpdateProductPackages(updatedProductString);
                        console.log(updateSubmissionData);
                    }
                    break;
                }
                case "poll": {
                    const pollingSubmissionId = core.getInput("polling-submission-id");
                    if (!pollingSubmissionId) {
                        core.setFailed(`polling-submission-id parameter cannot be empty.`);
                        return;
                    }
                    const publishingStatus = yield storeApis.PollSubmissionStatus(pollingSubmissionId);
                    core.setOutput("submission-status", publishingStatus);
                    break;
                }
                case "publish": {
                    const submissionId = yield storeApis.PublishSubmission();
                    core.setOutput("polling-submission-id", submissionId);
                    break;
                }
                default: {
                    core.setFailed(`Unknown command - ("${command}").`);
                    break;
                }
            }
        }
        catch (error) {
            core.setFailed(error);
        }
    });
})();
//# sourceMappingURL=github_action.js.map