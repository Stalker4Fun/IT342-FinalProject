# EcoBite Automated Verification Suite (Increment 1: Auth & User Accounts)
$baseUrl = "http://localhost:8080"
$allPassed = $true

function Report-Result($testNum, $description, $passed, $details) {
    if ($passed) {
        Write-Host " [PASS] Check $testNum : $description" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] Check $testNum : $description - Details: $details" -ForegroundColor Red
        $global:allPassed = $false
    }
}

Write-Host "`n=== RUNNING SECTION 6 VERIFICATION CHECKS ===`n" -ForegroundColor Cyan

# 1. Register Donor (201, is_verified=true) and Recipient (is_verified=false)
$donorEmail = "donor_" + (Get-Random) + "@bakery.com"
$donorBody = @{
    name = "Metro Bakery"
    email = $donorEmail
    password = "Password123"
    role = "DONOR"
    contactNumber = "09171234567"
    address = "100 Mango Ave, Cebu City"
    latitude = 10.315
    longitude = 123.885
} | ConvertTo-Json

$donorReg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $donorBody
$recipEmail = "recip_" + (Get-Random) + "@shelter.org"
$recipBody = @{
    name = "Care Shelter"
    email = $recipEmail
    password = "Password123"
    role = "RECIPIENT"
    contactNumber = "+639181234567"
    address = "200 Colon St, Cebu City"
} | ConvertTo-Json
$recipReg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $recipBody

$check1 = ($donorReg.isVerified -eq $true) -and ($recipReg.isVerified -eq $false) -and ($donorReg.userId -gt 0)
Report-Result 1 "Register Donor (is_verified=true) and Recipient (is_verified=false)" $check1 "Donor=$($donorReg.isVerified), Recip=$($recipReg.isVerified)"

# 2. Duplicate email (case-insensitive) = 409; Invalid fields = 400 with fieldErrors; Role ADMIN = 400
$dupBody = @{
    name = "Another Bakery"
    email = $donorEmail.ToUpper()
    password = "Password123"
    role = "DONOR"
    contactNumber = "09170000000"
    address = "Somewhere"
} | ConvertTo-Json

$dup409 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $dupBody
} catch {
    $dup409 = ($_.Exception.Response.StatusCode.value__ -eq 409)
}

$adminEscalationBlocked = $false
try {
    $adminRegBody = @{
        name = "Fake Admin"
        email = "fake_" + (Get-Random) + "@admin.com"
        password = "Password123"
        role = "ADMIN"
        contactNumber = "+639111111111"
        address = "123 Street"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $adminRegBody
} catch {
    $adminEscalationBlocked = ($_.Exception.Response.StatusCode.value__ -eq 400)
}

$validation400 = $false
try {
    $invalidBody = @{
        name = "A"
        email = "notanemail"
        password = "short"
        role = "DONOR"
        contactNumber = "invalid"
        address = ""
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $invalidBody
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $errObj = (New-Object System.IO.StreamReader($stream)).ReadToEnd() | ConvertFrom-Json
    $validation400 = ($_.Exception.Response.StatusCode.value__ -eq 400) -and ($null -ne $errObj.fieldErrors.password)
}
$check2 = $dup409 -and $adminEscalationBlocked -and $validation400
Report-Result 2 "Duplicate email (409), Admin role rejected (400), Invalid fields (400 fieldErrors)" $check2 "Dup=$dup409, AdminEsc=$adminEscalationBlocked, Val=$validation400"

# 3. Valid login returns token; Wrong password and unknown email return identical 401
$validLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $donorEmail; password = "Password123" } | ConvertTo-Json)
$hasToken = $validLogin.token.Length -gt 20 -and ($validLogin.user.email -eq $donorEmail)

$wrongPassMsg = ""
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $donorEmail; password = "WrongPassword999" } | ConvertTo-Json)
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $wrongPassMsg = ((New-Object System.IO.StreamReader($stream)).ReadToEnd() | ConvertFrom-Json).message
}

$unknownEmailMsg = ""
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = "nonexistent_user_xyz@test.com"; password = "Password123" } | ConvertTo-Json)
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $unknownEmailMsg = ((New-Object System.IO.StreamReader($stream)).ReadToEnd() | ConvertFrom-Json).message
}
$check3 = $hasToken -and ($wrongPassMsg -eq "Invalid email or password") -and ($unknownEmailMsg -eq "Invalid email or password")
Report-Result 3 "Valid login returns token; Wrong password & unknown email return identical 401" $check3 "Token=$hasToken, WrongMsg=$wrongPassMsg, UnknownMsg=$unknownEmailMsg"

