# Tur Paket Import Fayli

Ushbu papka admin panel orqali tur paketlarini import qilish uchun namuna fayllarni o'z ichiga oladi.

## Qo'llanma

1. **Fayl formatlari**: Sistemada quyidagi formatdagi fayllarni yuklashingiz mumkin:
   - Excel: `.xlsx`, `.xls`
   - Word: `.docx`, `.doc`

2. **Fayl tuzilishi**: Fayl quyidagi ustunlarni o'z ichiga olishi kerak (ustun nomlari o'zbek yoki ingliz tilida bo'lishi mumkin):

| Ustun nomi (O'zbek) | Ustun nomi (English) | Tavsif | Misol |
|---------------------|----------------------|--------|-------|
| Tur nomi | title, name | Tur nomi (majburiy) | Samarkand Heritage Tour |
| Tur turi | type, turi | Tur turi: domestic, international, combo | domestic |
| Kategoriya | category | Kategoriya: historical, nature, beach, adventure, culture, business, family, luxury | historical |
| Tavsif | description, info | Tur haqida qisqa ma'lumot | Samarqandning tarixiy joylariga sayohat |
| Davomiyligi | duration, kun, days | Tur davomiyligi | 3 kun |
| Narx | price | Tur narxi | 250 |
| Valyuta | currency | Valyuta: USD yoki UZS | USD |
| Mamlakat | country | Mamlakat nomi | O'zbekiston |
| Mehmonxona | hotel | Mehmonxona nomi | Hotel Samarkand |
| Aviachipta | flight, uchish | Aviachipta kiradimi: ha/yo'q, yes/no, true/false, 1/0 | ha |
| Nimalar kiradi | included, xizmatlar | Vergul bilan ajratilgan xizmatlar ro'yxati | Hotel, Nonushta, Gid, Transport |
| Qiziqishlar | interests, qiziqish | Vergul bilan ajratilgan qiziqishlar | History, Culture, Architecture |

3. **Namuna fayllar**:
   - `tur_paket_template.xlsx` - Excel formatidagi namuna fayl (4 ta namuna tur bilan)

4. **Muhim eslatmalar**:
   - **Tur turi** faqat: `domestic`, `international`, yoki `combo` bo'lishi kerak
   - **Aviachipta** qiymati: `ha`/`yo'q`, `yes`/`no`, `true`/`false`, `1`/`0`
   - **Nimalar kiradi** va **Qiziqishlar** vergul bilan ajratilgan ro'yxat bo'lishi kerak
   - **Valyuta** faqat: `USD` yoki `UZS`
   - **Kategoriya**: historical, nature, beach, adventure, culture, business, family, luxury

## Import qilish tartibi

1. Admin panelga kirish (`/admin` yo'li)
2. "Turlar Boshqaruvi" bo'limiga o'tish
3. "File orqali qo'shish" tugmasini bosing
4. Faylni yuklang yoki faylni drag & drop qiling
5. "Import qilish" tugmasini bosing
6. Natijani ko'ring (qancha tur qo'shildi, xatoliklar bo'lsa ko'rsatiladi)

## Xatoliklar

Agar import jarayonida xatolik yuz bersa:
1. Fayl formati to'g'ri ekanligini tekshiring
2. Majburiy ustunlar (Tur nomi) to'ldirilganligini tekshiring
3. Qiymatlar to'g'ri formatda ekanligini tekshiring
4. Fayl hajmi 10 MB dan oshmasligi kerak

## Qo'shimcha ma'lumot

Import funksiyasi server tomonida `server/src/controllers/admin/adminPackagesController.js` faylida amalga oshirilgan. Fayl tahlili uchun `xlsx` va `mammoth` kutubxonalari ishlatiladi.