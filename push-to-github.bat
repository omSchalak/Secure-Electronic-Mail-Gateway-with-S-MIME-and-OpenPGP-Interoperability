@echo off
title Upload to GitHub - Secure Mail Gateway
echo ============================================================
echo Pushing Secure Mail Gateway to GitHub Repository:
echo https://github.com/omSchalak/Secure-Electronic-Mail-Gateway-with-S-MIME-and-OpenPGP-Interoperability.git
echo ============================================================
echo.

if not exist .git (
    echo Initializing local git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/omSchalak/Secure-Electronic-Mail-Gateway-with-S-MIME-and-OpenPGP-Interoperability.git
) else (
    git remote set-url origin https://github.com/omSchalak/Secure-Electronic-Mail-Gateway-with-S-MIME-and-OpenPGP-Interoperability.git
)

echo Staging files...
git add .
git commit -m "Fix Vercel deployment HTTP 404 errors, API routing, and cryptographic workflows"
git push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo [SUCCESS] All files and folders uploaded successfully to GitHub!
    echo Vercel will now automatically trigger a new deployment.
    echo Refresh your website in 1-2 minutes:
    echo https://secure-electronic-mail-gateway-with.vercel.app/
    echo ============================================================
) else (
    echo ============================================================
    echo [NOTE] If you were prompted for credentials, make sure to
    echo sign in or use a GitHub Personal Access Token.
    echo ============================================================
)

pause
