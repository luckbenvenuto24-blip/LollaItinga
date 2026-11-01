$paths = @(
  "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage\leveldb",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Local Storage\leveldb",
  "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Local Storage\leveldb"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    Write-Host "Checking $p..."
    Get-ChildItem -Path $p -Filter *.ldb -ErrorAction SilentlyContinue | ForEach-Object {
      $match = Select-String -Path $_.FullName -Pattern 'lolla_cardapio_data_v3' -SimpleMatch -Quiet
      if ($match) {
        Write-Host "FOUND lolla_cardapio_data_v3 in: $($_.FullName)"
      }
    }
    Get-ChildItem -Path $p -Filter *.log -ErrorAction SilentlyContinue | ForEach-Object {
      $match = Select-String -Path $_.FullName -Pattern 'lolla_cardapio_data_v3' -SimpleMatch -Quiet
      if ($match) {
        Write-Host "FOUND lolla_cardapio_data_v3 in: $($_.FullName)"
      }
    }
  }
}
