// Global Variables
let currentLanguage = "ar"
let filteredProducts = []
let currentPage = 1
const productsPerPage = 12
let isLoading = false
let heroSlideIndex = 0
let testimonialIndex = 0
let heroSlideInterval
let testimonialInterval

// Admin Variables
let isAdminLoggedIn = false
let currentEditingProduct = null
let productToDelete = null

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "admin56",
}

// Language translations
const TRANSLATIONS = {
  ar: {
    // Categories
    bedroom: "غرف نوم",
    kitchen: "مطابخ",
    doors: "أبواب",
    tables: "طاولات",
    decorations: "ديكورات",
    // Materials
    wood: "خشب",
    aluminum: "ألوميتال",
    // Actions
    viewDetails: "عرض التفاصيل",
    inquiry: "استفسار",
    loadMore: "تحميل المزيد",
    // Messages
    noProducts: "لا توجد منتجات مطابقة للفلاتر المحددة",
    tryOtherFilters: "يرجى تجربة فلاتر أخرى للعثور على المنتجات المناسبة",
    loading: "جاري التحميل...",
    error: "حدث خطأ في تحميل المنتجات",
    retry: "إعادة المحاولة",
    messageSent: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.",
    sending: "جاري الإرسال...",
    // WhatsApp message
    whatsappInquiry: "أريد الاستفسار عن: ",
  },
  en: {
    // Categories
    bedroom: "Bedrooms",
    kitchen: "Kitchens",
    doors: "Doors",
    tables: "Tables",
    decorations: "Decorations",
    // Materials
    wood: "Wood",
    aluminum: "Aluminum",
    // Actions
    viewDetails: "View Details",
    inquiry: "Inquiry",
    loadMore: "Load More",
    // Messages
    noProducts: "No products match the selected filters",
    tryOtherFilters: "Please try other filters to find suitable products",
    loading: "Loading...",
    error: "Error loading products",
    retry: "Retry",
    messageSent: "Your message has been sent successfully! We will contact you soon.",
    sending: "Sending...",
    // WhatsApp message
    whatsappInquiry: "I want to inquire about: ",
  },
}

// DOM Elements
const loadingScreen = document.getElementById("loading-screen")
const productsContainer = document.getElementById("products-container")
const loadMoreBtn = document.getElementById("loadMoreBtn")
const topBtn = document.getElementById("topBtn")
const whatsappBtn = document.getElementById("whatsappBtn")
const langToggle = document.getElementById("langToggle")
const totalProductsEl = document.getElementById("totalProducts")

// Bootstrap reference
const bootstrap = window.bootstrap

// Declare API variables
let AOS



// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite()
})

// 🔹 وظيفة أساسية لتهيئة الموقع
async function initializeWebsite() {
  if (typeof window.AOS !== "undefined") {
    AOS = window.AOS
    AOS.init({ duration: 1000, once: true, offset: 100 })
  }

  setupEventListeners()
  initializeHeroSlider()
  initializeTestimonialsSlider()
  setupScrollEffects()
  setupNavbarEffects()
  animateStatsOnScroll()
  setupContactForm()

  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add("hidden")
  }, 1500)

  // ✅ تحميل المنتجات بعد التأكد من توفر API
  loadProductsInBackground()
}

// 🔄 تحميل المنتجات في الخلفية
async function loadProductsInBackground() {
  try {
    const apiAvailable = await waitForAPI()
    if (apiAvailable) {
      console.log("✅ API ready, loading products...")
      await loadProducts()
    } else {
      console.error("❌ API not available, showing placeholder products")
      showAPINotAvailableMessage()
    }
  } catch (error) {
    console.error("❌ Error loading products in background:", error)
    showAPINotAvailableMessage()
  }
}

