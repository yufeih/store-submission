# Microsoft Store Submission

This is a GitHub Action to update EXE and MSI apps in the Microsoft Store.

## Quick start

1. Ensure you meet the [prerequisites](#prerequisites).

2. [Install](https://aka.ms/store-submission) the extension.

3. Set up authentication using either [DefaultAzureCredential](#authentication-with-defaultazurecredential-recommended) (recommended) or [traditional credentials](#authentication-with-explicit-credentials).

4. [Add tasks](#task-reference) to your release definitions.

## Prerequisites

1. You must have an Azure AD directory, and you must have [global administrator permission](https://azure.microsoft.com/documentation/articles/active-directory-assign-admin-roles/) for the directory. You can create a new Azure AD [from Partner Center](https://msdn.microsoft.com/windows/uwp/publish/manage-account-users).

2. You must associate your Azure AD directory with your Partner Center account to obtain the credentials to allow this extension to access your account and perform actions on your behalf.

3. The app you want to publish must already exist: this extension can only publish updates to existing applications. You can [create your app in Partner Center](https://msdn.microsoft.com/windows/uwp/publish/create-your-app-by-reserving-a-name).

4. You must have already [created at least one submission](https://msdn.microsoft.com/windows/uwp/publish/app-submissions) for your app before you can use the Publish task provided by this extension. If you have not created a submission, the task will fail.

5. More information and extra prerequisites specific to the API can be found [here](https://msdn.microsoft.com/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services).

## Authentication

### Authentication with DefaultAzureCredential (Recommended)

The extension now supports passwordless authentication using Azure's DefaultAzureCredential. This is the recommended approach as it automatically uses credentials from your Azure CLI login or managed identity.

To use this method:

1. In your GitHub Actions workflow, use the [azure/login](https://github.com/Azure/login) action before calling this action
2. Do not provide `tenant-id`, `client-id`, or `client-secret` inputs
3. The action will automatically use the credentials from the Azure login

This approach is more secure and eliminates the need to store client secrets.

### Authentication with Explicit Credentials

If you prefer to use explicit credentials or cannot use DefaultAzureCredential, you can still provide the traditional credentials.

Your credentials are comprised of three parts: the Azure **Tenant ID**, the **Client ID** and the **Client secret**.
Follow these steps to obtain them:

1. In Partner Center, go to your **Account settings**, click **Manage users**, and associate your organization's Partner Center account with your organization's Azure AD directory. For detailed instructions, see [Manage account users](https://msdn.microsoft.com/windows/uwp/publish/manage-account-users).

2. In the **Manage users** page, click **Add Azure AD applications**, add the Azure AD application that represents the app or service that you will use to access submissions for your Partner Center account, and assign it the **Manager** role. If this application already exists in your Azure AD directory, you can select it on the **Add Azure AD applications** page to add it to your Partner Center account. Otherwise, you can create a new Azure AD application on the **Add Azure AD applications** page. For more information, see [Add and manage Azure AD applications](https://msdn.microsoft.com/windows/uwp/publish/manage-account-users#add-and-manage-azure-ad-applications).

3. Return to the **Manage users** page, click the name of your Azure AD application to go to the application settings, and copy the **Tenant ID** and **Client ID** values.

4. Click **Add new key**. On the following screen, copy the **Key** value, which corresponds to the **Client secret**. You *will not* be able to access this info again after you leave this page, so make sure to not lose it. For more information, see the information about managing keys in [Add and manage Azure AD applications](https://msdn.microsoft.com/windows/uwp/publish/manage-account-users#add-and-manage-azure-ad-applications).

See more details on how to create a new Azure AD application account in your organizaiton's directory and add it to your Partner Center account [here](https://docs.microsoft.com/windows/uwp/publish/add-users-groups-and-azure-ad-applications#create-a-new-azure-ad-application-account-in-your-organizations-directory-and-add-it-to-your-partner-center-account).

## Obtaining App Metadata

### Seller ID

The Seller ID can be found by clicking the gear icon in the upper right corner of the [Partner Center](https://partner.microsoft.com) and selecting `Account Settings`. You can find the Seller ID under [Legal info](https://partner.microsoft.com/dashboard/account/v3/organization/legalinfo)

### Product ID

The Product ID can be found by navigating to the overview of your application in the [Partner Center](https://partner.microsoft.com) and copying the Partner Center ID.

## Task reference

### Microsoft Store Submission

This action allows you to publish your app on the Store by creating a submission in Partner Center.

## Sample Usage

### Using DefaultAzureCredential (Recommended)

```yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  start-store-submission:
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Update Draft Submission
        uses: microsoft/store-submission@v1
        with:
          command: update
          type: win32
          seller-id: ${{ secrets.SELLER_ID }}
          product-id: ${{ secrets.PRODUCT_ID }}
          product-update: '{"packages":[{"packageUrl":"https://cdn.contoso.us/prod/5.10.1.4420/ContosoIgniteInstallerFull.msi","languages":["en"],"architectures":["X64"],"isSilentInstall":true}]}'

      - name: Publish Submission
        uses: microsoft/store-submission@v1
        with:
          command: publish
          seller-id: ${{ secrets.SELLER_ID }}
          product-id: ${{ secrets.PRODUCT_ID }}
```

### Using Explicit Credentials

```yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  start-store-submission:
    runs-on: ubuntu-latest
    steps:
      - name: Update Draft Submission
        uses: microsoft/store-submission@v1
        with:
          command: update
          type: win32
          seller-id: ${{ secrets.SELLER_ID }}
          product-id: ${{ secrets.PRODUCT_ID }}
          tenant-id: ${{ secrets.TENANT_ID }}
          client-id: ${{ secrets.CLIENT_ID }}
          client-secret: ${{ secrets.CLIENT_SECRET }}
          product-update: '{"packages":[{"packageUrl":"https://cdn.contoso.us/prod/5.10.1.4420/ContosoIgniteInstallerFull.msi","languages":["en"],"architectures":["X64"],"isSilentInstall":true}]}'

      - name: Publish Submission
        uses: microsoft/store-submission@v1
        with:
          command: publish
          seller-id: ${{ secrets.SELLER_ID }}
          product-id: ${{ secrets.PRODUCT_ID }}
          tenant-id: ${{ secrets.TENANT_ID }}
          client-id: ${{ secrets.CLIENT_ID }}
          client-secret: ${{ secrets.CLIENT_SECRET }}
```
