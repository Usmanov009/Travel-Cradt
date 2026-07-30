// Uzbekiston raqamlarini bitta formatga keltiradi: +998XXXXXXXXX
// Shu orqali bot va veb ilova bir xil raqamni bir xil deb tanaydi.
function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 9) digits = '998' + digits;
  return '+' + digits;
}

module.exports = { normalizePhone };