// ⏳ التأكد من تحميل ProductAPI من script.js
async function waitForAPI() {
  let attempts = 0
  const maxAttempts = 10

  console.log("⏳ Waiting for script.js to load...")

  while (attempts < maxAttempts) {
    if (typeof window.ProductAPI !== "undefined") {
      console.log("✅ API script is loaded")
      return await safeTestAPIConnection()  // ✅ هنا بنعمل اختبار سريع
    }

    console.log(`⏳ Waiting for API... (${attempts + 1}/${maxAttempts})`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    attempts++
  }

  console.error("❌ API not available after waiting")
  return false
}

// ✅ اختبار الاتصال من غير ما يعمل Stack Overflow
let apiTesting = false
async function safeTestAPIConnection() {
  if (apiTesting) return false
  apiTesting = true
  try {
    console.log("🔄 Testing API connection...")
    const products = await ProductAPI.loadProducts()
    console.log("✅ API connection successful! Products loaded:", products.length)
    return true
  } catch (error) {
    console.error("❌ API connection failed:", error)
    return false
  } finally {
    apiTesting = false
  }
}
async function loadProducts() {
  try {
    console.log("🔄 Loading products from database via API...")
    showLoadingState()

    // Check if API is available
    if (typeof ProductAPI === "undefined") {
      throw new Error("ProductAPI غير متاح. تأكد من تحميل script.js أولاً")
    }

    // Test API connection first
    const connectionTest = await testAPIConnection()
    if (!connectionTest) {
      throw new Error("فشل في الاتصال بالخادم. تأكد من تشغيل Django server على http://127.0.0.1:8000")
    }

    // Load products from database via API
    const products = await ProductAPI.loadProducts()
    console.log("✅ Products loaded from database:", products.length)

    // Store products globally
    filteredProducts = [...products]

    // Initial filter
    filterProducts()
    hideLoadingState()

    console.log("✅ Products display completed")
  } catch (error) {
    console.error("❌ Error loading products from database:", error)
    hideLoadingState()
    showError(`خطأ في تحميل المنتجات: ${error.message}`)
  }
}

// Test API Connection
async function testAPIConnection() {
  try {
    if (typeof window.testAPIConnection !== "undefined") {
      return await window.testAPIConnection()
    } else {
      console.log("🔄 Testing API connection manually...")
      const products = await ProductAPI.loadProducts()
      console.log("✅ API connection successful! Products loaded:", products.length)
      return true
    }
  } catch (error) {
    console.error("❌ API connection failed:", error)
    return false
  }
}

// Show loading state
function showLoadingState() {
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="loading-spinner"></div>
        <p class="mt-3">${TRANSLATIONS[currentLanguage].loading}</p>
        <small class="text-muted">جاري تحميل المنتجات من قاعدة البيانات...</small>
      </div>
    `
  }
}

// Hide loading state
function hideLoadingState() {
  // Loading will be hidden when products are displayed
}

// Setup event listeners
function setupEventListeners() {
  // Language toggle
  if (langToggle) {
    langToggle.addEventListener("click", toggleLanguage)
  }

  // Filter change events
  document.querySelectorAll('input[name="material"], input[name="category"]').forEach((input) => {
    input.addEventListener("change", filterProducts)
  })

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreProducts)
  }

  // Scroll to top button
  if (topBtn) {
    topBtn.addEventListener("click", scrollToTop)
  }

  // WhatsApp button
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", openWhatsApp)
  }

  // Window scroll event
  window.addEventListener("scroll", handleScroll)

  // Window resize event
  window.addEventListener("resize", handleResize)

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const offsetTop = target.offsetTop - 100
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        })
      }
    })
  })
}

// Language toggle functionality
function toggleLanguage() {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar"

  // Update HTML attributes
  document.documentElement.lang = currentLanguage
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr"

  // Update language button
  if (langToggle) {
    const langText = langToggle.querySelector(".lang-text")
    if (langText) {
      langText.textContent = currentLanguage === "ar" ? "EN" : "AR"
    }
  }

  // Update all translatable elements
  updateTranslations()

  // Re-filter products to update display
  filterProducts()

  // Show notification
  showNotification(currentLanguage === "ar" ? "تم التبديل إلى العربية" : "Switched to English")
}

// Update translations for all elements
function updateTranslations() {
  document.querySelectorAll("[data-ar][data-en]").forEach((element) => {
    const text = currentLanguage === "ar" ? element.getAttribute("data-ar") : element.getAttribute("data-en")
    if (text) {
      element.textContent = text
    }
  })

  // Update placeholders
  document.querySelectorAll("[data-placeholder-ar][data-placeholder-en]").forEach((element) => {
    const placeholder =
      currentLanguage === "ar"
        ? element.getAttribute("data-placeholder-ar")
        : element.getAttribute("data-placeholder-en")
    if (placeholder) {
      element.placeholder = placeholder
    }
  })

  // Update select options
  document.querySelectorAll("option[data-ar][data-en]").forEach((option) => {
    const text = currentLanguage === "ar" ? option.getAttribute("data-ar") : option.getAttribute("data-en")
    if (text) {
      option.textContent = text
    }
  })
}

// Initialize hero slider
function initializeHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide")
  const indicators = document.querySelectorAll(".indicator")

  if (slides.length === 0) return

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index)
    })

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index)
    })
  }

  // Auto-play slider
  heroSlideInterval = setInterval(() => {
    heroSlideIndex = (heroSlideIndex + 1) % slides.length
    showSlide(heroSlideIndex)
  }, 5000)

  // Pause on hover
  const heroSection = document.querySelector(".hero-section")
  if (heroSection) {
    heroSection.addEventListener("mouseenter", () => {
      clearInterval(heroSlideInterval)
    })

    heroSection.addEventListener("mouseleave", () => {
      heroSlideInterval = setInterval(() => {
        heroSlideIndex = (heroSlideIndex + 1) % slides.length
        showSlide(heroSlideIndex)
      }, 5000)
    })
  }
}

// Change slide function (for navigation buttons)
function changeSlide(direction) {
  const slides = document.querySelectorAll(".hero-slide")
  if (slides.length === 0) return

  heroSlideIndex = (heroSlideIndex + direction + slides.length) % slides.length

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === heroSlideIndex)
  })

  document.querySelectorAll(".indicator").forEach((indicator, i) => {
    indicator.classList.toggle("active", i === heroSlideIndex)
  })
}

// Current slide function (for indicators)
function currentSlide(index) {
  heroSlideIndex = index - 1
  changeSlide(0)
}

// Initialize testimonials slider
function initializeTestimonialsSlider() {
  const testimonials = document.querySelectorAll(".testimonial-card")

  if (testimonials.length === 0) return

  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      testimonial.classList.toggle("active", i === index)
    })
  }

  // Auto-play testimonials
  testimonialInterval = setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length
    showTestimonial(testimonialIndex)
  }, 6000)
}

// Change testimonial function
function changeTestimonial(direction) {
  const testimonials = document.querySelectorAll(".testimonial-card")
  if (testimonials.length === 0) return

  testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length

  testimonials.forEach((testimonial, i) => {
    testimonial.classList.toggle("active", i === testimonialIndex)
  })
}

// Filter products based on selected criteria - FROM API ONLY
async function filterProducts() {
  const materialInput = document.querySelector('input[name="material"]:checked')
  const categoryInputs = document.querySelectorAll('input[name="category"]:checked')

  if (!materialInput) return

  const selectedMaterial = materialInput.value
  const selectedCategories = Array.from(categoryInputs).map((input) => input.value)

  try {
    console.log("🔄 Filtering products from database:", { selectedMaterial, selectedCategories })
    showLoadingState()

    if (selectedCategories.length === 0) {
      filteredProducts = []
    } else {
      // Load products from database via API with filters
      const allProducts = await ProductAPI.loadProducts()
      filteredProducts = allProducts.filter(
        (product) => product.material === selectedMaterial && selectedCategories.includes(product.category),
      )
    }

    console.log("✅ Filtered products from database:", filteredProducts.length)

    // Update total products count
    if (totalProductsEl) {
      totalProductsEl.textContent = filteredProducts.length
    }

    currentPage = 1
    displayProducts()
    updateLoadMoreButton()
    hideLoadingState()
  } catch (error) {
    console.error("❌ Error filtering products from database:", error)
    hideLoadingState()
    showError(`${TRANSLATIONS[currentLanguage].error}: ${error.message}`)
  }
}

// Display products in the grid
function displayProducts() {
  if (!productsContainer) return

  const startIndex = 0
  const endIndex = currentPage * productsPerPage
  const productsToShow = filteredProducts.slice(startIndex, endIndex)

  if (currentPage === 1) {
    productsContainer.innerHTML = ""
  }

  if (productsToShow.length === 0 && currentPage === 1) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <i class="fas fa-info-circle fa-2x mb-3"></i>
          <h5>${TRANSLATIONS[currentLanguage].noProducts}</h5>
          <p>${TRANSLATIONS[currentLanguage].tryOtherFilters}</p>
        </div>
      </div>
    `
    return
  }

  const newProducts = productsToShow.slice((currentPage - 1) * productsPerPage)

  newProducts.forEach((product, index) => {
    const productCard = createProductCard(product, index)
    productsContainer.appendChild(productCard)
  })

  // Animate new products
  setTimeout(() => {
    animateNewProducts()
  }, 100)
}

