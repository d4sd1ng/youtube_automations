# Adobe Illustrator Script Automation Tool
# PowerShell Version with enhanced error handling

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Adobe Illustrator Script Automation Tool" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Read configuration from config.ini
try {
    $config = @{}
    Get-Content "config.ini" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $config[$matches[1]] = $matches[2]
        }
    }

    $illustratorPath = $config["IllustratorPath"]
    $scriptsDir = $config["ScriptsDirectory"]
    $rootDir = $config["RootDirectory"]

    Write-Host "Using Illustrator Path: $illustratorPath" -ForegroundColor Yellow
    Write-Host "Using Scripts Directory: $scriptsDir" -ForegroundColor Yellow
    Write-Host "Using Root Directory: $rootDir" -ForegroundColor Yellow
    Write-Host ""

    # Check if Illustrator executable exists
    if (-not (Test-Path $illustratorPath)) {
        Write-Host "ERROR: Illustrator executable not found at specified path!" -ForegroundColor Red
        Write-Host "Please check the config.ini file." -ForegroundColor Red
        Pause
        Exit 1
    }
} catch {
    Write-Host "ERROR: Could not read config.ini file!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pause
    Exit 1
}

# Define script paths
$scripts = @(
    @{ Name = "Gold_Glas.jsx"; Path = "$rootDir\Gold_Glas.jsx" },
    @{ Name = "Gold_Rahmen.jsx"; Path = "$rootDir\Gold_Rahmen.jsx" },
    @{ Name = "Hüllverzerrung.jsx"; Path = "$rootDir\Hüllverzerrung.jsx" },
    @{ Name = "Kapiteloverlay.jsx"; Path = "$rootDir\Kapiteloverlay.jsx" },
    @{ Name = "Warnschild.jsx"; Path = "$rootDir\Warnschild.jsx" },
    @{ Name = "create_template_illustrator.jsx"; Path = "$rootDir\create_template_illustrator.jsx" },
    @{ Name = "goldrahmen.jsx (root)"; Path = "$rootDir\goldrahmen.jsx" },
    @{ Name = "Logo Banner.jsx"; Path = "$scriptsDir\Logo Banner.jsx" },
    @{ Name = "banner.jsx"; Path = "$scriptsDir\banner.jsx" },
    @{ Name = "goldrahmen.jsx (scripts folder)"; Path = "$scriptsDir\goldrahmen.jsx" },
    @{ Name = "welle.jsx"; Path = "$scriptsDir\welle.jsx" }
)

Write-Host "Starting script execution..." -ForegroundColor Green
Write-Host ""

# Execute each script
for ($i = 0; $i -lt $scripts.Count; $i++) {
    $script = $scripts[$i]
    $progress = "$($i + 1)/$($scripts.Count)"

    Write-Host "[$progress] Running $($script.Name)..." -ForegroundColor Yellow

    try {
        # Check if script file exists
        if (-not (Test-Path $script.Path)) {
            Write-Host "  WARNING: Script file not found: $($script.Path)" -ForegroundColor Magenta
            continue
        }

        # Execute the script
        Start-Process -FilePath $illustratorPath -ArgumentList $script.Path -Wait

        # Small delay between scripts
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "  ERROR executing $($script.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All scripts executed successfully!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Pause