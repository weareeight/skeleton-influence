# Testing Workflow

This document explains how to report issues and get live previews of fixes.

## Quick Start

1. **Find a bug** in the test store
2. **Create an issue** using the Bug Fix Request template
3. **Mention Claude** in a comment: `@claude please fix this`
4. **Wait for preview URL** to appear in the issue
5. **Test the fix** in the preview
6. **Approve or request changes**

## Detailed Steps

### 1. Create an Issue

Use the **Bug Fix Request** template when creating a new issue. Include:

- Clear description of the problem
- Which page/template is affected
- Device/viewport (mobile, tablet, desktop)
- Screenshots if possible

### 2. Trigger Claude

After creating the issue, add a comment mentioning Claude:

```
@claude please fix this
```

You can also provide additional context:

```
@claude please fix this - the issue only happens when the menu is open on iPhone Safari
```

### 3. Wait for the Preview

Claude will:
1. Analyze the issue
2. Plan a fix
3. Push the fix to a preview branch
4. A **Preview URL** will be posted to the issue automatically

The preview URL looks like:
```
https://test-store.myshopify.com/?preview_theme_id=123456789&key=xxxxx
```

This URL is shareable and will persist until the issue is closed.

### 4. Test the Fix

Open the preview URL and verify:
- The original bug is fixed
- No new issues were introduced
- The fix works on the affected device/viewport

### 5. Approve or Request Changes

**If the fix looks good:**
1. React with :+1: to the preview comment
2. Comment: `@claude create pr`

Claude will create a pull request from the fix branch.

**If changes are needed:**
Comment with your feedback and mention Claude:

```
@claude iterate - the fix works but the spacing is too tight on mobile, can you increase the padding?
```

Claude will push an updated fix and a new preview URL will appear.

## Labels

- `bug` - Initial bug report
- `preview-ready` - A preview URL has been generated

## Tips

- Be specific about what's wrong and where
- Include screenshots or screen recordings when possible
- Test on the same device/browser where you found the issue
- Check that related features still work after the fix

## Troubleshooting

**Preview URL not appearing?**
- Make sure you mentioned `@claude` in a comment
- Check if Claude responded with a plan - it may still be working
- The preview deployment can take 1-2 minutes

**Preview URL not working?**
- The test store may need you to be logged in
- Try opening in an incognito window
- Check the technical details in the preview comment for the theme ID

## For Admins

### Required Secrets

The following secrets must be configured in the repository:

- `SHOPIFY_STORE` - The test store URL (e.g., `test-store.myshopify.com`)
- `SHOPIFY_CLIENT_ID` - The app's Client ID from Dev Dashboard
- `SHOPIFY_CLIENT_SECRET` - The app's Client Secret from Dev Dashboard

### Getting the Credentials

1. Go to [Dev Dashboard](https://partners.shopify.com) and create an app
2. Configure Admin API scopes: enable `write_themes`
3. Install the app on your test store
4. Copy the **Client ID** and **Client Secret** from the app's credentials page

The workflow uses OAuth client credentials grant to get a fresh access token on each run (tokens expire after 24 hours, so this is handled automatically).