// Create product card element
function createProductCard(product, index) {
  const productDiv = document.createElement("div")
  productDiv.className = "product-card"
  productDiv.style.animationDelay = `${index * 0.1}s`

  const title = currentLanguage === "ar" ? product.title : product.title_en || product.title
  const materialText = TRANSLATIONS[currentLanguage][product.material] || product.material
  const categoryText = TRANSLATIONS[currentLanguage][product.category] || product.category

  // Get first image from images array or use placeholder
  const imageUrl =
    product.img
      // ? product.img
      // : `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(title)}`

  productDiv.innerHTML = `
    <div class="product-image-container">
      <img src="${imageUrl}" alt="${title}" class="product-image" loading="lazy">
      <div class="product-badge">${materialText}</div>
    </div>
    <div class="product-content">
      <h5 class="product-title">${title}</h5>
      <p class="product-category">${categoryText}</p>
      <div class="product-actions">
        <button class="product-btn outline" onclick="viewProductDetails('${product.id}')">
          <i class="fas fa-eye"></i>
          <span>${TRANSLATIONS[currentLanguage].viewDetails}</span>
        </button>
        <button class="product-btn primary" onclick="contactForProduct('${title.replace(/'/g, "\\'")}')">
          <i class="fas fa-phone"></i>
          <span>${TRANSLATIONS[currentLanguage].inquiry}</span>
        </button>
      </div>
    </div>
  `

  return productDiv
}

// Load more products
function loadMoreProducts() {
  if (isLoading || !loadMoreBtn) return

  isLoading = true
  loadMoreBtn.innerHTML = `<span class="loading"></span> ${TRANSLATIONS[currentLanguage].loading}`

  setTimeout(() => {
    currentPage++
    displayProducts()
    updateLoadMoreButton()
    isLoading = false
  }, 1000)
}

// Update load more button visibility
function updateLoadMoreButton() {
  if (!loadMoreBtn) return

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  if (currentPage >= totalPages || filteredProducts.length === 0) {
    loadMoreBtn.style.display = "none"
  } else {
    loadMoreBtn.style.display = "inline-block"
    loadMoreBtn.innerHTML = `<i class="fas fa-plus me-2"></i><span>${TRANSLATIONS[currentLanguage].loadMore}</span>`
  }
}

// Reset filters
function resetFilters() {
  // Reset material to wood
  const woodInput = document.querySelector('input[name="material"][value="wood"]')
  if (woodInput) {
    woodInput.checked = true
  }

  // Reset categories to bedroom only
  document.querySelectorAll('input[name="category"]').forEach((input) => {
    input.checked = input.value === "bedroom"
  })

  filterProducts()
}

// Handle scroll events
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  // Show/hide scroll to top button
  if (topBtn) {
    if (scrollTop > 300) {
      topBtn.style.display = "block"
    } else {
      topBtn.style.display = "none"
    }
  }

  // Navbar background
  const navbar = document.querySelector(".glass-nav")
  if (navbar) {
    if (scrollTop > 50) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  }
}

// Scroll to top function
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

// Open WhatsApp
function openWhatsApp() {
  const message =
    currentLanguage === "ar" ? "مرحباً، أريد الاستفسار عن خدماتكم" : "Hello, I want to inquire about your services"
  const whatsappUrl = `https://wa.me/966501234567?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

// Setup navbar effects
function setupNavbarEffects() {
  const navLinks = document.querySelectorAll(".nav-link")

  // Update active nav link based on scroll position
  window.addEventListener("scroll", () => {
    let current = ""
    const sections = document.querySelectorAll("section[id]")

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150
      const sectionHeight = section.clientHeight

      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active")
      }
    })
  })
}

// Animate stats when they come into view
function animateStatsOnScroll() {
  const statsSection = document.querySelector(".stats-section")
  const statNumbers = document.querySelectorAll(".stat-number[data-target]")

  if (!statsSection || statNumbers.length === 0) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statNumbers.forEach((stat) => {
          animateNumber(stat)
        })
        observer.unobserve(entry.target)
      }
    })
  })

  observer.observe(statsSection)
}

// Animate number counting
function animateNumber(element) {
  const target = Number.parseInt(element.getAttribute("data-target"))
  if (isNaN(target)) return

  const duration = 2000
  const step = target / (duration / 16)
  let current = 0

  const timer = setInterval(() => {
    current += step
    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    element.textContent = Math.floor(current) + (target >= 100 ? "+" : "")
  }, 16)
}

// Show success modal
function showSuccessModal() {
  const successModal = document.getElementById("successModal")
  if (successModal && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(successModal)
    modal.show()
  } else {
    showNotification(TRANSLATIONS[currentLanguage].messageSent)
  }
}

// Setup scroll effects
function setupScrollEffects() {
  // Parallax effect for hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const heroContent = document.querySelector(".hero-content")
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`
    }
  })
}

// Animate new products when they're added
function animateNewProducts() {
  const newProducts = document.querySelectorAll(".product-card:not(.animated)")
  newProducts.forEach((product, index) => {
    product.classList.add("animated")
    setTimeout(() => {
      product.style.opacity = "1"
      product.style.transform = "translateY(0)"
    }, index * 100)
  })
}

