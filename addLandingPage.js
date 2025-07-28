import { supabase } from './server-superbase.js';

// متغيرات عامة
let landingPageImages = [];
let colors = [];
let sizes = [];
let offers = [];

// متغيرات التعديل
let editLandingPageImages = [];
let editColors = [];
let editSizes = [];
let editOffers = [];

// دالة إضافة صورة لصفحة الهبوط
window.addLandingPageImage = function() {
  const fileInput = document.getElementById('landingPageImage');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('يرجى اختيار صورة أولاً');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageUrl = e.target.result;
    landingPageImages.push(imageUrl);
    updateLandingPageImagesList();
    fileInput.value = ''; // مسح حقل الملف
  };
  reader.readAsDataURL(file);
};

// دالة تحديث قائمة صور صفحة الهبوط
function updateLandingPageImagesList() {
  const container = document.getElementById('landingPageImagesList');
  container.innerHTML = '';
  
  landingPageImages.forEach((image, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'position-relative d-inline-block me-2 mb-2';
    imageDiv.innerHTML = `
      <img src="${image}" alt="صورة ${index + 1}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e7ff;">
      <button class="btn btn-sm btn-danger position-absolute" style="top: -5px; right: -5px;" onclick="removeLandingPageImage(${index})">×</button>
    `;
    container.appendChild(imageDiv);
  });
}

// دالة إزالة صورة من صفحة الهبوط
window.removeLandingPageImage = function(index) {
  landingPageImages.splice(index, 1);
  updateLandingPageImagesList();
};

// دالة إضافة لون
window.addColor = function() {
  const colorName = document.getElementById('colorName').value.trim();
  const colorHex = document.getElementById('colorPicker').value;
  
  if (!colorName) {
    alert('يرجى إدخال اسم اللون');
    return;
  }
  
  colors.push({ name: colorName, hex: colorHex });
  updateColorsList();
  
  // مسح الحقول
  document.getElementById('colorName').value = '';
  document.getElementById('colorPicker').value = '#000000';
};

// دالة تحديث قائمة الألوان
function updateColorsList() {
  const container = document.getElementById('colorsList');
  container.innerHTML = '';
  
  colors.forEach((color, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    colorDiv.innerHTML = `
      <span class="color-box" style="background: ${color.hex}; width: 20px; height: 20px; border-radius: 4px; margin-left: 8px;"></span>
      <span>${color.name}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeColor(${index})">×</button>
    `;
    container.appendChild(colorDiv);
  });
}

// دالة إزالة لون
window.removeColor = function(index) {
  colors.splice(index, 1);
  updateColorsList();
};

// دالة إضافة مقاس
window.addSize = function() {
  const sizeInput = document.getElementById('sizeInput');
  const size = sizeInput.value.trim();
  
  if (!size) {
    alert('يرجى إدخال المقاس');
    return;
  }
  
  if (sizes.includes(size)) {
    alert('هذا المقاس موجود بالفعل');
    return;
  }
  
  sizes.push(size);
  updateSizesList();
  sizeInput.value = '';
};

// دالة تحديث قائمة المقاسات
function updateSizesList() {
  const container = document.getElementById('sizesList');
  container.innerHTML = '';
  
  sizes.forEach((size, index) => {
    const sizeDiv = document.createElement('div');
    sizeDiv.className = 'bg-light p-2 rounded me-2 mb-2 d-flex align-items-center';
    sizeDiv.innerHTML = `
      <span>${size}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeSize(${index})">×</button>
    `;
    container.appendChild(sizeDiv);
  });
}

// دالة إزالة مقاس
window.removeSize = function(index) {
  sizes.splice(index, 1);
  updateSizesList();
};

// دالة إضافة عرض خاص
window.addOffer = function() {
  const qty = document.getElementById('offerQty').value;
  const price = document.getElementById('offerPrice').value;
  
  if (!qty || !price) {
    alert('يرجى إدخال عدد القطع والسعر');
    return;
  }
  
  offers.push({ qty: parseInt(qty), price: parseInt(price) });
  updateOffersList();
  
  // مسح الحقول
  document.getElementById('offerQty').value = '';
  document.getElementById('offerPrice').value = '';
};

