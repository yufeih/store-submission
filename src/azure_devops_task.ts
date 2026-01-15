import tl = require("azure-pipelines-task-lib/task");
import { StoreApis } from "./store_apis";

(async function main() {
  const storeApis = new StoreApis();

  try {
    const command = tl.getInput("command");
    
    // Load credentials and configuration for all commands except configure
    if (command !== "configure") {
      // Get credentials from inputs (optional for DefaultAzureCredential)
      const tenantId = tl.getInput("tenantId");
      const clientId = tl.getInput("clientId");
      const clientSecret = tl.getInput("clientSecret");
      
      // Get product configuration
      const productId = tl.getInput("productId");
      const sellerId = tl.getInput("sellerId");
      
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
        tl.setResult(
          tl.TaskResult.Failed,
          `The 'configure' command has been deprecated. Please provide credentials and configuration directly in the 'update' or 'publish' commands using the 'productId', 'sellerId', 'tenantId', 'clientId', and 'clientSecret' inputs. If 'tenantId', 'clientId', and 'clientSecret' are not provided, DefaultAzureCredential will be used for authentication.`
        );
        break;
      }

      case "get": {
        const moduleName = tl.getInput("moduleName") || "";
        const listingLanguage = tl.getInput("listingLanguage") || "en";
        const draftSubmission = await storeApis.GetExistingDraft(
          moduleName,
          listingLanguage
        );
        tl.setVariable("draftSubmission", draftSubmission.toString());

        break;
      }

      case "update": {
        const updatedMetadataString = tl.getInput("metadataUpdate");
        const updatedProductString = tl.getInput("productUpdate");
        if (!updatedMetadataString && !updatedProductString) {
          tl.setResult(
            tl.TaskResult.Failed,
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
        const pollingSubmissionId = tl.getInput("pollingSubmissionId");

        if (!pollingSubmissionId) {
          tl.setResult(
            tl.TaskResult.Failed,
            `pollingSubmissionId parameter cannot be empty.`
          );
          return;
        }

        const publishingStatus = await storeApis.PollSubmissionStatus(
          pollingSubmissionId
        );
        tl.setVariable("submissionStatus", publishingStatus);

        break;
      }

      case "publish": {
        const submissionId = await storeApis.PublishSubmission();
        tl.setVariable("pollingSubmissionId", submissionId);

        break;
      }

      default: {
        tl.setResult(tl.TaskResult.Failed, `Unknown command - ("${command}").`);

        break;
      }
    }
  } catch (error: unknown) {
    tl.setResult(tl.TaskResult.Failed, error as string);
  }
})();