// Handle window resize
function handleResize() {
  // Recalculate any layout-dependent elements
  const floatingBtns = document.querySelectorAll(".floating-btn")

  if (window.innerWidth < 768) {
    // Mobile adjustments
    floatingBtns.forEach((btn) => {
      btn.style.width = "50px"
      btn.style.height = "50px"
    })
  } else {
    // Desktop adjustments
    floatingBtns.forEach((btn) => {
      btn.style.width = "60px"
      btn.style.height = "60px"
    })
  }
}

// Product interaction functions
function contactForProduct(productTitle) {
  const message = `${TRANSLATIONS[currentLanguage].whatsappInquiry}${productTitle}`
  const whatsappUrl = `https://wa.me/966501234567?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

// View product details function - FROM API ONLY
async function viewProductDetails(productId) {
  try {
    console.log("🔄 Loading product details from database for ID:", productId)

    // Get product from database via API
    const product = await ProductAPI.getProduct(productId)
    console.log("✅ Product details loaded from database:", product)

    if (!product) {
      showNotification(TRANSLATIONS[currentLanguage].error)
      return
    }

    // Generate enhanced data dynamically
    const enhancedProduct = getEnhancedProductData(product)

    // Show product modal
    showProductModal(enhancedProduct)
  } catch (error) {
    console.error("❌ Error viewing product details from database:", error)
    showNotification(`${TRANSLATIONS[currentLanguage].error}: ${error.message}`)
  }
}

// Generate enhanced product data
function getEnhancedProductData(product) {
  return {
    ...product,
    titleEn: product.title_en || product.title,
    descriptionAr: product.description_ar || getProductDescription(product, "ar"),
    descriptionEn: product.description_en || getProductDescription(product, "en"),
    gallery:
      product.images && product.images.length > 0
        ? product.images.map((img) => img.img)
        : [
            // `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(product.title)}`,
            // `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(product.title + " Detail1")}`,
            // `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(product.title + " Detail2")}`,
          ],
    features: getProductFeatures(product),
    specifications: []  // 🔥 كده مش هيحصل Error
  }
}


// Generate product description based on category and material
// // ✅ عرض تفاصيل المنتج (مع البيانات من الداتا بيز + fallback للوصف فقط)
function displayProductDetails(product) {
  // ✅ الصورة
  const productImage = document.getElementById("productImage");
  if (productImage) productImage.src = product.img ;

  // ✅ العنوان
  document.getElementById("productTitle").innerText = product.title;

  // ✅ الوصف (من الداتا بيز أو fallback لو مش موجود)
  document.getElementById("productDescription").innerText = getProductDescription(product, "ar");

  // ✅ المميزات (ثابتة)
  const featuresContainer = document.getElementById("productFeatures");
  featuresContainer.innerHTML = ""; 
  const features = getProductFeatures(product);
  features.forEach(feature => {
    featuresContainer.innerHTML += `<li>${feature}</li>`;
  });

  // ✅ باقي التفاصيل (من الداتا بيز فقط)
  const specsContainer = document.getElementById("productSpecs");
  specsContainer.innerHTML = ""; 

  if (product.color) {
    specsContainer.innerHTML += `<div><strong>اللون:</strong> ${product.color}</div>`;
  }
  if (product.dimensions) {
    specsContainer.innerHTML += `<div><strong>الأبعاد:</strong> ${product.dimensions}</div>`;
  }
  if (product.price) {
    specsContainer.innerHTML += `<div><strong>السعر:</strong> ${product.price} جنيه</div>`;
  }
  if (product.extra_details) {
    specsContainer.innerHTML += `<div><strong>تفاصيل إضافية:</strong> ${product.extra_details}</div>`;
  }
}

// ✅ الوصف – من DB أو fallback لو مش موجود
function getProductDescription(product, lang) {
  if (lang === "ar" && product.description_ar) {
    return product.description_ar;
  }
  if (lang === "en" && product.description_en) {
    return product.description_en;
  }

  // 👈 fallback ثابت للوصف لو مفيش DB
  const descriptions = {
    ar: {
      bedroom: {
        wood: `غرفة نوم فاخرة مصنوعة من خشب طبيعي عالي الجودة.`,
        aluminum: `غرفة نوم عصرية من الألومنيوم القوي.`,
      },
      kitchen: {
        wood: `مطبخ خشبي فاخر بتصميم عصري.`,
        aluminum: `مطبخ ألومنيوم أنيق ومتين.`,
      },
      doors: {
        wood: `باب خشبي فاخر مصنوع يدويًا.`,
        aluminum: `باب ألومنيوم حديث بعزل متقدم.`,
      },
      tables: {
        wood: `طاولة خشبية أنيقة تناسب جميع الديكورات.`,
        aluminum: `طاولة ألومنيوم عملية وخفيفة.`,
      },
      decorations: {
        wood: `ديكور خشبي فاخر يضفي لمسة دفء.`,
        aluminum: `ديكور ألومنيوم عصري.`,
      },
    },
    en: {
      bedroom: {
        wood: `Luxury wooden bedroom set made from premium quality wood.`,
        aluminum: `Modern aluminum bedroom set with a sleek design.`,
      },
      kitchen: {
        wood: `Luxury wooden kitchen with a modern touch.`,
        aluminum: `Modern aluminum kitchen with durable materials.`,
      },
      doors: {
        wood: `Handcrafted wooden door providing security and elegance.`,
        aluminum: `Modern aluminum door with advanced insulation.`,
      },
      tables: {
        wood: `Elegant wooden table for all décor styles.`,
        aluminum: `Lightweight aluminum table for daily use.`,
      },
      decorations: {
        wood: `Luxury wooden decoration adding warmth and style.`,
        aluminum: `Innovative aluminum decoration for modern spaces.`,
      },
    },
  };

  return descriptions[lang][product.category]?.[product.material] || descriptions[lang].bedroom.wood;
}

// ✅ المميزات – **ثابتة دايمًا**
function getProductFeatures(product) {
  const features = {
    ar: {
      bedroom: {
        wood: ["خشب طبيعي عالي الجودة", "تشطيب مقاوم للخدوش", "ضمان سنتين"],
        aluminum: ["ألومنيوم قوي", "وزن خفيف", "تصميم عصري"],
      },
      kitchen: {
        wood: ["خشب مقاوم للماء", "تشطيبات أنيقة", "مساحات تخزين عملية"],
        aluminum: ["ألومنيوم متين", "سهل التنظيف", "تصميم عملي"],
      },
      doors: {
        wood: ["خشب صلب", "عزل صوتي", "أقفال أمان"],
        aluminum: ["ألومنيوم مقوى", "طلاء مقاوم للخدش", "وزن خفيف"],
      },
      tables: {
        wood: ["خشب متين", "تصميم كلاسيكي", "مقاوم للخدوش"],
        aluminum: ["ألومنيوم خفيف", "مقاوم للصدأ", "مثالية للاستخدام اليومي"],
      },
      decorations: {
        wood: ["خشب منحوت", "تشطيبات فاخرة", "لمسة دافئة"],
        aluminum: ["ألومنيوم مبتكر", "تشطيب لامع", "خفيف الوزن"],
      },
    },
  };

  return features.ar[product.category]?.[product.material] || features.ar.bedroom.wood;
}


// Show product modal
function showProductModal(product) {
  const title = currentLanguage === "ar" ? product.title : product.titleEn
  const description = currentLanguage === "ar" ? product.descriptionAr : product.descriptionEn
  const materialText = TRANSLATIONS[currentLanguage][product.material]
  const categoryText = TRANSLATIONS[currentLanguage][product.category]

  // Create modal HTML
 const modalHTML = `
  <div class="modal fade" id="productModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <img src="${product.img}" 
                   alt="${title}" class="img-fluid rounded">
            </div>
            <div class="col-md-6">
              <div class="product-details">
                
                <!-- ✅ البادجات -->
                <div class="mb-3">
                  <span class="badge bg-primary me-2">${materialText}</span>
                  <span class="badge bg-secondary">${categoryText}</span>
                </div>
                
                <!-- ✅ الوصف من DB أو fallback -->
                <p class="lead">${getProductDescription(product, currentLanguage)}</p>
                
                <!-- ✅ المميزات (ثابتة) -->
                <div class="features mb-4">
                  <h6>${currentLanguage === "ar" ? "المميزات:" : "Features:"}</h6>
                  <ul>
                    ${getProductFeatures(product)
                      .map((feature) => `<li>${feature}</li>`)
                      .join("")}
                  </ul>
                </div>

                <!-- ✅ المواصفات (من DB فقط) -->
                <div class="specifications">
                  <h6>${currentLanguage === "ar" ? "المواصفات:" : "Specifications:"}</h6>
                  
                  ${product.color ? `
                    <div class="d-flex justify-content-between border-bottom py-2">
                      <strong>اللون:</strong> <span>${product.color}</span>
                    </div>` : ""}

                  ${product.dimensions ? `
                    <div class="d-flex justify-content-between border-bottom py-2">
                      <strong>الأبعاد:</strong> <span>${product.dimensions}</span>
                    </div>` : ""}

                  ${product.price ? `
                    <div class="d-flex justify-content-between border-bottom py-2">
                      <strong>السعر:</strong> <span>${product.price} جنيه</span>
                    </div>` : ""}

                  ${product.extra_details ? `
                    <div class="d-flex justify-content-between border-bottom py-2">
                      <strong>تفاصيل إضافية:</strong> <span>${product.extra_details}</span>
                    </div>` : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- ✅ أزرار التواصل -->
        <div class="modal-footer">
          <button type="button" class="btn btn-success" onclick="contactWhatsApp('${title}')">
            <i class="fab fa-whatsapp me-2"></i>
            ${currentLanguage === "ar" ? "تواصل واتساب" : "WhatsApp Contact"}
          </button>
          <button type="button" class="btn btn-primary" onclick="requestQuote('${title}')">
            <i class="fas fa-calculator me-2"></i>
            ${currentLanguage === "ar" ? "طلب عرض سعر" : "Request Quote"}
          </button>
        </div>
      </div>
    </div>
  </div>
`;


  // Remove existing modal if any
  const existingModal = document.getElementById("productModal")
  if (existingModal) {
    existingModal.remove()
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML)

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("productModal"))
  modal.show()

  // Store current product for actions
  window.currentViewingProduct = product
}

// Contact via WhatsApp from product modal
function contactWhatsApp(productTitle) {
  const message = `${TRANSLATIONS[currentLanguage].whatsappInquiry}${productTitle || ""}`
  const whatsappUrl = `https://wa.me/966501234567?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

// Request quote
function requestQuote(productTitle) {
  const message = `${currentLanguage === "ar" ? "أريد طلب عرض سعر لـ: " : "I want to request a quote for: "}${productTitle || ""}`
  const whatsappUrl = `https://wa.me/966501234567?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

// Setup contact form with API integration
function setupContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ✅ 1. جمع بيانات النموذج
    const formData = new FormData(this);
    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const service = formData.get("service");
    const message = formData.get("message");

    // ✅ 2. لو في منتج محدد، نجيبه من قاعدة البيانات ونضيف تفاصيله
    let productDetails = "";
    if (formData.get("product_id")) {
      try {
        const productId = formData.get("product_id");
        const product = await ProductAPI.getProduct(productId);

        if (product) {
          productDetails =
            `\n📦 *تفاصيل المنتج:*\n` +
            `▫️ *الاسم:* ${product.title}\n` +
            (product.color ? `▫️ *اللون:* ${product.color}\n` : "") +
            (product.dimensions ? `▫️ *الأبعاد:* ${product.dimensions}\n` : "") +
            (product.price ? `▫️ *السعر:* ${product.price} جنيه\n` : "") +
            (product.material ? `▫️ *الخامة:* ${product.material}\n` : "");
        }
      } catch (err) {
        console.error("❌ لم أتمكن من تحميل تفاصيل المنتج:", err);
      }
    }

    // ✅ 3. نص الرسالة النهائي لواتساب – بشكل منظم
    const whatsappMessage =
      `📩 *رسالة جديدة من الموقع*\n\n` +
      `👤 *الاسم:* ${name}\n` +
      `📞 *رقم الهاتف:* ${phone}\n` +
      `📧 *الإيميل:* ${email}\n` +
      `🛠 *الخدمة المطلوبة:* ${service}\n` +
      `💬 *الرسالة:* ${message}` +
      productDetails; // ← لو في تفاصيل منتج تتحط هنا

    // ✅ 4. فتح واتساب بالرقم المطلوب
    const whatsappNumber = "01122871722"; // ← رقمك
    const whatsappURL = `https://wa.me/2${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, "_blank"); // يفتح واتساب في تبويب جديد

    // ✅ 5. تفريغ الفورم بعد الإرسال
    this.reset();
  });
}