// دالة تحديث قائمة العروض
function updateOffersList() {
  const container = document.getElementById('offersList');
  container.innerHTML = '';
  
  offers.forEach((offer, index) => {
    const offerDiv = document.createElement('div');
    offerDiv.className = 'bg-light p-2 rounded me-2 mb-2 d-flex align-items-center';
    offerDiv.innerHTML = `
      <span>${offer.qty} قطعة بـ ${offer.price} دج</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeOffer(${index})">×</button>
    `;
    container.appendChild(offerDiv);
  });
}

// دالة إزالة عرض
window.removeOffer = function(index) {
  offers.splice(index, 1);
  updateOffersList();
};

// دالة نشر صفحة الهبوط
window.publishLandingPage = async function() {
  const name = document.getElementById('landingPageName').value.trim();
  const imageWidth = document.getElementById('imageWidth').value;
  const price = document.getElementById('price').value;
  const pixel = document.getElementById('pixelSelect').value;
  const available = document.getElementById('landingPageAvailable').checked;
  
  if (!name) {
    alert('يرجى إدخال اسم صفحة الهبوط');
    return;
  }
  
  if (landingPageImages.length === 0) {
    alert('يرجى إضافة صورة واحدة على الأقل');
    return;
  }
  
  if (!imageWidth) {
    alert('يرجى اختيار عرض الصورة');
    return;
  }
  
  if (!price) {
    alert('يرجى إدخال السعر');
    return;
  }
  
  // تجهيز البيانات للإرسال
  const landingPageData = {
    name: name,
    image: JSON.stringify(landingPageImages),
    image_width: imageWidth,
    colors: JSON.stringify(colors),
    sizes: JSON.stringify(sizes),
    offers: JSON.stringify(offers),
    price: parseInt(price),
    pixel: pixel,
    available: available,
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .insert([landingPageData]);
    
    if (error) {
      console.error('خطأ في إضافة صفحة الهبوط:', error);
      alert('حدث خطأ أثناء إضافة صفحة الهبوط');
      return;
    }
    
    // إظهار مودال النجاح
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
    
    // مسح النموذج
    clearForm();
    
    // تحديث الجدول
    loadLandingPages();
    
  } catch (error) {
    console.error('خطأ في إضافة صفحة الهبوط:', error);
    alert('حدث خطأ أثناء إضافة صفحة الهبوط');
  }
};

// دالة مسح النموذج
function clearForm() {
  document.getElementById('landingPageName').value = '';
  document.getElementById('imageWidth').value = '';
  document.getElementById('price').value = '';
  document.getElementById('pixelSelect').value = '';
  document.getElementById('landingPageAvailable').checked = true;
  
  landingPageImages = [];
  colors = [];
  sizes = [];
  offers = [];
  
  updateLandingPageImagesList();
  updateColorsList();
  updateSizesList();
  updateOffersList();
}

// دالة تحميل صفحات الهبوط
async function loadLandingPages() {
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('خطأ في تحميل صفحات الهبوط:', error);
      return;
    }
    
    displayLandingPages(data || []);
    
  } catch (error) {
    console.error('خطأ في تحميل صفحات الهبوط:', error);
  }
}

