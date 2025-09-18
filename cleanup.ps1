# Cleanup script for CareerGenie project
Write-Host "Starting cleanup of CareerGenie project..."

$backendPath = "C:\Users\surya\Projects\CareerGenie\Backend"
$frontendPath = "C:\Users\surya\Projects\CareerGenie\Frontend"

# Backend cleanup
Write-Host "Cleaning Backend directory..."
$backendFilesToRemove = @(
    "test-*.js",
    "test-*.ps1", 
    "test-*.html",
    "simple-test.js",
    "sample-resume.txt",
    "FINAL_TEST_RESULTS.md",
    "TESTING_REPORT.md",
    "test-results.json"
)

foreach ($pattern in $backendFilesToRemove) {
    Get-ChildItem -Path $backendPath -Name $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = Join-Path $backendPath $_
        Remove-Item $fullPath -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $fullPath"
    }
}

# Backend controller cleanup
$debugControllers = @(
    "src\controllers\resumeController-debug.js",
    "src\controllers\resumeController_new.js"
)

foreach ($file in $debugControllers) {
    $fullPath = Join-Path $backendPath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "Removed: $fullPath"
    }
}

# Frontend cleanup
Write-Host "Cleaning Frontend directory..."
$frontendFilesToRemove = @(
    "preview.html",
    "test-preview.html", 
    "setup.bat",
    "SETUP_COMPLETE.md",
    "TESTING_GUIDE.md",
    "AUTHENTICATION_EXAMPLES.md",
    "FIREBASE_SETUP.md",
    "validation.js"
)

foreach ($file in $frontendFilesToRemove) {
    $fullPath = Join-Path $frontendPath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "Removed: $fullPath"
    }
}

# Remove .github directory if it exists
$githubDir = Join-Path $frontendPath ".github"
if (Test-Path $githubDir) {
    Remove-Item $githubDir -Recurse -Force
    Write-Host "Removed: $githubDir"
}

Write-Host "Cleanup completed!"