// Admin Functions with Database Integration via API
function showAdminLogin() {
  const modal = new bootstrap.Modal(document.getElementById("adminLoginModal"))
  modal.show()

  // Setup login form
  const loginForm = document.getElementById("adminLoginForm")
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault()

      const email = document.getElementById("adminEmail").value
      const password = document.getElementById("adminPassword").value

      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true
        bootstrap.Modal.getInstance(document.getElementById("adminLoginModal")).hide()
        showAdminDashboard()
        showNotification("تم تسجيل الدخول بنجاح!")
      } else {
        showNotification("بيانات الدخول غير صحيحة!")
      }
    }
  }
}

// Admin Dashboard with Database Integration
async function showAdminDashboard() {
  if (!isAdminLoggedIn) {
    showAdminLogin()
    return
  }

  const modal = new bootstrap.Modal(document.getElementById("adminDashboardModal"))
  modal.show()

  // Update admin button
  const adminBtn = document.getElementById("adminBtn")
  if (adminBtn) {
    adminBtn.innerHTML = `
      <i class="fas fa-tachometer-alt"></i>
      <span data-ar="لوحة التحكم" data-en="Dashboard">لوحة التحكم</span>
    `
    adminBtn.onclick = showAdminDashboard
  }

  // Load admin data from database via API
  await loadAdminProducts()
  await updateAdminStats()
  setupAdminFilters()
}