// دالة عرض صفحات الهبوط في الجدول
function displayLandingPages(landingPages) {
  const tbody = document.querySelector('#landingPagesTable tbody');
  tbody.innerHTML = '';
  
  landingPages.forEach(landingPage => {
    let image = 'https://via.placeholder.com/100x60';
    try {
      if (landingPage.image && landingPage.image.startsWith('[')) {
        const images = JSON.parse(landingPage.image);
        if (images.length > 0) {
          image = images[0];
        }
      } else if (landingPage.image && !landingPage.image.startsWith('[')) {
        image = landingPage.image;
      }
    } catch(e) {
      if (landingPage.image && !landingPage.image.startsWith('[')) {
        image = landingPage.image;
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <img src="${image}" alt="صورة صفحة الهبوط" class="landing-page-image" onerror="this.src='https://via.placeholder.com/100x60'">
      </td>
      <td>${landingPage.name}</td>
      <td>${landingPage.image_width || 'غير محدد'}</td>
      <td>${landingPage.price} دج</td>
      <td>
        <span class="badge ${landingPage.available ? 'bg-success' : 'bg-danger'}">
          ${landingPage.available ? 'متاح' : 'غير متاح'}
        </span>
      </td>
      <td>
        <div class="d-flex gap-1 justify-content-center">
          <button class="btn btn-sm btn-primary" onclick="viewLandingPage(${landingPage.id})">
            <i class="fas fa-eye"></i> عرض
          </button>
          <button class="btn btn-sm btn-info" onclick="editLandingPage(${landingPage.id})">
            <i class="fas fa-edit"></i> تعديل
          </button>
          <button class="btn btn-sm btn-warning" onclick="toggleLandingPageAvailability(${landingPage.id}, ${landingPage.available})">
            <i class="fas fa-toggle-${landingPage.available ? 'on' : 'off'}"></i>
            ${landingPage.available ? 'إيقاف' : 'تفعيل'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteLandingPage(${landingPage.id})">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// دالة عرض صفحة الهبوط
window.viewLandingPage = function(id) {
  window.open(`landingPage.html?id=${id}`, '_blank');
};

// دالة تبديل حالة التوفر
window.toggleLandingPageAvailability = async function(id, currentStatus) {
  try {
    const { error } = await supabase
      .from('landing_pages')
      .update({ available: !currentStatus })
      .eq('id', id);
    
    if (error) {
      console.error('خطأ في تحديث حالة التوفر:', error);
      alert('حدث خطأ أثناء تحديث حالة التوفر');
      return;
    }
    
    // تحديث الجدول
    loadLandingPages();
    
  } catch (error) {
    console.error('خطأ في تحديث حالة التوفر:', error);
    alert('حدث خطأ أثناء تحديث حالة التوفر');
  }
};

// دالة حذف صفحة الهبوط
window.deleteLandingPage = async function(id) {
  if (!confirm('هل أنت متأكد من حذف صفحة الهبوط؟')) {
    return;
  }
  
  try {
    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('خطأ في حذف صفحة الهبوط:', error);
      alert('حدث خطأ أثناء حذف صفحة الهبوط');
      return;
    }
    
    // تحديث الجدول
    loadLandingPages();
    
  } catch (error) {
    console.error('خطأ في حذف صفحة الهبوط:', error);
    alert('حدث خطأ أثناء حذف صفحة الهبوط');
  }
};

// دالة تسجيل الخروج
window.logout = async function() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } else {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
  }
};

// دالة تعديل صفحة الهبوط
window.editLandingPage = async function(id) {
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('خطأ في تحميل بيانات صفحة الهبوط:', error);
      alert('حدث خطأ أثناء تحميل بيانات صفحة الهبوط');
      return;
    }
    
    // تعبئة النموذج بالبيانات
    document.getElementById('editLandingPageId').value = data.id;
    document.getElementById('editLandingPageName').value = data.name;
    document.getElementById('editImageWidth').value = data.image_width || '';
    document.getElementById('editPrice').value = data.price;
    document.getElementById('editPixelSelect').value = data.pixel || '';
    document.getElementById('editLandingPageAvailable').checked = data.available;
    
    // تحميل الصور
    editLandingPageImages = [];
    if (data.image) {
      try {
        if (data.image.startsWith('[')) {
          editLandingPageImages = JSON.parse(data.image);
        } else {
          editLandingPageImages = [data.image];
        }
      } catch(e) {
        editLandingPageImages = [data.image];
      }
    }
    updateEditLandingPageImagesList();
    
    // تحميل الألوان
    editColors = [];
    if (data.colors) {
      try {
        editColors = JSON.parse(data.colors);
      } catch(e) {
        editColors = [];
      }
    }
    updateEditColorsList();
    
    // تحميل المقاسات
    editSizes = [];
    if (data.sizes) {
      try {
        editSizes = JSON.parse(data.sizes);
      } catch(e) {
        editSizes = [];
      }
    }
    updateEditSizesList();
    
    // تحميل العروض
    editOffers = [];
    if (data.offers) {
      try {
        editOffers = JSON.parse(data.offers);
      } catch(e) {
        editOffers = [];
      }
    }
    updateEditOffersList();
    
    // فتح المودال
    const modal = new bootstrap.Modal(document.getElementById('editLandingPageModal'));
    modal.show();
    
  } catch (error) {
    console.error('خطأ في تحميل بيانات صفحة الهبوط:', error);
    alert('حدث خطأ أثناء تحميل بيانات صفحة الهبوط');
  }
};

// دوال إدارة صور التعديل
window.addEditLandingPageImage = function() {
  const fileInput = document.getElementById('editLandingPageImage');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('يرجى اختيار صورة أولاً');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageUrl = e.target.result;
    editLandingPageImages.push(imageUrl);
    updateEditLandingPageImagesList();
    fileInput.value = '';
  };
  reader.readAsDataURL(file);
};

