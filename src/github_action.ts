import * as core from "@actions/core";
import { StoreApis, EnvVariablePrefix } from "./store_apis";

(async function main() {
  const storeApis = new StoreApis();

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
      if (tenantId) storeApis.tenantId = tenantId;
      if (clientId) storeApis.clientId = clientId;
      if (clientSecret) storeApis.clientSecret = clientSecret;
      
      // Set product configuration if provided
      if (productId) storeApis.productId = productId;
      if (sellerId) storeApis.sellerId = sellerId;
      
      // Initialize authentication
      await storeApis.InitAsync();
    }
    
    switch (command) {
      case "configure": {
        core.setFailed(
          `The 'configure' command has been deprecated. Please provide credentials and configuration directly in the 'update' or 'publish' commands using the 'product-id', 'seller-id', 'tenant-id', 'client-id', and 'client-secret' inputs. If 'tenant-id', 'client-id', and 'client-secret' are not provided, DefaultAzureCredential will be used for authentication.`
        );
        break;
      }

      case "get": {
        const moduleName = core.getInput("module-name");
        const listingLanguage = core.getInput("listing-language");
        const draftSubmission = await storeApis.GetExistingDraft(
          moduleName,
          listingLanguage
        );
        core.setOutput("draft-submission", draftSubmission);

        break;
      }

      case "update": {
        const updatedMetadataString = core.getInput("metadata-update");
        const updatedProductString = core.getInput("product-update");
        if (!updatedMetadataString && !updatedProductString) {
          core.setFailed(
            `Nothing to update. Both product-update and metadata-update are null.`
          );
          return;
        }

        if (updatedMetadataString) {
          const updateSubmissionMetadata =
            await storeApis.UpdateSubmissionMetadata(updatedMetadataString);
          console.log(updateSubmissionMetadata);
        }

        if (updatedProductString) {
          const updateSubmissionData = await storeApis.UpdateProductPackages(
            updatedProductString
          );
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

        const publishingStatus = await storeApis.PollSubmissionStatus(
          pollingSubmissionId
        );
        core.setOutput("submission-status", publishingStatus);

        break;
      }

      case "publish": {
        const submissionId = await storeApis.PublishSubmission();
        core.setOutput("polling-submission-id", submissionId);

        break;
      }

      default: {
        core.setFailed(`Unknown command - ("${command}").`);

        break;
      }
    }
  } catch (error: unknown) {
    core.setFailed(error as string);
  }
})();