// Load Admin Products from Database via API
async function loadAdminProducts() {
  const container = document.getElementById("adminProductsList")
  if (!container) return

  try {
    console.log("🔄 Loading admin products from database via API...")

    // Show loading
    container.innerHTML = `
      <div class="admin-loading">
        <div class="spinner"></div>
        <p class="mt-3">جاري تحميل المنتجات من قاعدة البيانات...</p>
      </div>
    `

    // Load from database via API
    const products = await ProductAPI.loadProducts()
    console.log("✅ Admin products loaded from database:", products.length)

    setTimeout(() => {
      displayAdminProducts(products)
    }, 500)
  } catch (error) {
    console.error("❌ Error loading admin products from database:", error)
    container.innerHTML = `
      <div class="alert alert-danger">
        <h5>خطأ في تحميل المنتجات</h5>
        <p>حدث خطأ أثناء تحميل المنتجات من قاعدة البيانات: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadAdminProducts()">إعادة المحاولة</button>
      </div>
    `
  }
}

// Display Admin Products from Database
function displayAdminProducts(products) {
  const container = document.getElementById("adminProductsList")
  if (!container) return

  const materialFilter = document.getElementById("adminMaterialFilter")?.value || "all"
  const categoryFilter = document.getElementById("adminCategoryFilter")?.value || "all"

  let filteredProducts = products || []

  if (materialFilter !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.material === materialFilter)
  }
  if (categoryFilter !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === categoryFilter)
  }

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <i class="fas fa-box-open"></i>
        <h4 data-ar="لا توجد منتجات" data-en="No Products Found">لا توجد منتجات في قاعدة البيانات</h4>
        <p data-ar="ابدأ بإضافة منتج جديد" data-en="Start by adding a new product">ابدأ بإضافة منتج جديد</p>
        <button class="btn btn-success" onclick="showAddProductForm()">
          <i class="fas fa-plus me-2"></i>إضافة منتج جديد
        </button>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>إدارة المنتجات (${filteredProducts.length})</h4>
      <button class="btn btn-success" onclick="showAddProductForm()">
        <i class="fas fa-plus me-2"></i>إضافة منتج جديد
      </button>
    </div>
    <div class="admin-search">
      <input type="text" class="form-control" placeholder="${currentLanguage === "ar" ? "البحث في المنتجات..." : "Search products..."}" onkeyup="searchAdminProducts(this.value)">
    </div>
    <div class="admin-product-grid">
      ${filteredProducts.map((product) => createAdminProductCard(product)).join("")}
    </div>
  `
}

// Create Admin Product Card
function createAdminProductCard(product) {
  const title = currentLanguage === "ar" ? product.title : product.title_en || product.title
  const materialText = TRANSLATIONS[currentLanguage][product.material]
  const categoryText = TRANSLATIONS[currentLanguage][product.category]

  // Get first image from images array or use placeholder
  const imageUrl =
    product.img
      // ? product.img
      // : `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(title)}`

  return `
    <div class="admin-product-card d-flex p-3">
      <img src="${imageUrl}" alt="${title}" class="admin-product-image me-3">
      <div class="admin-product-info">
        <h6 class="admin-product-title">${title}</h6>
        <div class="admin-product-meta">
          <span class="admin-badge material-${product.material}">${materialText}</span>
          <span class="admin-badge category">${categoryText}</span>
        </div>
        <small class="text-muted">ID: ${product.id}</small>
      </div>
      <div class="admin-product-actions">
        <button class="admin-action-btn view" onclick="viewProductDetails('${product.id}')">
          <i class="fas fa-eye"></i>
          <span data-ar="عرض" data-en="View">عرض</span>
        </button>
        <button class="admin-action-btn edit" onclick="editProduct('${product.id}')">
          <i class="fas fa-edit"></i>
          <span data-ar="تعديل" data-en="Edit">تعديل</span>
        </button>
        <button class="admin-action-btn delete" onclick="deleteProduct('${product.id}')">
          <i class="fas fa-trash"></i>
          <span data-ar="حذف" data-en="Delete">حذف</span>
        </button>
      </div>
    </div>
  `
}

// Update Admin Stats from Database via API
async function updateAdminStats() {
  try {
    const products = await ProductAPI.loadProducts()
    const totalCount = products.length
    const woodCount = products.filter((p) => p.material === "wood").length
    const aluminumCount = products.filter((p) => p.material === "aluminum").length

    const totalEl = document.getElementById("totalProductsCount")
    const woodEl = document.getElementById("woodProductsCount")
    const aluminumEl = document.getElementById("aluminumProductsCount")

    if (totalEl) totalEl.textContent = totalCount
    if (woodEl) woodEl.textContent = woodCount
    if (aluminumEl) aluminumEl.textContent = aluminumCount
  } catch (error) {
    console.error("❌ Error updating admin stats from database:", error)
  }
}

// Setup Admin Filters
function setupAdminFilters() {
  const materialFilter = document.getElementById("adminMaterialFilter")
  const categoryFilter = document.getElementById("adminCategoryFilter")

  if (materialFilter) {
    materialFilter.onchange = async () => {
      const products = await ProductAPI.loadProducts()
      displayAdminProducts(products)
    }
  }
  if (categoryFilter) {
    categoryFilter.onchange = async () => {
      const products = await ProductAPI.loadProducts()
      displayAdminProducts(products)
    }
  }
}

// Search Admin Products
function searchAdminProducts(query) {
  const cards = document.querySelectorAll(".admin-product-card")
  cards.forEach((card) => {
    const title = card.querySelector(".admin-product-title").textContent.toLowerCase()
    const isVisible = title.includes(query.toLowerCase())
    card.style.display = isVisible ? "flex" : "none"
  })
}

// Show Add Product Form
function showAddProductForm() {
  currentEditingProduct = null

  // Reset form
  const form = document.getElementById("productForm")
  if (form) {
    form.reset()
  }

  // Update modal title
  const titleEl = document.getElementById("productFormTitle")
  if (titleEl) {
    titleEl.innerHTML = `
      <i class="fas fa-plus me-2"></i>
      <span data-ar="إضافة منتج جديد" data-en="Add New Product">إضافة منتج جديد</span>
    `
  }

  const modal = new bootstrap.Modal(document.getElementById("productFormModal"))
  modal.show()

  // Setup form submission
  setupProductForm()
}

// Edit Product from Database via API
async function editProduct(productId) {
  try {
    console.log("🔄 Loading product from database for edit:", productId)

    // Get product from database via API
    const product = await ProductAPI.getProduct(productId)
    console.log("✅ Product loaded from database for edit:", product)

    if (!product) {
      showAdminMessage("المنتج غير موجود في قاعدة البيانات!", "error")
      return
    }

    currentEditingProduct = product

    // Fill form with product data from database
    const fields = {
      title: product.title,
      title_en: product.title_en || "",
      material: product.material,
      category: product.category,
      description_ar: product.description_ar || "",
      description_en: product.description_en || "",
    }

    Object.keys(fields).forEach((fieldName) => {
      const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`)
      if (field) field.value = fields[fieldName]
    })

    // Update modal title
    const titleEl = document.getElementById("productFormTitle")
    if (titleEl) {
      titleEl.innerHTML = `
        <i class="fas fa-edit me-2"></i>
        <span data-ar="تعديل المنتج" data-en="Edit Product">تعديل المنتج</span>
      `
    }

    const modal = new bootstrap.Modal(document.getElementById("productFormModal"))
    modal.show()

    // Setup form submission
    setupProductForm()
  } catch (error) {
    console.error("❌ Error editing product from database:", error)
    showAdminMessage(`حدث خطأ أثناء تحميل بيانات المنتج من قاعدة البيانات: ${error.message}`, "error")
  }
}