function updateEditLandingPageImagesList() {
  const container = document.getElementById('editLandingPageImagesList');
  container.innerHTML = '';
  
  editLandingPageImages.forEach((image, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'position-relative d-inline-block me-2 mb-2';
    imageDiv.innerHTML = `
      <img src="${image}" alt="صورة ${index + 1}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e7ff;">
      <button class="btn btn-sm btn-danger position-absolute" style="top: -5px; right: -5px;" onclick="removeEditLandingPageImage(${index})">×</button>
    `;
    container.appendChild(imageDiv);
  });
}

window.removeEditLandingPageImage = function(index) {
  editLandingPageImages.splice(index, 1);
  updateEditLandingPageImagesList();
};

// دوال إدارة ألوان التعديل
window.addEditColor = function() {
  const colorName = document.getElementById('editColorName').value.trim();
  const colorHex = document.getElementById('editColorPicker').value;
  
  if (!colorName) {
    alert('يرجى إدخال اسم اللون');
    return;
  }
  
  editColors.push({ name: colorName, hex: colorHex });
  updateEditColorsList();
  
  document.getElementById('editColorName').value = '';
  document.getElementById('editColorPicker').value = '#000000';
};

function updateEditColorsList() {
  const container = document.getElementById('editColorsList');
  container.innerHTML = '';
  
  editColors.forEach((color, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    colorDiv.innerHTML = `
      <span class="color-box" style="background: ${color.hex}; width: 20px; height: 20px; border-radius: 4px; margin-left: 8px;"></span>
      <span>${color.name}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditColor(${index})">×</button>
    `;
    container.appendChild(colorDiv);
  });
}

window.removeEditColor = function(index) {
  editColors.splice(index, 1);
  updateEditColorsList();
};

// دوال إدارة مقاسات التعديل
window.addEditSize = function() {
  const sizeInput = document.getElementById('editSizeInput');
  const size = sizeInput.value.trim();
  
  if (!size) {
    alert('يرجى إدخال المقاس');
    return;
  }
  
  editSizes.push(size);
  updateEditSizesList();
  sizeInput.value = '';
};

function updateEditSizesList() {
  const container = document.getElementById('editSizesList');
  container.innerHTML = '';
  
  editSizes.forEach((size, index) => {
    const sizeDiv = document.createElement('div');
    sizeDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    sizeDiv.innerHTML = `
      <span>${size}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditSize(${index})">×</button>
    `;
    container.appendChild(sizeDiv);
  });
}

window.removeEditSize = function(index) {
  editSizes.splice(index, 1);
  updateEditSizesList();
};

// دوال إدارة عروض التعديل
window.addEditOffer = function() {
  const qty = document.getElementById('editOfferQty').value;
  const price = document.getElementById('editOfferPrice').value;
  
  if (!qty || !price) {
    alert('يرجى إدخال عدد القطع والسعر');
    return;
  }
  
  editOffers.push({ qty: parseInt(qty), price: parseInt(price) });
  updateEditOffersList();
  
  document.getElementById('editOfferQty').value = '';
  document.getElementById('editOfferPrice').value = '';
};

