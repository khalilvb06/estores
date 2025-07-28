// ads.js
import { supabase } from './server-superbase.js';
import { protectAdminPages } from './auth-guard.js';

// عناصر الصفحة
const pixelNameInput = document.getElementById('pixelName');
const pixelCodeInput = document.getElementById('pixelCode');
const pixelTableBody = document.getElementById('pixelTableBody');
const pixelForm = document.getElementById('pixelForm');
const addPixelModal = document.getElementById('addPixelModal');
const modal = new bootstrap.Modal(addPixelModal);

let editingId = null;

// فتح نافذة الإضافة/التعديل
function openAdModal(pixel = null) {
  if (pixel) {
    pixelNameInput.value = pixel.pixel_name;
    pixelCodeInput.value = pixel.pixel_code;
    editingId = pixel.id;
    document.getElementById('addPixelLabel').textContent = 'تعديل بيكسل';
  } else {
    pixelNameInput.value = '';
    pixelCodeInput.value = '';
    editingId = null;
    document.getElementById('addPixelLabel').textContent = 'إضافة بيكسل';
  }
  modal.show();
}

function closeAdModal() {
  modal.hide();
}

// حفظ أو تعديل البيكسل
async function savePixel(e) {
  if (e) e.preventDefault();
  const name = pixelNameInput.value.trim();
  const code = pixelCodeInput.value.trim();
  if (!name || !code) return alert('الرجاء ملء كل الحقول');

  try {
    if (editingId) {
      const { error, data } = await supabase.from('ad_pixels').update({ pixel_name: name, pixel_code: code }).eq('id', editingId);
      if (error) {
        console.error('خطأ في التعديل:', error);
        alert('فشل في التعديل: ' + error.message);
        return;
      }
      console.log('تم التعديل بنجاح:', data);
    } else {
      const { error, data } = await supabase.from('ad_pixels').insert([{ pixel_name: name, pixel_code: code }]);
      if (error) {
        console.error('خطأ في الإضافة:', error);
        alert('فشل في الإضافة: ' + error.message);
        return;
      }
      console.log('تمت الإضافة بنجاح:', data);
    }
  } catch (e) {
    console.error('استثناء أثناء الحفظ:', e);
    alert('حدث خطأ غير متوقع أثناء الحفظ');
    return;
  }

  closeAdModal();
  fetchPixels();
}

// جلب وعرض البيكسلات
async function fetchPixels() {
  const { data, error } = await supabase.from('ad_pixels').select('*');
  if (error) return console.error('خطأ في جلب البيانات:', error);

  pixelTableBody.innerHTML = '';
  data.forEach((pixel, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${pixel.pixel_name}</td>
      <td><code>${pixel.pixel_code}</code></td>
      <td>
        <button class='btn btn-sm btn-primary' onclick='window.editPixel(${JSON.stringify(pixel)})'>✏️ تعديل</button>
        <button class='btn btn-sm btn-danger' onclick='window.deletePixel(${pixel.id})'>🗑 حذف</button>
      </td>
    `;
    pixelTableBody.appendChild(row);
  });
}

window.openAdModal = openAdModal;
window.editPixel = (pixel) => {
  openAdModal(pixel);
};
window.deletePixel = async (id) => {
  if (confirm('هل أنت متأكد من الحذف؟')) {
    await supabase.from('ad_pixels').delete().eq('id', id);
    fetchPixels();
  }
};

// ربط الفورم مع الحفظ
pixelForm.onsubmit = savePixel;

// تهيئة المصادقة قبل تحميل البيانات
protectAdminPages().then(isProtected => {
  if (isProtected) {
    console.log('تم التحقق من المصادقة، بدء تحميل البيانات...');
    fetchPixels();
  } else {
    console.log('فشل في المصادقة، لن يتم تحميل البيانات');
  }
});