// Setup Product Form with Database Integration via API
function setupProductForm() {
  const form = document.getElementById("productForm")
  if (!form) return

  form.onsubmit = async function (e) {
    e.preventDefault()

    console.log("🔄 Submitting product form to database...")

    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = `<span class="loading"></span> جاري الحفظ في قاعدة البيانات...`
    submitBtn.disabled = true

    try {
      const formData = new FormData(this)

      if (currentEditingProduct) {
        console.log("🔄 Updating product in database:", currentEditingProduct.id)
        // Update existing product in database via API
        await ProductAPI.updateProduct(currentEditingProduct.id, formData)
        console.log("✅ Product updated successfully in database")
        showAdminMessage("تم تحديث المنتج بنجاح في قاعدة البيانات!", "success")
      } else {
        console.log("🔄 Adding new product to database")
        // Add new product to database via API
        await ProductAPI.addProduct(formData)
        console.log("✅ Product added successfully to database")
        showAdminMessage("تم إضافة المنتج بنجاح إلى قاعدة البيانات!", "success")
      }

      // Close modal and refresh from database
      bootstrap.Modal.getInstance(document.getElementById("productFormModal")).hide()
      await loadAdminProducts()
      await updateAdminStats()
      await loadProducts() // Refresh main gallery from database
    } catch (error) {
      console.error("❌ Error saving product to database:", error)
      showAdminMessage(`حدث خطأ أثناء حفظ المنتج في قاعدة البيانات: ${error.message}`, "error")
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  }
}

// Delete Product from Database via API
function deleteProduct(productId) {
  productToDelete = productId
  const modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"))
  modal.show()
}

// Confirm Delete Product from Database via API
async function confirmDeleteProduct() {
  if (!productToDelete) return

  try {
    console.log("🔄 Deleting product from database:", productToDelete)
    await ProductAPI.deleteProduct(productToDelete)
    console.log("✅ Product deleted successfully from database")

    showAdminMessage("تم حذف المنتج بنجاح من قاعدة البيانات!", "success")
    bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal")).hide()

    await loadAdminProducts()
    await updateAdminStats()
    await loadProducts() // Refresh main gallery from database
  } catch (error) {
    console.error("❌ Error deleting product from database:", error)
    showAdminMessage(`حدث خطأ أثناء حذف المنتج من قاعدة البيانات: ${error.message}`, "error")
  }

  productToDelete = null
}

// Logout Admin
function logoutAdmin() {
  isAdminLoggedIn = false

  // Reset admin button
  const adminBtn = document.getElementById("adminBtn")
  if (adminBtn) {
    adminBtn.innerHTML = `
      <i class="fas fa-user-shield"></i>
      <span data-ar="إدارة" data-en="Admin">إدارة</span>
    `
    adminBtn.onclick = showAdminLogin
  }

  // Close dashboard
  bootstrap.Modal.getInstance(document.getElementById("adminDashboardModal")).hide()

  showAdminMessage("تم تسجيل الخروج بنجاح!", "success")
}

// Show Admin Message
function showAdminMessage(message, type) {
  const messageEl = document.createElement("div")
  messageEl.className = `admin-message ${type}`
  messageEl.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `
  document.body.appendChild(messageEl)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (messageEl.parentElement) {
      messageEl.remove()
    }
  }, 5000)
}

// Messages System Variables
let adminMessages = []
const currentReplyingMessage = null
const currentMessageFilter = "all"

// Initialize messages system
function initializeMessagesSystem() {
  // Load messages from database via API
  loadMessagesFromAPI()
}

// Load messages from Database via API
// async function loadMessagesFromAPI() {
//   try {
//     if (typeof MessageAPI !== "undefined") {
//       const messages = await MessageAPI.loadMessages()
//       adminMessages = messages
//       console.log("✅ Messages loaded from database:", messages.length)
//     }
//     updateMessageCounts()
//   } catch (error) {
//     console.error("❌ Error loading messages from database:", error)
//     updateMessageCounts()
//   }
// }

// Add new message to Database via API
// async function addMessage(messageData, type = "contact") {
//   const message = {
//     id: Date.now().toString(),
//     type: type, // 'contact' or 'quote'
//     name: messageData.name,
//     phone: messageData.phone,
//     email: messageData.email,
//     service: messageData.service || "",
//     message: messageData.message,
//     productName: messageData.productName || "",
//     quantity: messageData.quantity || "",
//     city: messageData.city || "",
//     timestamp: new Date().toISOString(),
//     status: "unread", // Always unread when new
//     reply: null,
//     replyTimestamp: null,
//   }

//   try {
//     // Save to database via API
//     if (typeof MessageAPI !== "undefined") {
//       if (type === "contact") {
//         await MessageAPI.saveContactMessage(messageData)
//       } else {
//         await MessageAPI.saveQuoteRequest(messageData)
//       }
//       console.log("✅ Message saved to database via API")
//     }
//   } catch (error) {
//     console.error("❌ Error saving message to database:", error)
//     throw error
//   }

//   // Add to local array for immediate display
//   adminMessages.unshift(message)
//   updateMessageCounts()

//   // Show notification to admin if logged in
//   if (isAdminLoggedIn) {
//     showAdminMessage(`رسالة جديدة من ${message.name}`, "info")
//   }

//   return message.id
// }

// Update message counts
function updateMessageCounts() {
  const unreadCount = adminMessages.filter((m) => m.status === "unread").length

  // Update admin message count
  const messageCountEl = document.getElementById("messageCount")
  if (messageCountEl) {
    messageCountEl.textContent = unreadCount
    messageCountEl.style.display = unreadCount > 0 ? "inline" : "none"
  }
}

// Utility functions
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = "alert alert-success position-fixed"
  notification.style.cssText = `
    top: 100px;
    ${currentLanguage === "ar" ? "right" : "left"}: 20px;
    z-index: 9999;
    min-width: 300px;
    animation: slideIn 0.5s ease-out;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    border-radius: 15px;
    border: none;
  `

  notification.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    ${message}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOut 0.5s ease-out"
      setTimeout(() => notification.remove(), 500)
    }
  }, 5000)
}

function showError(message) {
  if (!productsContainer) return

  productsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h5>${TRANSLATIONS[currentLanguage].error}</h5>
        <p>${message}</p>
        <button class="btn btn-primary mt-3" onclick="loadProducts()">
          <i class="fas fa-redo me-2"></i>
          ${TRANSLATIONS[currentLanguage].retry}
        </button>
      </div>
    </div>
  `
}

// Add CSS for animations and loading
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(${currentLanguage === "ar" ? "100%" : "-100%"});
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(${currentLanguage === "ar" ? "100%" : "-100%"});
      opacity: 0;
    }
  }
  
  .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .product-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }

  .product-card.animated {
    opacity: 1;
    transform: translateY(0);
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  .admin-product-card {
    transition: transform 0.2s;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .admin-product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .admin-product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
  }

  .admin-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-right: 5px;
  }

  .admin-badge.material-wood {
    background-color: #8B4513;
    color: white;
  }

  .admin-badge.material-aluminum {
    background-color: #C0C0C0;
    color: black;
  }

  .admin-badge.category {
    background-color: #6c757d;
    color: white;
  }

  .admin-action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    margin: 2px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .admin-action-btn.view {
    background-color: #17a2b8;
    color: white;
  }

  .admin-action-btn.edit {
    background-color: #ffc107;
    color: black;
  }

  .admin-action-btn.delete {
    background-color: #dc3545;
    color: white;
  }

  .admin-action-btn:hover {
    transform: scale(1.05);
  }

  .admin-loading {
    text-align: center;
    padding: 50px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .admin-empty-state {
    text-align: center;
    padding: 50px;
    color: #6c757d;
  }

  .admin-empty-state i {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .admin-search {
    margin-bottom: 20px;
  }

  .admin-product-grid {
    max-height: 500px;
    overflow-y: auto;
  }

  .admin-message {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .admin-message.success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }

  .admin-message.error {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }

  .admin-message.info {
    background-color: #d1ecf1;
    border-color: #bee5eb;
    color: #0c5460;
  }
`
document.head.appendChild(style)

// Global functions for HTML onclick events
window.changeSlide = changeSlide
window.currentSlide = currentSlide
window.changeTestimonial = changeTestimonial
window.resetFilters = resetFilters
window.contactForProduct = contactForProduct
window.viewProductDetails = viewProductDetails
window.contactWhatsApp = contactWhatsApp
window.requestQuote = requestQuote
window.showAdminLogin = showAdminLogin
window.showAdminDashboard = showAdminDashboard
window.showAddProductForm = showAddProductForm
window.editProduct = editProduct
window.deleteProduct = deleteProduct
window.confirmDeleteProduct = confirmDeleteProduct
window.logoutAdmin = logoutAdmin
window.searchAdminProducts = searchAdminProducts
window.loadAdminProducts = loadAdminProducts
window.loadProductsInBackground = loadProductsInBackground // Add this

// Initialize everything when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWebsite)
} else {
  initializeWebsite()
}
