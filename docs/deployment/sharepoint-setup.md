# SharePoint Setup Guide

This guide explains how to connect ByteHR AI to your SharePoint document library.

> **Personal OneDrive / "-my.sharepoint.com" sites:** If your documents live under a personal
> site like `https://<tenant>-my.sharepoint.com/personal/<user>/Documents/<Folder>`
> (e.g. `engit-my.sharepoint.com/personal/kejsi_kostdhima_eng_it/Documents/ByteHR`), see
> [Section 4b](#4b-personal-onedrive-site-ids) below for the correct Site ID lookup and use
> `SHAREPOINT_FOLDER_PATH` to scope sync to just that subfolder.

---

## 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `ByteHR-SharePoint`
3. Supported account types: **Accounts in this organizational directory only**
4. Click **Register**
5. Note the **Application (client) ID** and **Directory (tenant) ID**

---

## 2. Add API Permissions

1. Go to your new app → **API permissions** → **Add a permission** → **Microsoft Graph**
2. Select **Application permissions** (not delegated)
3. Add:
   - `Sites.Read.All`
   - `Files.Read.All`
4. Click **Grant admin consent**

---

## 3. Create Client Secret

1. Go to **Certificates & secrets** → **New client secret**
2. Set an expiry (e.g. 24 months)
3. Copy the **secret value** (shown only once)

---

## 4. Find SharePoint IDs

### Site ID (team/site collection documents)

```bash
# Replace with your tenant and site name
curl -H "Authorization: Bearer <token>" \
  "https://graph.microsoft.com/v1.0/sites/your-tenant.sharepoint.com:/sites/HRDocuments"
```

Copy the `id` field from the response.

### 4b. Personal OneDrive Site IDs

For a personal/OneDrive site (URL contains `-my.sharepoint.com/personal/...`), resolve the
site by the `personal/<account>` path segment instead:

```bash
# Example for https://engit-my.sharepoint.com/personal/kejsi_kostdhima_eng_it/...
curl -H "Authorization: Bearer <token>" \
  "https://graph.microsoft.com/v1.0/sites/engit-my.sharepoint.com:/personal/kejsi_kostdhima_eng_it"
```

Copy the `id` field from the response — this is your `SHAREPOINT_SITE_ID`.

> Note: for personal OneDrive sites, you can also resolve the drive directly via
> `GET /v1.0/users/{userId}/drive` or `GET /v1.0/sites/{siteId}/drive` (singular),
> which returns the default document library without listing all drives.

### Drive ID

```bash
curl -H "Authorization: Bearer <token>" \
  "https://graph.microsoft.com/v1.0/sites/<site-id>/drives"
```

Copy the `id` of the document library drive (usually named "Documents").

---

## 5. Configure .env

```env
SHAREPOINT_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SHAREPOINT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SHAREPOINT_CLIENT_SECRET=your~secret~value
SHAREPOINT_SITE_ID=your-tenant.sharepoint.com,xxxxxxxx-xxxx,xxxxxxxx-xxxx
SHAREPOINT_DRIVE_ID=b!xxxxxxxxxxxxxxxxxxxxxxxxxx
# Optional: scope sync to a specific subfolder within the drive (e.g. the "ByteHR" folder
# in a personal OneDrive under Documents/ByteHR). Leave blank to scan the entire drive.
SHAREPOINT_FOLDER_PATH=ByteHR
SHAREPOINT_SYNC_ENABLED=true
BYTEHR_SOURCE_TYPE=sharepoint
```

> `SharePointClient` scans recursively starting at `SHAREPOINT_FOLDER_PATH` (or the drive
> root if left blank), so any nested subfolders under `ByteHR` are also included automatically.

---

## 6. Upload HR Documents

Upload your HR policy documents (PDF, DOCX, XLSX, PPTX) to the configured SharePoint drive,
inside the folder referenced by `SHAREPOINT_FOLDER_PATH` (e.g. `ByteHR`).

Trigger the first sync:
```bash
curl -X POST http://localhost:8080/api/sync
```

---

## Supported Document Formats

| Format | Extension |
|---|---|
| PDF | .pdf |
| Word | .docx |
| Excel | .xlsx |
| PowerPoint | .pptx |
