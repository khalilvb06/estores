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

// متغيرات الأداء
let categoriesCache = null;
let pixelsCache = null;
let landingPagesCache = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// دالة debounce لتحسين الأداء
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// دالة تحسين حجم الصورة
function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// دالة إضافة صورة لصفحة الهبوط
window.addLandingPageImage = async function() {
  const fileInput = document.getElementById('landingPageImage');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('يرجى اختيار صورة أولاً');
    return;
  }
  
  // إظهار مؤشر التحميل
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'text-center p-2';
  loadingIndicator.innerHTML = '<small>جاري معالجة الصورة...</small>';
  document.getElementById('landingPageImagesList').appendChild(loadingIndicator);
  
  try {
    // ضغط الصورة
    const compressedImage = await compressImage(file);
    landingPageImages.push(compressedImage);
    updateLandingPageImagesList();
    fileInput.value = '';
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    alert('حدث خطأ في معالجة الصورة');
  } finally {
    // إزالة مؤشر التحميل
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  }
};

// دالة تحديث قائمة صور صفحة الهبوط (محسنة)
function updateLandingPageImagesList() {
  const container = document.getElementById('landingPageImagesList');
  if (!container) return;
  
  // استخدام DocumentFragment لتحسين الأداء
  const fragment = document.createDocumentFragment();
  
  landingPageImages.forEach((image, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'position-relative d-inline-block me-2 mb-2';
    imageDiv.innerHTML = `
      <img src="${image}" alt="صورة ${index + 1}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e7ff;" loading="lazy">
      <button class="btn btn-sm btn-danger position-absolute" style="top: -5px; right: -5px;" onclick="removeLandingPageImage(${index})">×</button>
    `;
    fragment.appendChild(imageDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
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

// دالة تحديث قائمة الألوان (محسنة)
function updateColorsList() {
  const container = document.getElementById('colorsList');
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  colors.forEach((color, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    colorDiv.innerHTML = `
      <span class="color-box" style="background: ${color.hex}; width: 20px; height: 20px; border-radius: 4px; margin-left: 8px;"></span>
      <span>${color.name}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeColor(${index})">×</button>
    `;
    fragment.appendChild(colorDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
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

// دالة تحديث قائمة المقاسات (محسنة)
function updateSizesList() {
  const container = document.getElementById('sizesList');
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  sizes.forEach((size, index) => {
    const sizeDiv = document.createElement('div');
    sizeDiv.className = 'bg-light p-2 rounded me-2 mb-2 d-flex align-items-center';
    sizeDiv.innerHTML = `
      <span>${size}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeSize(${index})">×</button>
    `;
    fragment.appendChild(sizeDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
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

// دالة تحديث قائمة العروض (محسنة)
function updateOffersList() {
  const container = document.getElementById('offersList');
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  offers.forEach((offer, index) => {
    const offerDiv = document.createElement('div');
    offerDiv.className = 'bg-light p-2 rounded me-2 mb-2 d-flex align-items-center';
    offerDiv.innerHTML = `
      <span>${offer.qty} قطعة بـ ${offer.price} دج</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeOffer(${index})">×</button>
    `;
    fragment.appendChild(offerDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
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
  const categoryId = document.getElementById('categorySelect').value;
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
  
  // إظهار مؤشر التحميل
  const submitBtn = document.querySelector('button[onclick="publishLandingPage()"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
  submitBtn.disabled = true;
  
  // تجهيز البيانات للإرسال
  const landingPageData = {
    name: name,
    image: JSON.stringify(landingPageImages),
    image_width: imageWidth,
    colors: JSON.stringify(colors),
    sizes: JSON.stringify(sizes),
    offers: JSON.stringify(offers),
    price: parseInt(price),
    category_id: categoryId || null,
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
    await loadLandingPages();
    
  } catch (error) {
    console.error('خطأ في إضافة صفحة الهبوط:', error);
    alert('حدث خطأ أثناء إضافة صفحة الهبوط');
  } finally {
    // إعادة تعيين الزر
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// دالة مسح النموذج
function clearForm() {
  document.getElementById('landingPageName').value = '';
  document.getElementById('imageWidth').value = '';
  document.getElementById('price').value = '';
  document.getElementById('categorySelect').value = '';
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

// دالة تحميل صفحات الهبوط (محسنة مع caching)
async function loadLandingPages() {
  const now = Date.now();
  
  // التحقق من الكاش
  if (landingPagesCache && (now - lastLoadTime) < CACHE_DURATION) {
    displayLandingPages(landingPagesCache);
    return;
  }
  
  // إظهار مؤشر التحميل
  const tableContainer = document.getElementById('landingPagesTable');
  if (tableContainer) {
    const loadingRow = document.createElement('tr');
    loadingRow.id = 'loading-row';
    loadingRow.innerHTML = '<td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td>';
    tableContainer.querySelector('tbody').appendChild(loadingRow);
  }
  
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('خطأ في تحميل صفحات الهبوط:', error);
      return;
    }
    
    // تحديث الكاش
    landingPagesCache = data || [];
    lastLoadTime = now;
    
    displayLandingPages(landingPagesCache);
    
  } catch (error) {
    console.error('خطأ في تحميل صفحات الهبوط:', error);
  } finally {
    // إزالة مؤشر التحميل
    const loadingRow = document.getElementById('loading-row');
    if (loadingRow) {
      loadingRow.remove();
    }
  }
}

// دالة عرض صفحات الهبوط في الجدول (محسنة)
function displayLandingPages(landingPages) {
  const tbody = document.querySelector('#landingPagesTable tbody');
  if (!tbody) return;
  
  // استخدام DocumentFragment لتحسين الأداء
  const fragment = document.createDocumentFragment();
  
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
        <img src="${image}" alt="صورة صفحة الهبوط" class="landing-page-image" onerror="this.src='https://via.placeholder.com/100x60'" loading="lazy">
      </td>
      <td>${landingPage.name}</td>
      <td>${landingPage.categories ? landingPage.categories.name : 'غير محدد'}</td>
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
    fragment.appendChild(row);
  });
  
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

// دالة عرض صفحة الهبوط
window.viewLandingPage = function(id) {
  window.open(`landingPage.html?id=${id}`, '_blank');
};

// دالة تبديل حالة التوفر (محسنة)
window.toggleLandingPageAvailability = async function(id, currentStatus) {
  // إظهار مؤشر التحميل
  const button = event.target.closest('button');
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  
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
    
    // تحديث الكاش بدلاً من إعادة التحميل
    if (landingPagesCache) {
      const pageIndex = landingPagesCache.findIndex(page => page.id === id);
      if (pageIndex !== -1) {
        landingPagesCache[pageIndex].available = !currentStatus;
        displayLandingPages(landingPagesCache);
      }
    }
    
  } catch (error) {
    console.error('خطأ في تحديث حالة التوفر:', error);
    alert('حدث خطأ أثناء تحديث حالة التوفر');
  } finally {
    // إعادة تعيين الزر
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
};

// دالة حذف صفحة الهبوط (محسنة)
window.deleteLandingPage = async function(id) {
  if (!confirm('هل أنت متأكد من حذف صفحة الهبوط؟')) {
    return;
  }
  
  // إظهار مؤشر التحميل
  const button = event.target.closest('button');
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  
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
    
    // تحديث الكاش بدلاً من إعادة التحميل
    if (landingPagesCache) {
      landingPagesCache = landingPagesCache.filter(page => page.id !== id);
      displayLandingPages(landingPagesCache);
    }
    
  } catch (error) {
    console.error('خطأ في حذف صفحة الهبوط:', error);
    alert('حدث خطأ أثناء حذف صفحة الهبوط');
  } finally {
    // إعادة تعيين الزر
    button.innerHTML = originalHTML;
    button.disabled = false;
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

// دالة تعديل صفحة الهبوط (محسنة)
window.editLandingPage = async function(id) {
  // إظهار مؤشر التحميل
  const button = event.target.closest('button');
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  
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
    document.getElementById('editCategorySelect').value = data.category_id || '';
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
  } finally {
    // إعادة تعيين الزر
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
};

// دوال إدارة صور التعديل (محسنة)
window.addEditLandingPageImage = async function() {
  const fileInput = document.getElementById('editLandingPageImage');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('يرجى اختيار صورة أولاً');
    return;
  }
  
  // إظهار مؤشر التحميل
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'text-center p-2';
  loadingIndicator.innerHTML = '<small>جاري معالجة الصورة...</small>';
  document.getElementById('editLandingPageImagesList').appendChild(loadingIndicator);
  
  try {
    // ضغط الصورة
    const compressedImage = await compressImage(file);
    editLandingPageImages.push(compressedImage);
    updateEditLandingPageImagesList();
    fileInput.value = '';
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    alert('حدث خطأ في معالجة الصورة');
  } finally {
    // إزالة مؤشر التحميل
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  }
};

function updateEditLandingPageImagesList() {
  const container = document.getElementById('editLandingPageImagesList');
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  editLandingPageImages.forEach((image, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'position-relative d-inline-block me-2 mb-2';
    imageDiv.innerHTML = `
      <img src="${image}" alt="صورة ${index + 1}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e7ff;" loading="lazy">
      <button class="btn btn-sm btn-danger position-absolute" style="top: -5px; right: -5px;" onclick="removeEditLandingPageImage(${index})">×</button>
    `;
    fragment.appendChild(imageDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
}

window.removeEditLandingPageImage = function(index) {
  editLandingPageImages.splice(index, 1);
  updateEditLandingPageImagesList();
};

// دوال إدارة ألوان التعديل (محسنة)
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
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  editColors.forEach((color, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    colorDiv.innerHTML = `
      <span class="color-box" style="background: ${color.hex}; width: 20px; height: 20px; border-radius: 4px; margin-left: 8px;"></span>
      <span>${color.name}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditColor(${index})">×</button>
    `;
    fragment.appendChild(colorDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
}

window.removeEditColor = function(index) {
  editColors.splice(index, 1);
  updateEditColorsList();
};

// دوال إدارة مقاسات التعديل (محسنة)
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
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  editSizes.forEach((size, index) => {
    const sizeDiv = document.createElement('div');
    sizeDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    sizeDiv.innerHTML = `
      <span>${size}</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditSize(${index})">×</button>
    `;
    fragment.appendChild(sizeDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
}

window.removeEditSize = function(index) {
  editSizes.splice(index, 1);
  updateEditSizesList();
};

// دوال إدارة عروض التعديل (محسنة)
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
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  
  editOffers.forEach((offer, index) => {
    const offerDiv = document.createElement('div');
    offerDiv.className = 'd-flex align-items-center bg-light p-2 rounded me-2 mb-2';
    offerDiv.innerHTML = `
      <span>${offer.qty} قطعة - ${offer.price} دج</span>
      <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeEditOffer(${index})">×</button>
    `;
    fragment.appendChild(offerDiv);
  });
  
  container.innerHTML = '';
  container.appendChild(fragment);
}

window.removeEditOffer = function(index) {
  editOffers.splice(index, 1);
  updateEditOffersList();
};

// دالة تحديث صفحة الهبوط (محسنة)
window.updateLandingPage = async function() {
  const id = document.getElementById('editLandingPageId').value;
  const name = document.getElementById('editLandingPageName').value.trim();
  const imageWidth = document.getElementById('editImageWidth').value;
  const price = document.getElementById('editPrice').value;
  const categoryId = document.getElementById('editCategorySelect').value;
  const pixel = document.getElementById('editPixelSelect').value;
  const available = document.getElementById('editLandingPageAvailable').checked;
  
  if (!name || !price) {
    alert('يرجى إدخال اسم صفحة الهبوط والسعر');
    return;
  }
  
  // إظهار مؤشر التحميل
  const submitBtn = document.querySelector('button[onclick="updateLandingPage()"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
  submitBtn.disabled = true;
  
  const landingPageData = {
    name: name,
    image: JSON.stringify(editLandingPageImages),
    image_width: imageWidth,
    colors: JSON.stringify(editColors),
    sizes: JSON.stringify(editSizes),
    offers: JSON.stringify(editOffers),
    price: parseInt(price),
    category_id: categoryId || null,
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
    
    // تحديث الكاش بدلاً من إعادة التحميل
    if (landingPagesCache) {
      const pageIndex = landingPagesCache.findIndex(page => page.id === parseInt(id));
      if (pageIndex !== -1) {
        landingPagesCache[pageIndex] = { ...landingPagesCache[pageIndex], ...landingPageData };
        displayLandingPages(landingPagesCache);
      }
    }
    
  } catch (error) {
    console.error('خطأ في تحديث صفحة الهبوط:', error);
    alert('حدث خطأ أثناء تحديث صفحة الهبوط');
  } finally {
    // إعادة تعيين الزر
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// دالة جلب قائمة التصنيفات من جدول categories (محسنة مع caching)
async function fetchCategories() {
  const select = document.getElementById('categorySelect');
  const editSelect = document.getElementById('editCategorySelect');
  
  if (!select || !editSelect) return;
  
  // التحقق من الكاش
  if (categoriesCache) {
    populateCategorySelects(categoriesCache);
    return;
  }
  
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) {
      categoriesCache = data;
      populateCategorySelects(data);
    }
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
  }
}

// دالة تعبئة قوائم التصنيفات
function populateCategorySelects(categories) {
  const select = document.getElementById('categorySelect');
  const editSelect = document.getElementById('editCategorySelect');
  
  if (!select || !editSelect) return;
  
  const options = '<option value="">اختر التصنيف</option>' + 
    categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
  
  select.innerHTML = options;
  editSelect.innerHTML = options;
}

// دالة جلب قائمة البيكسلات من جدول ad_pixels (محسنة مع caching)
async function fetchPixels() {
  const select = document.getElementById('pixelSelect');
  const editSelect = document.getElementById('editPixelSelect');
  
  if (!select || !editSelect) return;
  
  // التحقق من الكاش
  if (pixelsCache) {
    populatePixelSelects(pixelsCache);
    return;
  }
  
  try {
    const { data, error } = await supabase.from('ad_pixels').select('*');
    if (!error && data) {
      pixelsCache = data;
      populatePixelSelects(data);
    }
  } catch (error) {
    console.error('خطأ في جلب البيكسلات:', error);
  }
}

// دالة تعبئة قوائم البيكسلات
function populatePixelSelects(pixels) {
  const select = document.getElementById('pixelSelect');
  const editSelect = document.getElementById('editPixelSelect');
  
  if (!select || !editSelect) return;
  
  const options = '<option value="">اختر البيكسل</option>' + 
    pixels.map(pixel => `<option value="${pixel.id}">${pixel.pixel_name}</option>`).join('');
  
  select.innerHTML = options;
  editSelect.innerHTML = options;
}

// دالة تحديث الكاش عند إضافة/تعديل/حذف بيانات
function invalidateCache() {
  categoriesCache = null;
  pixelsCache = null;
  landingPagesCache = null;
  lastLoadTime = 0;
}

// إعداد الأحداث عند تحميل الصفحة (محسن)
document.addEventListener('DOMContentLoaded', function() {
  // إظهار/إخفاء نموذج الإضافة
  const showFormBtn = document.getElementById('showAddLandingPageFormBtn');
  const formWrapper = document.getElementById('addLandingPageFormWrapper');
  
  if (showFormBtn && formWrapper) {
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
  }
  
  // تحميل البيانات بشكل متوازي
  Promise.all([
    fetchCategories(),
    fetchPixels(),
    loadLandingPages()
  ]).catch(error => {
    console.error('خطأ في تحميل البيانات الأولية:', error);
  });
  
  // إضافة event listener للبحث (إذا كان موجود)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      // تنفيذ البحث هنا إذا كان مطلوباً
    }, 300));
  }
}); 