function updateEditOffersList() {
  const container = document.getElementById('editOffersList');
  container.innerHTML = '';
  
  editOffers.forEach((offer, index) => {
    const offerDiv = document.createElement('div');
    offerDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    offerDiv.innerHTML = `
      <span>${offer.qty} قطعة - ${offer.price} دج</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditOffer(${index})">×</button>
    `;
    container.appendChild(offerDiv);
  });
}

window.removeEditOffer = function(index) {
  editOffers.splice(index, 1);
  updateEditOffersList();
};

// دالة تحديث صفحة الهبوط
window.updateLandingPage = async function() {
  const id = document.getElementById('editLandingPageId').value;
  const name = document.getElementById('editLandingPageName').value.trim();
  const imageWidth = document.getElementById('editImageWidth').value;
  const price = document.getElementById('editPrice').value;
  const pixel = document.getElementById('editPixelSelect').value;
  const available = document.getElementById('editLandingPageAvailable').checked;
  
  if (!name || !price) {
    alert('يرجى إدخال اسم صفحة الهبوط والسعر');
    return;
  }
  
  const landingPageData = {
    name: name,
    image: JSON.stringify(editLandingPageImages),
    image_width: imageWidth,
    colors: JSON.stringify(editColors),
    sizes: JSON.stringify(editSizes),
    offers: JSON.stringify(editOffers),
    price: parseInt(price),
    pixel: pixel,
    available: available,
    updated_at: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase
      .from('landing_pages')
      .update(landingPageData)
      .eq('id', id);
    
    if (error) {
      console.error('خطأ في تحديث صفحة الهبوط:', error);
      alert('حدث خطأ أثناء تحديث صفحة الهبوط');
      return;
    }
    
    // إغلاق المودال وتحديث الجدول
    const modal = bootstrap.Modal.getInstance(document.getElementById('editLandingPageModal'));
    modal.hide();
    
    // عرض رسالة نجاح
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    document.querySelector('#successModal .modal-title').textContent = '✅ تم تحديث صفحة الهبوط';
    document.querySelector('#successModal .modal-body p').textContent = 'تم تحديث صفحة الهبوط بنجاح!';
    successModal.show();
    
    // تحديث الجدول
    loadLandingPages();
    
  } catch (error) {
    console.error('خطأ في تحديث صفحة الهبوط:', error);
    alert('حدث خطأ أثناء تحديث صفحة الهبوط');
  }
};

// دالة جلب قائمة البيكسلات من جدول ad_pixels
async function fetchPixels() {
  const select = document.getElementById('pixelSelect');
  const editSelect = document.getElementById('editPixelSelect');
  
  if (!select || !editSelect) return;
  
  // إعادة تعيين قوائم البيكسلات
  select.innerHTML = '<option value="">اختر البيكسل</option>';
  editSelect.innerHTML = '<option value="">اختر البيكسل</option>';
  
  try {
    const { data, error } = await supabase.from('ad_pixels').select('*');
    if (!error && data) {
      data.forEach(pixel => {
        select.innerHTML += `<option value="${pixel.id}">${pixel.pixel_name}</option>`;
        editSelect.innerHTML += `<option value="${pixel.id}">${pixel.pixel_name}</option>`;
      });
    }
  } catch (error) {
    console.error('خطأ في جلب البيكسلات:', error);
  }
}

// إعداد الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // إظهار/إخفاء نموذج الإضافة
  const showFormBtn = document.getElementById('showAddLandingPageFormBtn');
  const formWrapper = document.getElementById('addLandingPageFormWrapper');
  
  showFormBtn.addEventListener('click', function() {
    if (formWrapper.style.display === 'none') {
      formWrapper.style.display = 'block';
      showFormBtn.textContent = '❌ إلغاء الإضافة';
    } else {
      formWrapper.style.display = 'none';
      showFormBtn.textContent = '➕ إضافة صفحة هبوط';
      clearForm();
    }
  });
  
  // تحميل البيكسلات وصفحات الهبوط
  fetchPixels();
  loadLandingPages();
}); 