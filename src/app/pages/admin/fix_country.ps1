$file = 'C:\Users\user\Desktop\Travel-Cradt-main\src\app\pages\admin\Packages.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Replace label
$content = $content -replace 'Mamlakat</label>', 'Mamlakat *</label>'

# Replace input with select
$old = '                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.country}
                      onChange={e => setForm({...form, country: e.target.value})}
                      placeholder="Fransiya"
                    />'
$new = '                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.country}
                      onChange={e => setForm({...form, country: e.target.value})}
                    >
                      <option value="''">Mamlakat tanlang...</option>
                      <option value="USA">🇺🇸 AQSH (USA)</option>
                      <option value="UAE">🇦🇪 BAA (Dubai)</option>
                      <option value="UK">🇬🇧 Buyuk Britaniya</option>
                      <option value="Egypt">🇪🇬 Misr</option>
                      <option value="Indonesia">🇮🇩 Indoneziya (Bali)</option>
                      <option value="Spain">🇪🇸 Ispaniya</option>
                      <option value="Italy">🇮🇹 Italiya</option>
                      <option value="Maldives">🇲🇻 Maldiv orollari</option>
                      <option value="Malaysia">🇲🇾 Malayziya</option>
                      <option value="Germany">🇩🇪 Germaniya</option>
                      <option value="Thailand">🇹🇭 Tailand</option>
                      <option value="Turkey">🇹🇷 Turkiya</option>
                      <option value="France">🇫🇷 Fransiya</option>
                      <option value="South Korea">🇰🇷 Janubiy Koreya</option>
                      <option value="Japan">🇯🇵 Yaponiya</option>
                      <option value="Greece">🇬🇷 Gretsiya</option>
                      <option value="Switzerland">🇨🇭 Shveytsariya</option>
                      <option value="China">🇨🇳 Xitoy</option>
                      <option value="India">🇮🇳 Hindiston</option>
                      <option value="Saudi Arabia">🇸🇦 Saudiya Arabistoni</option>
                      <option value="Qatar">🇶🇦 Qatar</option>
                      <option value="Kazakhstan">🇰🇿 Qozoq''iston</option>
                      <option value="Kyrgyzstan">🇰🇬 Qirg''iziston</option>
                      <option value="Tajikistan">🇹🇯 Tojikiston</option>
                      <option value="Azerbaijan">🇦🇿 Ozarbayjon</option>
                    </select>'

$content = $content -replace [regex]::Escape($old), $new

Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
Write-Host 'Done'