# 4. No token returns 401; Tampered token returns 401
$noToken401 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get
} catch {
    $noToken401 = ($_.Exception.Response.StatusCode.value__ -eq 401)
}

$tampered401 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers @{ Authorization = "Bearer invalid.tampered.token" }
} catch {
    $tampered401 = ($_.Exception.Response.StatusCode.value__ -eq 401)
}
$check4 = $noToken401 -and $tampered401
Report-Result 4 "No token returns 401; Tampered token returns 401" $check4 "NoToken=$noToken401, Tampered=$tampered401"

# 5. RBAC enforcement: Donor -> Admin (403), Donor -> Recipient (403), Recipient -> Donor (403), Admin -> Admin (200)
$donorTok = $validLogin.token
$recipTok = (Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $recipEmail; password = "Password123" } | ConvertTo-Json)).token
$adminTok = (Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = "admin@ecobite.org"; password = "Admin123!" } | ConvertTo-Json)).token

$donorOnAdmin403 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers @{ Authorization = "Bearer $donorTok" }
} catch {
    $donorOnAdmin403 = ($_.Exception.Response.StatusCode.value__ -eq 403)
}

$donorOnRecip403 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/recipient/dashboard" -Method Get -Headers @{ Authorization = "Bearer $donorTok" }
} catch {
    $donorOnRecip403 = ($_.Exception.Response.StatusCode.value__ -eq 403)
}

$recipOnDonor403 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/donor/dashboard" -Method Get -Headers @{ Authorization = "Bearer $recipTok" }
} catch {
    $recipOnDonor403 = ($_.Exception.Response.StatusCode.value__ -eq 403)
}

$adminOnAdmin200 = $false
try {
    $admDash = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers @{ Authorization = "Bearer $adminTok" }
    $adminOnAdmin200 = ($null -ne $admDash.totalUsers)
} catch {}

$check5 = $donorOnAdmin403 -and $donorOnRecip403 -and $recipOnDonor403 -and $adminOnAdmin200
Report-Result 5 "Role-Based Access Control (403 on forbidden roles, 200 on authorized role)" $check5 "D->A=$donorOnAdmin403, D->R=$donorOnRecip403, R->D=$recipOnDonor403, A->A=$adminOnAdmin200"

# 6. After logout, same token returns 401
$tempLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $donorEmail; password = "Password123" } | ConvertTo-Json)
$tempTok = $tempLogin.token
Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method Post -Headers @{ Authorization = "Bearer $tempTok" }

$revoked401 = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers @{ Authorization = "Bearer $tempTok" }
} catch {
    $revoked401 = ($_.Exception.Response.StatusCode.value__ -eq 401)
}
Report-Result 6 "Logout token revocation (re-using token returns 401)" $revoked401 "RevokedTokenReturns401=$revoked401"

# 7. Admin approval of recipient -> recipient /me shows is_verified=true
$recipUserId = $recipReg.userId
$verifyPatch = Invoke-RestMethod -Uri "$baseUrl/api/admin/recipients/$recipUserId/verify" -Method Patch -Headers @{ Authorization = "Bearer $adminTok" }
$recipMe = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers @{ Authorization = "Bearer $recipTok" }
$check7 = ($verifyPatch.isVerified -eq $true) -and ($recipMe.isVerified -eq $true)
Report-Result 7 "Admin recipient approval reflects is_verified=true on /api/auth/me" $check7 "Patch=$($verifyPatch.isVerified), Me=$($recipMe.isVerified)"

# 8. No password or hash appears in any response
$donorRegJson = $donorReg | ConvertTo-Json
$validLoginJson = $validLogin | ConvertTo-Json
$recipMeJson = $recipMe | ConvertTo-Json
$noHashExposed = -not ($donorRegJson -match "password_hash" -or $donorRegJson -match "\`$2a\`$" -or `
                      $validLoginJson -match "password_hash" -or $validLoginJson -match "\`$2a\`$" -or `
                      $recipMeJson -match "password_hash" -or $recipMeJson -match "\`$2a\`$")
Report-Result 8 "No password or BCrypt hash exposed in any API response" $noHashExposed "NoHashExposed=$noHashExposed"

Write-Host "`n=== SECTION 6 VERIFICATION SUMMARY: $(if ($allPassed) {'ALL 8 CHECKS PASSED!'} else {'SOME CHECKS FAILED'}) ===`n" -ForegroundColor $(if ($allPassed) {'Green'} else {'Red'})
