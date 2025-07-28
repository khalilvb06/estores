import { supabase } from './server-superbase.js';
import { protectAdminPages } from './auth-guard.js';

async function saveSettings() {
  try {
    const nameElement = document.getElementById('store-name');
    const headerColorElement = document.getElementById('main-header');
    const btnColorElement = document.getElementById('main-btn');
    const textColorElement = document.getElementById('main-text');
    const logoInput = document.getElementById('store-logo');

    // التحقق من وجود العناصر
    if (!nameElement || !headerColorElement || !btnColorElement || !textColorElement) {
      throw new Error('عناصر النموذج غير موجودة');
    }

    const name = nameElement.value;
    const headercolor = headerColorElement.value;
    const btncolor = btnColorElement.value;
    const textcolor = textColorElement.value;

    let logoUrl = null;
    
    if (logoInput && logoInput.files.length > 0) {
      const file = logoInput.files[0];
      
      // التحقق من نوع الملف
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WebP');
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 5MB');
      }

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`logos/${Date.now()}_${file.name}`, file, { upsert: true });

      if (error) {
        throw new Error('خطأ أثناء رفع الصورة: ' + error.message);
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('product-images')
        .getPublicUrl(`logos/${Date.now()}_${file.name}`);

      logoUrl = publicUrlData.publicUrl;
    }

    const updateData = {
      name: name.trim(),
      headercolor: headercolor || '#007bff',
      btncolor: btncolor || '#007bff',
      textcolor: textcolor || '#000000'
    };

    if (logoUrl) {
      updateData.logo = logoUrl;
    }

    const { error: updateError } = await supabase
      .from('store_settings')
      .update(updateData)
      .eq('id', 1);

    if (updateError) {
      throw new Error('حدث خطأ أثناء الحفظ: ' + updateError.message);
    }

    // إظهار رسالة النجاح
    showSuccessMessage();
    
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    showErrorMessage(error.message);
  }
}

function showSuccessMessage() {
  // محاولة إظهار مودل Bootstrap إذا كان متاحاً
  const successModal = document.getElementById('successModal');
  if (successModal && typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(successModal);
    modal.show();
  } else {
    // إظهار تنبيه بسيط إذا لم يكن Bootstrap متاحاً
    alert('تم حفظ الإعدادات بنجاح!');
  }
  
  // إخفاء أي تنبيهات سابقة
  const savedAlert = document.getElementById('saved-alert');
  if (savedAlert) {
    savedAlert.classList.add('d-none');
  }
}

function showErrorMessage(message) {
  // محاولة إظهار مودل الخطأ إذا كان متاحاً
  const errorModal = document.getElementById('errorModal');
  if (errorModal && typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(errorModal);
    const errorMessageElement = errorModal.querySelector('.error-message');
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
    }
    modal.show();
  } else {
    // إظهار تنبيه بسيط إذا لم يكن Bootstrap متاحاً
    alert('خطأ: ' + message);
  }
}

function previewLogo(input) {
  if (!input || !input.files || !input.files[0]) {
    return;
  }

  const file = input.files[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    alert('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WebP');
    input.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('حجم الملف كبير جداً. الحد الأقصى 5MB');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const previewElement = document.getElementById('logo-preview');
    if (previewElement) {
      previewElement.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

// دالة لتحديث لون الأزرار مباشرة عند تغيير اللون
function updateButtonColor() {
  const btnColorElement = document.getElementById('main-btn');
  if (!btnColorElement) return;

  const btnColor = btnColorElement.value || '#007bff';
  
  // إزالة الأنماط السابقة
  removeButtonStyles();
  
  // إضافة الأنماط الجديدة
  const style = document.createElement('style');
  style.setAttribute('data-button-color', 'true');
  style.textContent = `
    .btn-main {
      background: ${btnColor} !important;
      color: #fff !important;
      border-radius: 25px;
      font-weight: bold;
      transition: background 0.2s;
    }
    .btn-main:hover {
      background: ${btnColor} !important;
      color: #fff !important;
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
}

function removeButtonStyles() {
  const existingStyles = document.querySelectorAll('style[data-button-color]');
  existingStyles.forEach(style => style.remove());
}

// دالة لجلب البيانات السابقة وتعبئة الفورم
async function loadSettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      return;
    }

    if (!data) {
      console.log('لا توجد إعدادات محفوظة');
      return;
    }

    // تعبئة النموذج بالبيانات
    const nameElement = document.getElementById('store-name');
    const headerColorElement = document.getElementById('main-header');
    const btnColorElement = document.getElementById('main-btn');
    const textColorElement = document.getElementById('main-text');
    const logoPreviewElement = document.getElementById('logo-preview');

    if (nameElement) nameElement.value = data.name || '';
    if (headerColorElement) headerColorElement.value = data.headercolor || '';
    if (btnColorElement) btnColorElement.value = data.btncolor || '';
    if (textColorElement) textColorElement.value = data.textcolor || '';
    
    if (logoPreviewElement && data.logo) {
      logoPreviewElement.src = data.logo;
    }
    
    // تطبيق لون الأزرار
    if (data.btncolor) {
      removeButtonStyles();
      const style = document.createElement('style');
      style.setAttribute('data-button-color', 'true');
      style.textContent = `
        .btn-main {
          background: ${data.btncolor} !important;
          color: #fff !important;
          border-radius: 25px;
          font-weight: bold;
          transition: background 0.2s;
        }
        .btn-main:hover {
          background: ${data.btncolor} !important;
          color: #fff !important;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
  }
}

// تصدير الدوال للاستخدام العام
window.saveSettings = saveSettings;
window.previewLogo = previewLogo;
window.updateButtonColor = updateButtonColor;

// استدعاء الدالة عند تحميل الصفحة بعد التحقق من المصادقة
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const isProtected = await protectAdminPages();
    if (isProtected) {
      console.log('تم التحقق من المصادقة، بدء تحميل الإعدادات...');
      await loadSettings();
    } else {
      console.log('فشل في المصادقة، لن يتم تحميل الإعدادات');
    }
  } catch (error) {
    console.error('خطأ في تحميل الصفحة:', error);
  }
});
